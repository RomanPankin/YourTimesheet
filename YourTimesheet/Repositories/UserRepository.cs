using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using YourTimesheet.Helpers;
using YourTimesheet.Models;
using YourTimesheet.Services;
using YourTimesheet.Utils;

namespace YourTimesheet.Repositories
{
    public class UserRepository : IUserRepository
    {
        private IDatabaseService _databaseService;

        private static readonly int MinPasswordLength = 8;

        public UserRepository(IDatabaseService databaseService)
        {
            _databaseService = databaseService;
        }

        public async Task<User> Login(User user)
        {
            if (user == null || string.IsNullOrWhiteSpace(user.Email) || string.IsNullOrWhiteSpace(user.Pwd))
            {
                throw new Exception(Messages.EmptyEmailOrPassword);
            }

            try
            {
                using (var connection = await _databaseService.GetConnection())
                {
                    using (var stmt = connection.GetStatement())
                    {
                        stmt.SQL =
                            "SELECT U.USER_ID, S.USER_PREFERED_WORKING_HOURS, S.USER_ROLE_ID, R.ROLE_NAME, R.MANAGE_USER_LIST, R.MANAGE_USER_TIMESHEET " +
                            "FROM USERS U " +
                            "LEFT JOIN USER_SETTINGS S ON U.USER_ID = S.USER_ID " +
                            "LEFT JOIN ROLES R ON S.USER_ROLE_ID = R.ROLE_ID " +
                            "WHERE U.USER_LOGIN = @login AND U.USER_PASSWORD = @password";
                        stmt.Parameters = new Dictionary<string, object>()
                        {
                            { "@login", user.Email },
                            { "@password", UserHelper.GetPasswordHash(user.Pwd) }
                        };

                        var rows = await stmt.ExecuteReader();
                        if (rows.Count() != 1)
                        {
                            throw new Exception();
                        }

                        var row = rows.FirstOrDefault();
                        return new User()
                        {
                            Id = row[0] == null ? 0 : (int)row[0],
                            Email = user.Email,
                            Settings = new Settings()
                            {
                                PreferredWorkingHoursPerDay = row[1] == null ? 0 : (int)row[1],
                                Role = new Role()
                                {
                                    Id = row[2] == null ? 0 : (int)row[2],
                                    Name = (string)row[3],
                                    ManageUserList = row[4] == null ? false : (int)row[4] != 0,
                                    ManageUserTimesheet = row[5] == null ? false : (int)row[5] != 0
                                }
                            }
                        };
                    }
                }
            }
            catch (Exception)
            {
                throw new Exception(string.Format(Messages.UserCantBeAuthorized, user.Email));
            }
        }

        public async Task<User> RegisterUser(User user)
        {
            ValidateUser(user);

            try
            {
                using (var connection = await _databaseService.GetConnection())
                {
                    int userId = 0;

                    using (var stmt = connection.GetStatement())
                    {
                        stmt.SQL = "INSERT INTO USERS(USER_LOGIN, USER_PASSWORD) VALUES(@login, @password)";
                        stmt.Parameters = new Dictionary<string, object>()
                        {
                            { "@login", user.Email },
                            { "@password", UserHelper.GetPasswordHash(user.Pwd) }
                        };

                        var affectedRows = await stmt.Execute();
                        if (affectedRows != 1)
                        {
                            throw new Exception();
                        }

                        userId = connection.LastInsertRowId;
                    }

                    using (var stmt = connection.GetStatement())
                    {
                        stmt.SQL = "INSERT INTO USER_SETTINGS(USER_ID, USER_PREFERED_WORKING_HOURS, USER_ROLE_ID) VALUES(@userId, 0, 1)";
                        stmt.Parameters = new Dictionary<string, object>()
                        {
                            { "@userId", userId }
                        };
                        var affectedRows = await stmt.Execute();
                        if (affectedRows != 1)
                        {
                            throw new Exception();
                        }

                        userId = connection.LastInsertRowId;
                    }

                    return await GetUser(userId);
                }
            }
            catch (Exception)
            {
                throw new Exception(string.Format(Messages.CantCreateUser, user.Email));
            }
        }

        public async Task<bool> DeleteUser(int currentUser, int userToDelete)
        {
            if (currentUser != userToDelete)
            {
                var user = await GetUser(currentUser);
                if (user == null)
                {
                    throw new Exception(Messages.UserDoesntExist);
                }

                if (user.Settings?.Role?.ManageUserList != true)
                {
                    throw new Exception(Messages.UserDoesntHavePermission);
                }
            }

            using (var connection = await _databaseService.GetConnection())
            {
                using (var stmt = connection.GetStatement())
                {
                    stmt.SQL = "DELETE FROM TIMESHEET WHERE USER_ID=@userId";
                    stmt.Parameters = new Dictionary<string, object>()
                    {
                        { "@userId", userToDelete }
                    };

                    await stmt.Execute();
                }

                using (var stmt = connection.GetStatement())
                {
                    stmt.SQL = "DELETE FROM USER_SETTINGS WHERE USER_ID=@userId";
                    stmt.Parameters = new Dictionary<string, object>()
                    {
                        { "@userId", userToDelete }
                    };

                    await stmt.Execute();
                }

                using (var stmt = connection.GetStatement())
                {
                    stmt.SQL = "DELETE FROM USERS WHERE USER_ID=@userId";
                    stmt.Parameters = new Dictionary<string, object>()
                    {
                        { "@userId", userToDelete }
                    };

                    var affectedRows = await stmt.Execute();
                    return affectedRows > 0;
                }
            }
        }

        public async Task<User> GetUser(int userId)
        {
            if (userId <= 0)
            {
                return null;
            }

            using (var connection = await _databaseService.GetConnection())
            {
                using (var stmt = connection.GetStatement())
                {
                    stmt.SQL =
                        "SELECT U.USER_ID, U.USER_LOGIN, S.USER_PREFERED_WORKING_HOURS, S.USER_ROLE_ID, R.ROLE_NAME, R.MANAGE_USER_LIST, R.MANAGE_USER_TIMESHEET " +
                        "FROM USERS U " +
                        "LEFT JOIN USER_SETTINGS S ON U.USER_ID = S.USER_ID " +
                        "LEFT JOIN ROLES R ON S.USER_ROLE_ID = R.ROLE_ID " +
                        "WHERE U.USER_ID=@userId";
                    stmt.Parameters = new Dictionary<string, object>
                    {
                        { "@userId", userId }
                    };

                    var rows = await stmt.ExecuteReader();
                    if (rows.Count() != 1)
                    {
                        throw new Exception();
                    }

                    var row = rows.FirstOrDefault();
                    return new User()
                    {
                        Id = row[0] == null ? 0 : (int)row[0],
                        Email = (string)row[1],
                        Settings = new Settings()
                        {
                            PreferredWorkingHoursPerDay = row[2] == null ? 0 : (int)row[2],
                            Role = new Role()
                            {
                                Id = row[3] == null ? 0 : (int)row[3],
                                Name = (string)row[4],
                                ManageUserList = row[5] == null ? false : (int)row[5] != 0,
                                ManageUserTimesheet = row[6] == null ? false : (int)row[6] != 0
                            }
                        }
                    };
                }
            }
        }

        public async Task<bool> UpdatePassword(int currentUser, int userId, string newPassword)
        {
            if (currentUser != userId)
            {
                var user = await GetUser(currentUser);
                if (user == null)
                {
                    throw new Exception(Messages.UserDoesntExist);
                }

                if (user.Settings?.Role?.ManageUserList != true)
                {
                    throw new Exception(Messages.UserDoesntHavePermission);
                }
            }

            newPassword = ValidatePassword(newPassword);

            try
            {
                using (var connection = await _databaseService.GetConnection())
                {
                    using (var stmt = connection.GetStatement())
                    {
                        stmt.SQL =
                            "UPDATE USERS SET USER_PASSWORD=@password " +
                            "WHERE USER_ID=@userId";
                        stmt.Parameters = new Dictionary<string, object>
                        {
                            { "@userId", userId },
                            { "@password", UserHelper.GetPasswordHash(newPassword) }
                        };

                        var affectedRows = await stmt.Execute();
                        if (affectedRows == 1)
                        {
                            return true;
                        }
                    }
                }
            }
            catch (Exception)
            {
                throw new Exception(Messages.CantUpdatePassword);
            }

            return false;
        }

        public async Task<Settings> UpdateSettings(int currentUser, int userId, Settings settings)
        {
            if (settings == null)
            {
                throw new Exception(Messages.NoItemToRecord);
            }

            if (settings.PreferredWorkingHoursPerDay < Constants.MinPreferedWorkingHours ||
                settings.PreferredWorkingHoursPerDay > Constants.MaxPreferedWorkingHours)
            {
                throw new Exception(string.Format(Messages.TimesheetWrongWorkingHoursRange, Constants.MinPreferedWorkingHours, Constants.MaxPreferedWorkingHours));
            }

            if (settings.Role == null)
            {
                throw new Exception(Messages.SettingEmptyRole);
            }

            if (currentUser != userId)
            {
                var user = await GetUser(currentUser);
                if (user == null)
                {
                    throw new Exception(Messages.UserDoesntExist);
                }

                if (user.Settings?.Role?.ManageUserList != true)
                {
                    throw new Exception(Messages.UserDoesntHavePermission);
                }
            }

            try
            {
                using (var connection = await _databaseService.GetConnection())
                {
                    using (var stmt = connection.GetStatement())
                    {
                        var workingHours = settings.PreferredWorkingHoursPerDay;
                        var roleId = settings.Role?.Id ?? 0;

                        stmt.SQL =
                            "REPLACE INTO USER_SETTINGS(USER_ID, USER_PREFERED_WORKING_HOURS, USER_ROLE_ID) " +
                            "VALUES(@userId, @workingHours, @roleId)";
                        stmt.Parameters = new Dictionary<string, object>
                        {
                            { "@userId", userId },
                            { "@workingHours", workingHours },
                            { "@roleId", roleId }
                        };
                        var affectedRows = await stmt.Execute();
                        if (affectedRows != 1)
                        {
                            throw new Exception(Messages.CantUpdateRecord);
                        }

                        var role = await GetRole(connection, roleId);
                        if (role == null)
                        {
                            throw new Exception();
                        }

                        return new Settings()
                        {
                            PreferredWorkingHoursPerDay = workingHours,
                            Role = role
                        };
                    }
                }
            }
            catch (Exception)
            {
                throw new Exception(Messages.CantUpdateSettings);
            }
        }

        public async Task<IEnumerable<Role>> GetAllRoles()
        {
            List<Role> roles = new List<Role>();

            using (var connection = await _databaseService.GetConnection())
            {
                using (var stmt = connection.GetStatement())
                {
                    stmt.SQL = "SELECT ROLE_ID, ROLE_NAME, MANAGE_USER_LIST, MANAGE_USER_TIMESHEET FROM ROLES";

                    var rows = await stmt.ExecuteReader();
                    foreach (var row in rows)
                    {
                        roles.Add(new Role()
                        {
                            Id = row[0] == null ? 0 : (int)row[0],
                            Name = (string)row[1],
                            ManageUserList = row[2] == null ? false : (int)row[2] != 0,
                            ManageUserTimesheet = row[3] == null ? false : (int)row[3] != 0
                        });
                    }
                }
            }

            return roles;
        }

        public async Task<Role> GetRole(IDatabaseConnection connection, int roleId)
        {
            using (var stmt = connection.GetStatement())
            {
                stmt.SQL =
                    "SELECT ROLE_ID, ROLE_NAME, MANAGE_USER_LIST, MANAGE_USER_TIMESHEET " +
                    "FROM ROLES " +
                    "WHERE ROLE_ID=@roleId";
                stmt.Parameters = new Dictionary<string, object>
                {
                    { "@roleId", roleId }
                };

                var rows = await stmt.ExecuteReader();
                if (rows.Count() != 1)
                {
                    return null;
                }

                var row = rows.FirstOrDefault();
                return new Role()
                {
                    Id = row[0] == null ? 0 : (int)row[0],
                    Name = (string)row[1],
                    ManageUserList = row[2] == null ? false : (int)row[2] != 0,
                    ManageUserTimesheet = row[3] == null ? false : (int)row[3] != 0,
                };
            }
        }

        public async Task<IEnumerable<User>> GetAllUsers(int userId)
        {
            var user = await GetUser(userId);
            if (user == null)
            {
                throw new Exception(Messages.UserDoesntExist);
            }

            if (user.Settings?.Role?.ManageUserList != true)
            {
                throw new Exception(Messages.UserDoesntHavePermission);
            }

            List<User> result = new List<User>();
            using (var connection = await _databaseService.GetConnection())
            {
                using (var stmt = connection.GetStatement())
                {
                    stmt.SQL =
                        "SELECT U.USER_ID, U.USER_LOGIN, S.USER_PREFERED_WORKING_HOURS, S.USER_ROLE_ID, R.ROLE_NAME, R.MANAGE_USER_LIST, R.MANAGE_USER_TIMESHEET " +
                        "FROM USERS U " +
                        "LEFT JOIN USER_SETTINGS S ON U.USER_ID = S.USER_ID " +
                        "LEFT JOIN ROLES R ON S.USER_ROLE_ID = R.ROLE_ID ";

                    var rows = await stmt.ExecuteReader();
                    foreach (var row in rows)
                    {
                        result.Add(new User()
                        {
                            Id = row[0] == null ? 0 : (int)row[0],
                            Email = (string)row[1],
                            Settings = new Settings()
                            {
                                PreferredWorkingHoursPerDay = row[2] == null ? 0 : (int)row[2],
                                Role = new Role()
                                {
                                    Id = row[3] == null ? 0 : (int)row[3],
                                    Name = (string)row[4],
                                    ManageUserList = row[5] == null ? false : (int)row[5] != 0,
                                    ManageUserTimesheet = row[6] == null ? false : (int)row[6] != 0
                                }
                            }
                        });
                    }
                }
            }

            return result;
        }

        private void ValidateUser(User user)
        {
            if (user == null ||
                string.IsNullOrWhiteSpace(user.Email) ||
                string.IsNullOrWhiteSpace(user.Pwd))
            {
                throw new Exception(Messages.EmptyEmailOrPassword);
            }

            if (!UserHelper.VerifyEmail(user.Email))
            {
                throw new Exception(Messages.WrongEmailFormat);
            }

            user.Pwd = ValidatePassword(user.Pwd);
        }

        private string ValidatePassword(string password)
        {
            if (string.IsNullOrWhiteSpace(password))
            {
                throw new Exception(Messages.EmptyEmailOrPassword);
            }

            password = password.Trim();
            if (password.Length < MinPasswordLength)
            {
                throw new Exception(string.Format(Messages.ShortPassword, MinPasswordLength));
            }

            return password;
        }
    }
}

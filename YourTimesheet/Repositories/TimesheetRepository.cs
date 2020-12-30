using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Data.SQLite;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using YourTimesheet.Models;
using YourTimesheet.Services;
using YourTimesheet.Utils;

namespace YourTimesheet.Repositories
{
    public class TimesheetRepository: ITimesheetRepository
    {
        private IDatabaseService _databaseService;
        private IUserRepository _userRepository;

        public TimesheetRepository(IDatabaseService databaseService,
                                   IUserRepository userRepository)
        {
            _databaseService = databaseService;
            _userRepository = userRepository;
        }

        public async Task<TimesheetItem> Add(int userId, TimesheetItem item)
        {
            ValidateTimesheetItem(item);
            User user = await GetUser(userId);

            using (var connection = await _databaseService.GetConnection())
            {
                using (var stmt = connection.GetStatement())
                {
                    stmt.SQL =
                        "INSERT INTO TIMESHEET(USER_ID, WORKING_DATE, WORKING_HOURS, WORKING_DESCRIPTION) " +
                        "VALUES(@userId, @workingDate, @workingHours, @workingDesciption)";
                    stmt.Parameters = new Dictionary<string, object>()
                    {
                        { "@userId", userId },
                        { "@workingDate", item.Date },
                        { "@workingHours", item.DurationInHours },
                        { "@workingDesciption", item.Description }
                    };

                    var affectedRows = await stmt.Execute();
                    if (affectedRows != 1)
                    {
                        throw new Exception(Messages.CantUpdateRecord);
                    }

                    return new TimesheetItem()
                    {
                        Id = connection.LastInsertRowId,
                        Description = item.Description,
                        Date = item.Date,
                        DurationInHours = item.DurationInHours,
                        User = user.Email
                    };
                }
            }
        }

        public async Task<TimesheetItem> Update(int userId, TimesheetItem item)
        {
            ValidateTimesheetItem(item);
            User user = await GetUser(userId);

            using (var connection = await _databaseService.GetConnection())
            {
                using (var stmt = connection.GetStatement())
                {
                    stmt.SQL = 
                        "UPDATE TIMESHEET " +
                        "SET WORKING_DATE=@workingDate, WORKING_HOURS=@workingHours, WORKING_DESCRIPTION=@workingDesciption " +
                        "WHERE (USER_ID=@userId OR @canManageTimesheet=1) AND TIMESHEET_ID=@timesheetId";
                    stmt.Parameters = new Dictionary<string, object>()
                    {
                        { "@workingDate", item.Date },
                        { "@workingHours", item.DurationInHours },
                        { "@workingDesciption", item.Description },
                        { "@userId", userId },
                        { "@timesheetId", item.Id },
                        { "@canManageTimesheet", user.Settings?.Role?.ManageUserTimesheet == true ? 1 : 0 }
                    };

                    var affectedRows = await stmt.Execute();
                    if (affectedRows != 1)
                    {
                        throw new Exception(Messages.CantUpdateRecord);
                    }

                    return new TimesheetItem()
                    {
                        Id = item.Id,
                        Description = item.Description,
                        Date = item.Date,
                        DurationInHours = item.DurationInHours,
                        User = item.User
                    };
                }
            }
        }

        public async Task<bool> Delete(int userId, int timesheetId)
        {
            User user = await GetUser(userId);

            using (var connection = await _databaseService.GetConnection())
            {
                using (var stmt = connection.GetStatement())
                {
                    stmt.SQL =
                        "DELETE FROM TIMESHEET " +
                        "WHERE (USER_ID=@userId OR @canManageTimesheet=1) AND TIMESHEET_ID=@timesheetId";
                    stmt.Parameters = new Dictionary<string, object>()
                    {
                        { "@userId", userId },
                        { "@timesheetId", timesheetId },
                        { "@canManageTimesheet", user.Settings?.Role?.ManageUserTimesheet == true ? 1 : 0 }
                    };

                    var affectedRows = await stmt.Execute();
                    return affectedRows > 0;
                }
            }
        }

        public async Task<IEnumerable<TimesheetItem>> List(int userId, DateTime from, DateTime to)
        {
            User user = await GetUser(userId);

            List<TimesheetItem> result = new List<TimesheetItem>();

            using (var connection = await _databaseService.GetConnection())
            {
                using (var stmt = connection.GetStatement())
                {
                    stmt.SQL =
                        "SELECT T.TIMESHEET_ID, T.WORKING_DATE, T.WORKING_HOURS, T.WORKING_DESCRIPTION, U.USER_LOGIN " +
                        "FROM TIMESHEET T " +
                        "LEFT JOIN USERS U ON U.USER_ID=T.USER_ID " +
                        "WHERE (T.USER_ID=@userId OR @canManageTimesheet=1) " +
                            "AND T.WORKING_DATE>=@from " +
                            "AND T.WORKING_DATE<=@to";
                    stmt.Parameters = new Dictionary<string, object>()
                    {
                        { "@userId", userId },
                        { "@canManageTimesheet", user.Settings?.Role?.ManageUserTimesheet == true ? 1 : 0 },
                        { "@from", from },
                        { "@to", to }
                    };

                    var rows = await stmt.ExecuteReader();
                    foreach (var row in rows)
                    {
                        result.Add(new TimesheetItem()
                        {
                            Id = row[0] == null ? 0 : (int)row[0],
                            Date = row[1] == null ? DateTime.MinValue : DateTime.Parse((string)row[1]),
                            DurationInHours = row[2] == null ? 0 : (int)row[2],
                            Description = (string)row[3],
                            User = (string)row[4]
                        });
                    }
                }
            }

            return result;
        }

        public async Task<byte[]> ExportHTML(int userId, DateTime from, DateTime to)
        {
            var items = (await List(userId, from, to))
                .GroupBy(x => new { x.Date, x.User })
                .OrderBy(x => x.Key.Date);

            MemoryStream memory = new MemoryStream();
            using (var writer = new StreamWriter(memory))
            {
                writer.Write($"<html>");
                writer.Write($"<head>");
                writer.Write($"<title>Exported data</title>");
                writer.Write($"<style>{Constants.HtmlStyles}</style>");
                writer.Write($"</head>");
                writer.Write($"<body>");
                writer.Write($"<div class='data'>");
                writer.Write($"<table>");
                writer.Write($"<tr><th>User</th><th>Date</th><th>Hours</th><th>Description</th></tr>");

                foreach (var group in items)
                {
                    writer.Write($"<tr>");
                    writer.Write($"<td>{HttpUtility.HtmlEncode(group.Key.User)}</td>");
                    writer.Write($"<td>{HttpUtility.HtmlEncode(group.Key.Date.ToString("yyyy-MM-dd"))}</td>");

                    int totalTime = group.Sum(x => x.DurationInHours);

                    writer.Write($"<td>{HttpUtility.HtmlEncode(totalTime)}</td>");
                    writer.Write($"<td>");
                    writer.Write($"<ul>");

                    foreach (var item in group)
                    {
                        writer.Write($"<li>{HttpUtility.HtmlEncode(item.Description)}</li>");
                    }

                    writer.Write($"</ul>");
                    writer.Write($"</td>");
                    writer.Write($"</tr>");
                }

                writer.Write($"</table>");
                writer.Write($"</div>");
                writer.Write($"</body>");
                writer.Write($"</html>");
            }

            return memory.ToArray();
        }

        private void ValidateTimesheetItem(TimesheetItem item)
        {
            if (item == null)
            {
                throw new Exception(Messages.NoItemToRecord);
            }

            if (item.Date == DateTime.MinValue)
            {
                throw new Exception(Messages.TimesheetWrongDate);
            }

            if (string.IsNullOrWhiteSpace(item.Description))
            {
                throw new Exception(Messages.TimesheetWrongDescription);
            }

            if (item.DurationInHours < Constants.MinWorkingHours || item.DurationInHours > Constants.MaxWorkingHours)
            {
                throw new Exception(string.Format(Messages.TimesheetWrongWorkingHoursRange, Constants.MinWorkingHours, Constants.MaxWorkingHours));
            }
        }

        private async Task<User> GetUser(int userId)
        {
            User user = await _userRepository.GetUser(userId);
            if (user == null)
            {
                throw new Exception(Messages.UserDoesntExist);
            }

            return user;
        }
    }
}

using System.Collections.Generic;
using System.Threading.Tasks;
using YourTimesheet.Models;

namespace YourTimesheet.Repositories
{
    public interface IUserRepository
    {
        Task<User> Login(User user);
        Task<User> RegisterUser(User user);
        Task<User> GetUser(int userId);
        Task<bool> DeleteUser(int currentUser, int userToDelete);
        Task<bool> UpdatePassword(int currentUser, int userId, string newPassword);
        Task<Settings> UpdateSettings(int currentUser, int userId, Settings settings);
        Task<IEnumerable<Role>> GetAllRoles();
        Task<IEnumerable<User>> GetAllUsers(int userId);
    }
}

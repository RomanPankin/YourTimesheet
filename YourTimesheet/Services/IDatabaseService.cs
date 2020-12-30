using System;
using System.Threading.Tasks;

namespace YourTimesheet.Services
{
    public interface IDatabaseService
    {
        Task<IDatabaseConnection> GetConnection();
    }
}

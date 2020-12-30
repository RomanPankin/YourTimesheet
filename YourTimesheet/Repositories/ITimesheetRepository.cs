using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using YourTimesheet.Models;

namespace YourTimesheet.Repositories
{
    public interface ITimesheetRepository
    {
        Task<TimesheetItem> Add(int userId, TimesheetItem item);
        Task<TimesheetItem> Update(int userId, TimesheetItem item);
        Task<bool> Delete(int userId, int timesheetId);
        Task<IEnumerable<TimesheetItem>> List(int userId, DateTime from, DateTime to);
        Task<byte[]> ExportHTML(int userId, DateTime from, DateTime to);
    }
}

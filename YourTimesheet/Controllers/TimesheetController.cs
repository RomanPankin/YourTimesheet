using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using YourTimesheet.Helpers;
using YourTimesheet.Models;
using YourTimesheet.Repositories;
using YourTimesheet.Services;

namespace YourTimesheet.Controllers
{
    [Route("api/timesheet")]
    [ApiController]
    public class TimesheetController : ControllerBase
    {
        private readonly ITimesheetRepository _timesheetRepository;
        private readonly ISessionService _sessionService;

        public TimesheetController(ITimesheetRepository timesheetRepository,
                                   ISessionService sessionService)
        {
            _timesheetRepository = timesheetRepository;
            _sessionService = sessionService;
        }

        [HttpPost("add")]
        public async Task<ActionResult<IEnumerable<TimesheetItem>>> Add(TimesheetItem item)
        {
            if (item == null) throw new ArgumentNullException();

            var sessionData = _sessionService.GetSession(HttpContext);
            if (sessionData == null)
            {
                return Unauthorized();
            }

            return Ok(await _timesheetRepository.Add(sessionData.UserId, item));
        }

        [HttpPost("update")]
        public async Task<ActionResult<IEnumerable<TimesheetItem>>> Update(TimesheetItem item)
        {
            if (item == null) throw new ArgumentNullException();

            var sessionData = _sessionService.GetSession(HttpContext);
            if (sessionData == null)
            {
                return Unauthorized();
            }

            return Ok(await _timesheetRepository.Update(sessionData.UserId, item));
        }

        [HttpDelete("delete/{timesheetId}")]
        public async Task<ActionResult<bool>> Delete(int timesheetId)
        {
            var sessionData = _sessionService.GetSession(HttpContext);
            if (sessionData == null)
            {
                return Unauthorized();
            }

            return Ok(await _timesheetRepository.Delete(sessionData.UserId, timesheetId));
        }

        [HttpGet("list/{from}/{to}")]
        public async Task<ActionResult<IEnumerable<TimesheetItem>>> List(string from, string to)
        {
            var sessionData = _sessionService.GetSession(HttpContext);
            if (sessionData == null)
            {
                return Unauthorized();
            }

            DateTime fromDate = DateHelper.ParseDate(from, DateTime.MinValue);
            DateTime toDate = DateHelper.ParseDate(to, DateTime.MaxValue);

            return Ok(await _timesheetRepository.List(sessionData.UserId, fromDate, toDate));
        }

        [HttpGet("export/{from}/{to}")]
        public async Task<ActionResult<IEnumerable<TimesheetItem>>> Export(string from, string to)
        {
            var sessionData = _sessionService.GetSession(HttpContext);
            if (sessionData == null)
            {
                return Unauthorized();
            }

            DateTime fromDate = DateHelper.ParseDate(from, DateTime.MinValue);
            DateTime toDate = DateHelper.ParseDate(to, DateTime.MaxValue);

            var bytes = await _timesheetRepository.ExportHTML(sessionData.UserId, fromDate, toDate);
            return new FileStreamResult(new MemoryStream(bytes), "application/html")
            {
                FileDownloadName = "export.html"
            };
        }
    }
}

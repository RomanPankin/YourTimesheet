using Microsoft.AspNetCore.Http;
using YourTimesheet.Models;

namespace YourTimesheet.Services
{
    public interface ISessionService
    {
        SessionData GetSession(HttpContext context);
        void SetSession(HttpContext context, SessionData sessionData);
    }
}

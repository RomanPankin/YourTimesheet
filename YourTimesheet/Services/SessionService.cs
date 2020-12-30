using Microsoft.AspNetCore.Http;
using System.Text.Json;
using YourTimesheet.Models;

namespace YourTimesheet.Services
{
    public class SessionService: ISessionService
    {
        public static readonly string SessionName = "SessionName";

        public SessionData GetSession(HttpContext context)
        {
            var data = context.Session.GetString(SessionName);
            if (data == null)
            {
                return null;
            }

            return JsonSerializer.Deserialize<SessionData>(data);
        }

        public void SetSession(HttpContext context, SessionData sessionData)
        {
            if (sessionData == null)
            {
                context.Session.Clear();
            }
            else
            {
                context.Session.SetString(SessionName, JsonSerializer.Serialize(sessionData));
            }
        }
    }
}

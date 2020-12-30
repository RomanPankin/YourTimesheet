using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using YourTimesheet.Models;
using YourTimesheet.Repositories;
using YourTimesheet.Services;

namespace YourTimesheet.Controllers
{
    [ApiController]
    [Route("api/user")]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly ISessionService _sessionService;

        public UserController(IUserRepository userRepository,
                              ISessionService sessionService)
        {
            _userRepository = userRepository;
            _sessionService = sessionService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<User>> RegisterUser(User user)
        {
            if (user == null) throw new ArgumentNullException();

            user = await _userRepository.RegisterUser(user);
            if (user != null)
            {
                _sessionService.SetSession(HttpContext, new SessionData() { UserId = user.Id });
            }

            return Ok(user);
        }

        [HttpPost("login")]
        public async Task<ActionResult<User>> Login(User user)
        {
            try
            {
                if (user == null) throw new ArgumentNullException();

                user = await _userRepository.Login(user);
                _sessionService.SetSession(HttpContext, user?.Id > 0 ? new SessionData() { UserId = user.Id } : null);

                return Ok(user);
            }
            catch (Exception)
            {
                _sessionService.SetSession(HttpContext, null);
                throw;
            }
        }

        [HttpDelete]
        [Route("logout")]
        public ActionResult<bool> Logout()
        {
            var sessionData = _sessionService.GetSession(HttpContext);
            if (sessionData != null)
            {
                _sessionService.SetSession(HttpContext, null);
            }

            return Ok(sessionData != null);
        }

        [HttpGet]
        [Route("get")]
        public async Task<ActionResult<User>> GetUser()
        {
            var sessionData = _sessionService.GetSession(HttpContext);
            return Ok(sessionData == null ? null : await _userRepository.GetUser(sessionData.UserId));
        }

        [HttpDelete]
        [Route("delete/{userId}")]
        public async Task<ActionResult<bool>> DeleteUser(int userId)
        {
            var sessionData = _sessionService.GetSession(HttpContext);
            if (sessionData == null)
            {
                return Unauthorized();
            }

            return Ok(await _userRepository.DeleteUser(sessionData.UserId, userId));
        }

        [HttpPost("updatesettings")]
        public async Task<ActionResult<Settings>> UpdateSettings(Settings settings)
        {
            if (settings == null) throw new ArgumentNullException();

            var sessionData = _sessionService.GetSession(HttpContext);
            if (sessionData == null)
            {
                return Unauthorized();
            }

            return Ok(await _userRepository.UpdateSettings(sessionData.UserId, sessionData.UserId, settings));
        }

        [HttpPost("updatesettings/{userId}")]
        public async Task<ActionResult<Settings>> UpdateSettings(Settings settings, int userId)
        {
            if (settings == null) throw new ArgumentNullException();

            var sessionData = _sessionService.GetSession(HttpContext);
            if (sessionData == null)
            {
                return Unauthorized();
            }

            return Ok(await _userRepository.UpdateSettings(sessionData.UserId, userId, settings));
        }

        [HttpPost("updatepassword")]
        public async Task<ActionResult<bool>> UpdatePassword(User user)
        {
            if (user == null) throw new ArgumentNullException();

            var sessionData = _sessionService.GetSession(HttpContext);
            if (sessionData == null)
            {
                return Unauthorized();
            }

            return Ok(await _userRepository.UpdatePassword(sessionData.UserId, sessionData.UserId, user.Pwd));
        }

        [HttpPost("updatepassword/{userId}")]
        public async Task<ActionResult<bool>> UpdatePassword(User user, int userId)
        {
            if (user == null) throw new ArgumentNullException();

            var sessionData = _sessionService.GetSession(HttpContext);
            if (sessionData == null)
            {
                return Unauthorized();
            }

            return Ok(await _userRepository.UpdatePassword(sessionData.UserId, userId, user.Pwd));
        }

        [HttpGet("roles")]
        public async Task<ActionResult<Settings>> GetAllRoles()
        {
            return Ok(await _userRepository.GetAllRoles());
        }

        [HttpGet("list")]
        public async Task<ActionResult<Settings>> GetAllUsers()
        {
            var sessionData = _sessionService.GetSession(HttpContext);
            if (sessionData == null)
            {
                return Unauthorized();
            }

            return Ok(await _userRepository.GetAllUsers(sessionData.UserId));
        }
    }
}

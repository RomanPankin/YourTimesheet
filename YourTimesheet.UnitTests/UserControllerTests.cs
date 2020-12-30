using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System;
using System.Threading.Tasks;
using Xunit;
using YourTimesheet.Controllers;
using YourTimesheet.Models;
using YourTimesheet.Repositories;
using YourTimesheet.Services;

namespace YourTimesheet.UnitTests
{
    public class UserControllerTests
    {
        private readonly Mock<IUserRepository> _userRepository;
        private readonly Mock<ISessionService> _sessionService;
        private readonly UserController _userController;

        private readonly User _testUser = new User()
        {
            Id = 1
        };
        private readonly SessionData _testSession = new SessionData()
        {
            UserId = 1
        };

        public UserControllerTests()
        {
            _userRepository = new Mock<IUserRepository>();
            _sessionService = new Mock<ISessionService>();
            _sessionService.Setup(x => x.GetSession(It.IsAny<HttpContext>()))
                .Returns((SessionData)null);

            _userController = new UserController(_userRepository.Object, _sessionService.Object);
        }

        [Fact]
        public async Task RegisterUser_WorksUnauthorized()
        {
            await _userController.RegisterUser(new User());

            _sessionService.Verify(x => x.GetSession(It.IsAny<HttpContext>()), Times.Never);
        }

        [Fact]
        public async Task RegisterUser_Successfull_ChangesSession()
        {
            _userRepository.Setup(x => x.RegisterUser(It.IsAny<User>()))
                .Returns(Task.FromResult(_testUser));

            await _userController.RegisterUser(new User());

            _sessionService.Verify(x => x.SetSession(
                It.IsAny<HttpContext>(),
                It.Is<SessionData>(x => x != null)
            ), Times.Once);
        }

        [Fact]
        public async Task RegisterUser_Unsuccessfull_SessionUnchanged()
        {
            _userRepository.Setup(x => x.RegisterUser(It.IsAny<User>()))
                .Returns(Task.FromResult<User>(null));

            await _userController.RegisterUser(new User());

            _sessionService.Verify(x => x.SetSession(
                It.IsAny<HttpContext>(),
                It.IsAny<SessionData>()
            ), Times.Never);
        }

        [Fact]
        public async Task RegisterUser_CallsRepository()
        {
            await _userController.RegisterUser(_testUser);

            _userRepository.Verify(x => x.RegisterUser(_testUser), Times.Once);
        }

        [Fact]
        public async Task RegisterUser_ReturnValue()
        {
            _userRepository.Setup(x => x.RegisterUser(It.IsAny<User>()))
                .Returns(Task.FromResult(_testUser));

            var result = (User)((OkObjectResult)(await _userController.RegisterUser(new User())).Result).Value;
            Assert.Equal(_testUser, result);
        }

        [Fact]
        public async Task RegisterUser_ExceptionRaised_PassesException()
        {
            _userRepository.Setup(x => x.RegisterUser(It.IsAny<User>()))
               .Throws(new Exception());

            await Assert.ThrowsAnyAsync<Exception>(() => _userController.RegisterUser(new User()));
        }

        [Fact]
        public async Task RegisterUser_NullPassed_ExceptionRaised()
        {
            await Assert.ThrowsAnyAsync<ArgumentNullException>(() => _userController.RegisterUser(null));
        }

        [Fact]
        public async Task Login_WorksUnauthorized()
        {
            await _userController.Login(new User());

            _sessionService.Verify(x => x.GetSession(It.IsAny<HttpContext>()), Times.Never);
        }

        [Fact]
        public async Task Login_Successful_ChangesSession()
        {
            _userRepository.Setup(x => x.Login(It.IsAny<User>()))
                .Returns(Task.FromResult(_testUser));

            await _userController.Login(new User());

            _sessionService.Verify(x => x.SetSession(
                It.IsAny<HttpContext>(),
                It.Is<SessionData>(x => x != null)
            ), Times.Once);
        }

        [Fact]
        public async Task Login_Unsuccessful_ChangesSession()
        {
            _userRepository.Setup(x => x.Login(It.IsAny<User>()))
                .Returns(Task.FromResult<User>(null));

            await _userController.Login(new User());

            _sessionService.Verify(x => x.SetSession(
                It.IsAny<HttpContext>(),
                It.Is<SessionData>(x => x == null)
            ), Times.Once);
        }

        [Fact]
        public async Task Login_CallsRepository()
        {
            await _userController.Login(_testUser);

            _userRepository.Verify(x => x.Login(_testUser), Times.Once);
        }

        [Fact]
        public async Task Login_NullPassed_ExceptionRaised()
        {
            await Assert.ThrowsAnyAsync<ArgumentNullException>(() => _userController.Login(null));
        }

        [Fact]
        public async Task Login_ExceptionRaised_ClearSession()
        {
            _userRepository.Setup(x => x.Login(It.IsAny<User>()))
               .Throws(new Exception());

            await Assert.ThrowsAnyAsync<Exception>(() => _userController.Login(new User()));

            _sessionService.Verify(x => x.SetSession(
                It.IsAny<HttpContext>(),
                It.Is<SessionData>(x => x == null)
            ), Times.Once);
        }

        [Fact]
        public void Logout_ExistsSession_ClearSession()
        {
            _sessionService.Setup(x => x.GetSession(It.IsAny<HttpContext>()))
                .Returns(_testSession);

            var result = (bool)((OkObjectResult)_userController.Logout().Result).Value;
            Assert.True(result);

            _sessionService.Verify(x => x.SetSession(
                It.IsAny<HttpContext>(),
                It.Is<SessionData>(x => x == null)
            ), Times.Once);
        }

        [Fact]
        public void Logout_NoSession_NoChanges()
        {
            _sessionService.Setup(x => x.GetSession(It.IsAny<HttpContext>()))
                .Returns((SessionData)null);

            var result = (bool)((OkObjectResult)_userController.Logout().Result).Value;
            Assert.False(result);

            _sessionService.Verify(x => x.SetSession(
                It.IsAny<HttpContext>(),
                It.IsAny<SessionData>()
            ), Times.Never);
        }

        [Fact]
        public async Task GetUser_Unauthorized_NullReturned()
        {
            Assert.Null(((OkObjectResult)(await _userController.GetUser()).Result).Value);
        }

        [Fact]
        public async Task GetUser_Authorized_ReturnsUser()
        {
            _sessionService.Setup(x => x.GetSession(It.IsAny<HttpContext>()))
                .Returns(_testSession);
            _userRepository.Setup(x => x.GetUser(It.IsAny<int>()))
                .Returns(Task.FromResult(_testUser));

            var user = (User)((OkObjectResult)(await _userController.GetUser()).Result).Value;

            _userRepository.Verify(x => x.GetUser(_testUser.Id), Times.Once);
            Assert.Equal(_testUser, user);
        }

        [Fact]
        public async Task DeleteUser_Unauthorized_ReturnsUnauthorized()
        {
            var result = (await _userController.DeleteUser(_testUser.Id)).Result;
            Assert.True(result is UnauthorizedResult);
        }

        [Fact]
        public async Task DeleteUser_Authorized_ReturnsOk()
        {
            _sessionService.Setup(x => x.GetSession(It.IsAny<HttpContext>()))
                .Returns(_testSession);

            var result = (await _userController.DeleteUser(_testUser.Id)).Result;
            Assert.True(result is OkObjectResult);
        }

        [Fact]
        public async Task DeleteUser_Authorized_CallsRepository()
        {
            var userToDelete = 2;
            _sessionService.Setup(x => x.GetSession(It.IsAny<HttpContext>()))
                .Returns(_testSession);

            await _userController.DeleteUser(userToDelete);

            _userRepository.Verify(x => x.DeleteUser(_testSession.UserId, userToDelete));
        }

        [Fact]
        public async Task UpdateSettings_Unauthorized_ReturnsUnauthorized()
        {
            var result = (await _userController.UpdateSettings(new Settings())).Result;
            Assert.True(result is UnauthorizedResult);
        }

        [Fact]
        public async Task UpdateSettings_NullPassed_ExceptionRaised()
        {
            await Assert.ThrowsAnyAsync<ArgumentNullException>(() => _userController.UpdateSettings(null));
        }

        [Fact]
        public async Task UpdateSettings_RepositoryCalled()
        {
            _sessionService.Setup(x => x.GetSession(It.IsAny<HttpContext>()))
                .Returns(_testSession);

            var settings = new Settings();
            await _userController.UpdateSettings(settings);

            _userRepository.Verify(x => x.UpdateSettings(_testUser.Id, _testUser.Id, settings));
        }

        [Fact]
        public async Task UpdateSettingsForUser_Unauthorized_ReturnsUnauthorized()
        {
            var result = (await _userController.UpdateSettings(new Settings(), 1)).Result;
            Assert.True(result is UnauthorizedResult);
        }

        [Fact]
        public async Task UpdateSettingsForUser_NullPassed_ExceptionRaised()
        {
            await Assert.ThrowsAnyAsync<ArgumentNullException>(() => _userController.UpdateSettings(null, 1));
        }

        [Fact]
        public async Task UpdateSettingsForUser_RepositoryCalled()
        {
            _sessionService.Setup(x => x.GetSession(It.IsAny<HttpContext>()))
                .Returns(_testSession);

            var userToUpdate = 2;
            var settings = new Settings();
            await _userController.UpdateSettings(settings, userToUpdate);

            _userRepository.Verify(x => x.UpdateSettings(_testUser.Id, userToUpdate, settings));
        }

        [Fact]
        public async Task UpdatePassword_Unauthorized_ReturnsUnauthorized()
        {
            var result = (await _userController.UpdatePassword(_testUser)).Result;
            Assert.True(result is UnauthorizedResult);
        }

        [Fact]
        public async Task UpdatePassword_NullPassed_ExceptionRaised()
        {
            await Assert.ThrowsAnyAsync<ArgumentNullException>(() => _userController.UpdatePassword(null));
        }

        [Fact]
        public async Task UpdatePassword_RepositoryCalled()
        {
            _sessionService.Setup(x => x.GetSession(It.IsAny<HttpContext>()))
                .Returns(_testSession);

            var user = new User() { Id = 2, Pwd = "password" };
            await _userController.UpdatePassword(user);

            _userRepository.Verify(x => x.UpdatePassword(_testUser.Id, _testUser.Id, user.Pwd));
        }

        [Fact]
        public async Task UpdatePasswordFor_Unauthorized_ReturnsUnauthorized()
        {
            var result = (await _userController.UpdatePassword(_testUser, 1)).Result;
            Assert.True(result is UnauthorizedResult);
        }

        [Fact]
        public async Task UpdatePasswordFor_NullPassed_ExceptionRaised()
        {
            await Assert.ThrowsAnyAsync<ArgumentNullException>(() => _userController.UpdatePassword(null, 1));
        }

        [Fact]
        public async Task UpdatePasswordFor_RepositoryCalled()
        {
            _sessionService.Setup(x => x.GetSession(It.IsAny<HttpContext>()))
                .Returns(_testSession);

            var userToUpdate = 3;
            var user = new User() { Id = 2, Pwd = "password" };
            await _userController.UpdatePassword(user, userToUpdate);

            _userRepository.Verify(x => x.UpdatePassword(_testUser.Id, userToUpdate, user.Pwd));
        }

        [Fact]
        public async Task GetAllRoles_RepositoryCalled()
        {
            await _userController.GetAllRoles();

            _userRepository.Verify(x => x.GetAllRoles());
        }

        [Fact]
        public async Task GetAllUsersr_Unauthorized_ReturnsUnauthorized()
        {
            var result = (await _userController.GetAllUsers()).Result;
            Assert.True(result is UnauthorizedResult);
        }

        [Fact]
        public async Task GetAllUsersr_Authorized_RepositoryCalled()
        {
            _sessionService.Setup(x => x.GetSession(It.IsAny<HttpContext>()))
                .Returns(_testSession);

            var result = (await _userController.GetAllUsers()).Result;

            _userRepository.Verify(x => x.GetAllUsers(_testUser.Id));
        }
    }
}
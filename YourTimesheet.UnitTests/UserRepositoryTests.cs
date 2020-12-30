using Moq;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;
using YourTimesheet.Models;
using YourTimesheet.Repositories;
using YourTimesheet.Services;

namespace YourTimesheet.UnitTests
{
    public class UserRepositoryTests
    {
        private readonly Mock<IDatabaseService> _databaseService;
        private readonly Mock<IDatabaseConnection> _databaseConnection;
        private readonly Mock<IDatabaseStatement> _databaseStatement;

        private readonly User _testUser = new User()
        {
            Id = 1,
            Email = "test@test.com",
            Pwd = "password"
        };

        private readonly UserRepository _userRepository;

        public UserRepositoryTests()
        {
            _databaseStatement = new Mock<IDatabaseStatement>();

            _databaseConnection = new Mock<IDatabaseConnection>();
            _databaseConnection.Setup(x => x.GetStatement()).Returns(_databaseStatement.Object);

            _databaseService = new Mock<IDatabaseService>();
            _databaseService.Setup(x => x.GetConnection()).Returns(Task.FromResult(_databaseConnection.Object));

            _userRepository = new UserRepository(_databaseService.Object);
        }

        [Fact]
        public async Task Login_EmptyArguments_ExceptionRaised()
        {
            await Assert.ThrowsAnyAsync<Exception>(() => _userRepository.Login(null));
        }

        [Theory]
        [InlineData(null, "12345678")]
        [InlineData("email@email.com", null)]
        [InlineData("        ", "12345678")]
        [InlineData("email@email.com", "        ")]
        public async Task Login_WrongArguments_ExceptionRaised(string email, string password)
        {
            await Assert.ThrowsAnyAsync<Exception>(() => _userRepository.Login(new User() { Email = email, Pwd = password }));
        }

        [Fact]
        public async Task Login_DatabaseResponseEmpty_ExceptionRaised()
        {
            _databaseStatement.Setup(x => x.ExecuteReader())
                .Returns(Task.FromResult<IEnumerable<object[]>>(new List<object[]>()));

            await Assert.ThrowsAnyAsync<Exception>(() => _userRepository.Login(_testUser));
        }

        [Fact]
        public async Task Login_DatabaseResponse_UserReturned()
        {
            var databaseResponse = new List<object[]>();
            databaseResponse.Add(new object[] { 1, 10, 2, "Role 1", 1, 0 });

            _databaseStatement.Setup(x => x.ExecuteReader())
                .Returns(Task.FromResult<IEnumerable<object[]>>(databaseResponse));

            var user = await _userRepository.Login(_testUser);
            var expectedUser = new User()
            {
                Id = 1,
                Email = _testUser.Email,
                Settings = new Settings()
                {
                    PreferredWorkingHoursPerDay = 10,
                    Role = new Role()
                    {
                        Id = 2,
                        Name = "Role 1",
                        ManageUserList = true,
                        ManageUserTimesheet = false
                    }
                }
            };

            Assert.Equal(JsonConvert.SerializeObject(expectedUser), JsonConvert.SerializeObject(user));
        }

        [Fact]
        public async Task RegisterUser_EmptyArguments_ExceptionRaised()
        {
            await Assert.ThrowsAnyAsync<Exception>(() => _userRepository.RegisterUser(null));
        }

        [Theory]
        [InlineData(null, "12345678")]
        [InlineData("email@email.com", null)]
        [InlineData("email@email.com", "1234567")]
        public async Task RegisterUser_WrongArguments_ExceptionRaised(string email, string password)
        {
            await Assert.ThrowsAnyAsync<Exception>(() => _userRepository.RegisterUser(new User() { Email = email, Pwd = password }));
        }
    }
}

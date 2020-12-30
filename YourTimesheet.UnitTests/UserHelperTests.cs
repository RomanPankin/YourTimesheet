using System;
using Xunit;
using YourTimesheet.Helpers;

namespace YourTimesheet.UnitTests
{
    public class UserHelperTests
    {
        [Theory]
        [InlineData(null, null)]
        [InlineData("12345", "827CCB0EEA8A706C4C34A16891F84E7B")]
        [InlineData("test1 test2", "EF82CE6D40324E109C8DDC00D89BA51D")]
        public void GetPasswordHashTests(string input, string expected)
        {
            var result = UserHelper.GetPasswordHash(input);

            Assert.Equal(expected, result);
        }
    }
}

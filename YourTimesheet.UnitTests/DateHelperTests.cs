using System;
using Xunit;
using YourTimesheet.Helpers;

namespace YourTimesheet.UnitTests
{
    public class DateHelperTests
    {
        [Theory]
        [InlineData(null, "0001-01-01")]
        [InlineData("2020-10-20", "2020-10-20")]
        [InlineData("-", "0001-01-01")]
        [InlineData("unknown", "0001-01-01")]
        public void ParseDateTests(string input, string expected)
        {
            var result = DateHelper.ParseDate(input, DateTime.MinValue).ToString("yyyy-MM-dd");

            Assert.Equal(expected, result);
        }
    }
}

using System;
using System.Globalization;

namespace YourTimesheet.Helpers
{
    public class DateHelper
    {
        public static DateTime ParseDate(string value, DateTime defaultValue)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return defaultValue;
            }

            if (DateTime.TryParseExact(value, "yyyy-MM-dd", null, DateTimeStyles.None, out DateTime result))
            {
                return result;
            }

            return defaultValue;
        }
    }
}

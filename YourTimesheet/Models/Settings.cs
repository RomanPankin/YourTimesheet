using System.Diagnostics.CodeAnalysis;

namespace YourTimesheet.Models
{
    [ExcludeFromCodeCoverage]
    public class Settings
    {
        public int PreferredWorkingHoursPerDay { get; set; }
        public Role Role { get; set; }
    }
}

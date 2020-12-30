using System;
using System.Diagnostics.CodeAnalysis;

namespace YourTimesheet.Models
{
    [ExcludeFromCodeCoverage]
    public class TimesheetItem
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public DateTime Date { get; set; }
        public int DurationInHours { get; set; }
        public string User { get; set; }
    }
}

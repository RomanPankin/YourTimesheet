using System.Diagnostics.CodeAnalysis;

namespace YourTimesheet.Models
{
    [ExcludeFromCodeCoverage]
    public class Role
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool ManageUserList { get; set; }
        public bool ManageUserTimesheet { get; set; }
    }
}

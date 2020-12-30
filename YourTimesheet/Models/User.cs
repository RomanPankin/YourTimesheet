using System.Diagnostics.CodeAnalysis;

namespace YourTimesheet.Models
{
    [ExcludeFromCodeCoverage]
    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string Pwd { get; set; }
        public Settings Settings { get; set; }
    }
}

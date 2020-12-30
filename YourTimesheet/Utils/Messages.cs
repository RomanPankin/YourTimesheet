using System.Diagnostics.CodeAnalysis;

namespace YourTimesheet.Utils
{
    [ExcludeFromCodeCoverage]
    public class Messages
    {
        public static readonly string UserCantBeAuthorized = "User \"{0}\" can't be authorized";
        public static readonly string EmptyEmailOrPassword = "Email and password can't be empty";
        public static readonly string WrongEmailFormat = "Email has a wrong format";
        public static readonly string ShortPassword = "Password can't be shorter than {0} characters";
        public static readonly string CantCreateUser = "Can't create a user \"{0}\"";
        public static readonly string CantUpdateSettings = "Can't update settings";
        public static readonly string CantUpdatePassword = "Can't update password";
        public static readonly string UserDoesntExist = "User doesn't exist";
        public static readonly string UserDoesntHavePermission = "User doesn't have enough permissions";

        public static readonly string NoItemToRecord = "There is no item to add, delete or update";
        public static readonly string CantUpdateRecord = "Record wasn't updated";

        public static readonly string TimesheetWrongWorkingHoursRange = "Working hours should be in the range {0}..{1}";
        public static readonly string TimesheetWrongDate = "Date can't be empty";
        public static readonly string TimesheetWrongDescription = "Description can't be empty";

        public static readonly string SettingEmptyRole = "User's role can't be empty";
    }
}

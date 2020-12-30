export class Messages {
   public static readonly EmailEmpty: string = 'Email address can\'t be empty';
   public static readonly EmailWrongFormat: string = 'Please provide a correct email address';

   public static readonly PasswordCantBeEmpty = 'Password can\'t be empty';
   public static readonly PasswordWrongLength = 'Password can\'t be shorter than {0} characters';
   public static readonly PasswordDoesntMatch = 'Password does not match the confirmation';

   public static readonly TimesheetItemEmptyDate = 'Date can\'t be empty';
   public static readonly TimesheetItemEmptyDuration = 'Working hours are empty or have a wrong value';
   public static readonly TimesheetItemEmptyDescription = 'Description can\'t be empty';
   public static readonly TimesheetItemAdded = 'Timesheet item successfully added';
   public static readonly TimesheetItemUpdated = 'Timesheet item successfully updated';

   public static readonly TimesheetCantUpdateItem = 'Can\'t update item';
   public static readonly TimesheetCantDeleteItem = 'Can\'t delete item';
   public static readonly TimesheetCantAddItem = 'Can\'t add item';

   public static readonly UserCantBeAuthorized = 'Wrong email or password';
   public static readonly UserIsAuthorized = 'User isn\'t authorized. Please refresh the page.';

   public static readonly ProvideBothFilterDate = 'Please fill both start and end dates or clean them.';

   public static readonly SettingsCantUpdate = 'Can\'t update user settings';
   public static readonly WrongRole = 'Role can\'t be empty';

   public static readonly UserUpdated = 'User successfully updated';
   public static readonly SettingsUpdated = 'Settings successfully updated';
}

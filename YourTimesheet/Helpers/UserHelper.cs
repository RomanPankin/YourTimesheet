using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace YourTimesheet.Helpers
{
    public class UserHelper
    {
        private static readonly Regex EmailRegExp = new Regex(@"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$");

        public static string GetPasswordHash(string password)
        {
            if (password == null) return null;

            using (MD5 md5 = MD5.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(password);
                var hashBytes = md5.ComputeHash(bytes);

                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < hashBytes.Length; i++)
                {
                    sb.Append(hashBytes[i].ToString("X2"));
                }

                return sb.ToString();
            }
        }

        public static bool VerifyEmail(string email)
        {
            if (email == null) return false;

            return EmailRegExp.IsMatch(email);
        }
    }
}

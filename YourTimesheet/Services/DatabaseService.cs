using Microsoft.Extensions.Configuration;
using System;
using System.Data.SQLite;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;

namespace YourTimesheet.Services
{
    public class DatabaseService: IDatabaseService
    {
        private readonly string _databaseConnectionUrl;

        public DatabaseService(IConfiguration configuration)
        {
            string codeBase = Assembly.GetExecutingAssembly().Location;
            string path = Path.GetDirectoryName(codeBase);

            _databaseConnectionUrl = string.Format(
                "URI=file:{0}",
                Path.Join(path, configuration.GetValue<string>("DatabaseConnectionUrl"))
            );
        }

        public async Task<IDatabaseConnection> GetConnection()
        {
            var connection = new SQLiteConnection(_databaseConnectionUrl);
            try
            {
                await connection.OpenAsync();

                using (var stmt = new SQLiteCommand(connection))
                {
                    stmt.CommandText = "PRAGMA foreign_keys = ON";
                    await stmt.ExecuteNonQueryAsync();
                }
            }
            catch (Exception)
            {
                connection.Dispose();
                throw;
            }

            return new DatabaseConnection(connection);
        }
    }
}

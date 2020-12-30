using System.Data.SQLite;

namespace YourTimesheet.Services
{
    public class DatabaseConnection: IDatabaseConnection
    {
        public int LastInsertRowId { get { return (int)_connection.LastInsertRowId; } }

        private readonly SQLiteConnection _connection;

        public DatabaseConnection(SQLiteConnection connection)
        {
            _connection = connection;
        }

        public void Dispose()
        {
            _connection.Dispose();
        }

        public IDatabaseStatement GetStatement()
        {
            return new DatabaseStatement(new SQLiteCommand(_connection));
        }
    }
}

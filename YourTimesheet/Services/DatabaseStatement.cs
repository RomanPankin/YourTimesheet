using System;
using System.Collections.Generic;
using System.Data.SQLite;
using System.Threading.Tasks;

namespace YourTimesheet.Services
{
    public class DatabaseStatement: IDatabaseStatement
    {
        public string SQL { get; set; }
        public IDictionary<string, object> Parameters { get; set; } = new Dictionary<string, object>();


        private readonly SQLiteCommand _command;

        public DatabaseStatement(SQLiteCommand command)
        {
            _command = command;
        }

        public void Dispose()
        {
            _command.Dispose();
        }

        public async Task<int> Execute()
        {
            _command.CommandText = SQL;

            foreach (var param in Parameters)
            {
                _command.Parameters.AddWithValue(param.Key, param.Value);
            }

            await _command.PrepareAsync();
            return await _command.ExecuteNonQueryAsync();
        }

        public async Task<IEnumerable<object[]>> ExecuteReader()
        {
            _command.CommandText = SQL;

            foreach (var param in Parameters)
            {
                _command.Parameters.AddWithValue(param.Key, param.Value);
            }

            await _command.PrepareAsync();

            List<object[]> result = new List<object[]>();
            using (var reader = await _command.ExecuteReaderAsync())
            {
                while (reader.Read())
                {
                    int columns = reader.FieldCount;
                    object[] line = new object[columns];

                    for (int i=0; i< columns; i++)
                    {
                        if (await reader.IsDBNullAsync(i))
                        {
                            line[i] = null;
                        }
                        else
                        {
                            var type = reader.GetFieldType(i).ToString();
                            switch (type)
                            {
                                case "System.Int32":
                                    line[i] = reader.GetInt32(i);
                                    break;
                                case "System.Int64":
                                    line[i] = (int)reader.GetInt64(i);
                                    break;
                                case "System.DateTime":
                                    line[i] = reader.GetDateTime(i);
                                    break;
                                case "System.String":
                                    line[i] = reader.GetString(i);
                                    break;
                                default:
                                    line[i] = null;
                                    break;
                            }
                        }
                    }

                    result.Add(line);
                }
            }

            return result;
        }
    }
}

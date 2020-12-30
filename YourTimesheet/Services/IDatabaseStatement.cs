using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace YourTimesheet.Services
{
    public interface IDatabaseStatement : IDisposable
    {
        string SQL { get; set; }
        IDictionary<string, object> Parameters { get; set; }

        Task<int> Execute();
        Task<IEnumerable<object[]>> ExecuteReader();
    }
}

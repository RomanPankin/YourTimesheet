using System;

namespace YourTimesheet.Services
{
    public interface IDatabaseConnection: IDisposable
    {
        int LastInsertRowId { get; }

        IDatabaseStatement GetStatement();
    }
}

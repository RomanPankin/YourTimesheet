using System.Diagnostics.CodeAnalysis;

namespace YourTimesheet.Utils
{
    [ExcludeFromCodeCoverage]
    public class Constants
    {
		public static readonly int MinWorkingHours = 1;
		public static readonly int MaxWorkingHours = 24;

		public static readonly int MinPreferedWorkingHours = 0;
		public static readonly int MaxPreferedWorkingHours = 24;

		public static readonly string HtmlStyles = @"
            html ,body {
				background: rgb(245,245,245);
				margin: 0;
				padding: 0;
				font-family: Tahoma, Verdana,sans-serif;
			}

			table {
				background: white;
				border-collapse: collapse;
				font-size: 13px;
				box-shadow: 0px 0px 15px rgb(200,200,200);
			}

			.data {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
			}

			th, td {
				padding: 4px 8px;
				border: 1px solid rgb(230,230,230);
			}

			th {
				background: rgb(20, 115, 180);
				color: white;
				padding: 8px 8px;
			}

			tr:hover {
				background: rgb(240, 240, 240);
			}";
	}
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Net;
using YourTimesheet.Models;

namespace YourTimesheet.Services
{
    public class HttpResponseExceptionFilter : IActionFilter
    {
        public void OnActionExecuting(ActionExecutingContext context) { }

        public void OnActionExecuted(ActionExecutedContext context)
        {
            if (context.Exception != null)
            {
                var exception = new HttpException()
                {
                    Title = context.Exception.Message
                };

                context.Result = new ObjectResult(exception)
                {
                    StatusCode = (int)HttpStatusCode.BadRequest
                };

                context.ExceptionHandled = true;
            }
        }
    }
}

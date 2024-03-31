using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Reflecta01.Server.Common.Models;
using System.Net.Mime;
using System.Reflection;

namespace Microsoft.Reflecta.Api.Apis.Controllers
{
    /// <summary>
    /// Health check API Controller.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class HealthCheckController : ControllerBase
    {
        private readonly TestOptions _options;

        public HealthCheckController(IOptions<TestOptions> options)
        {
            _options = options.Value;
        }

        /// <summary>
        /// Health check endpoint.
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult CheckHealth()
        {
            var version = Assembly.GetExecutingAssembly().GetName().Version.ToString();
            return Ok($"Healthy - {version}");
        }

        [HttpGet("options")]
        [AllowAnonymous]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult GetOptions()
        {
            return Ok(_options.Config1);
        }
    }
}

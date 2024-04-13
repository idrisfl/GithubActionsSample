using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Reflecta.Server.Apis.Services;
using Microsoft.Reflecta.Server.Common.DTO;

namespace Microsoft.Reflecta.Server.Apis.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TitleController : ControllerBase
    {
        private readonly OpenAIService _openAIService;
        private readonly ILogger<TitleController> _logger;

        public TitleController(OpenAIService openAIService, ILogger<TitleController> logger)
        {
            _openAIService = openAIService;
            _logger = logger;
        }

        [HttpPost("generate-title")]
        [ProducesResponseType(StatusCodes.Status202Accepted)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GenerateTitle([FromBody] Form input)
        {
            try 
            {
                _logger.LogInformation("Generating title for input: {input}", input);
                string title = await _openAIService.GenerateTitle(input);
                return Ok(new ReportTitle { Title = title });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,  new { message = ex.Message });
            }
        }
    }
}
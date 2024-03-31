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

        public TitleController(OpenAIService openAIService)
        {
            _openAIService = openAIService;
        }

        [HttpPost("generate-title")]
        [ProducesResponseType(StatusCodes.Status202Accepted)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GenerateTitle([FromBody] Form input)
        {
            try 
            {
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
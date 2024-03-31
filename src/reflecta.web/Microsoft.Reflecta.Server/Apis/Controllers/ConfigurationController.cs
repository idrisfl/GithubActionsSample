using Microsoft.Reflecta.Api.Common.DTO;
using Microsoft.Reflecta.Api.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace Microsoft.Reflecta.Api.Apis.Controllers
{
    /// <summary>
    /// The configuration controller.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class ConfigurationController : ControllerBase
    {
        private readonly ConfigurationSettings _configurationSettings;

        /// <summary>
        /// Initializes a new instance of the <see cref="ConfigurationController"/> class.
        /// </summary>
        /// <param name="configurationSettings"></param>
        public ConfigurationController(IOptionsMonitor<ConfigurationSettings> configurationSettings)
        {
            if (configurationSettings == null)
            {
                throw new ArgumentNullException(nameof(configurationSettings));
            }

            _configurationSettings = configurationSettings.CurrentValue;
        }

        /// <summary>
        /// Gets the GBUs.
        /// </summary>
        /// <returns>A list of GBUs</returns>
        [HttpGet("gbus")]
        public IActionResult GetGBUs()
        {
            try
            {
                var gbus = _configurationSettings.GBUs?.Split(',').Select(gbu => gbu.Trim());
                return Ok(gbus);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Gets the life saving rules.
        /// </summary>
        /// <returns>A list of life saving rules</returns>
        [HttpGet("life-saving-rules")]
        public IActionResult GetLifeSavingRules()
        {
            try
            {
                var lifeSavingRulesJson = _configurationSettings.LifeSavingRules;

                var lifeSavingRules = JsonSerializer.Deserialize<IList<LifeSavingRule>>(lifeSavingRulesJson);

                return Ok(lifeSavingRules);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }
    }
}

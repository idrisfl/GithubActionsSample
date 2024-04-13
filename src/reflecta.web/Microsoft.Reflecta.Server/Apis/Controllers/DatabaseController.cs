using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.Reflecta.Server.Apis.Services;
using Microsoft.Reflecta.Server.Common.DTO;
using Microsoft.Reflecta.Server.Common.Models;
using System.Net.Mime;
using System.Text.Json;

namespace Microsoft.Reflecta.Server.Apis.Controllers
{
    ///<summary>
    /// The Incident API Controller.  
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class DatabaseController : ControllerBase
    {
        private readonly IAzureStorageService _storageService;
        private readonly string _outputLatestBlob;
        private readonly string _statusBlob;
        private readonly ILogger<DatabaseController> _logger;

        /// <summary>
        /// The constructor for the Incident  API Controller.
        /// </summary>
        /// <param name="storageService">The storage service</param>
        /// <param name="options">Azure Storage options configuration</param>
        /// <param name="logger"></param>
        public DatabaseController(IAzureStorageService storageService, IOptions<AzureStorageOptions> options, ILogger<DatabaseController> logger)
        {
            if (options == null)
            {
                throw new ArgumentNullException(nameof(options));
            }

            if (string.IsNullOrEmpty(options.Value.StatusBlob))
            {
                throw new ArgumentException("Azure Storage status blob name is missing.");
            }

            if (string.IsNullOrEmpty(options.Value.OutputLatestBlob))
            {
                throw new ArgumentException("Azure Storage output latest blob name is missing.");
            }

            _storageService = storageService;
            _statusBlob = options.Value.StatusBlob;
            _outputLatestBlob = options.Value.OutputLatestBlob;
            _logger = logger;
        }

        /// <summary>
        /// Uploads an Excel file Incident Database to the server for processing.
        /// </summary>
        /// <remarks>
        /// This API endpoint accepts Excel files (.xlsx or .xls) for processing.
        /// The file is validated for format and emptiness before initiating asynchronous processing.
        /// </remarks>
        /// <param name="model">The set of fields required to upload the Incidents Excel file (.xlsx or .xls).</param>
        /// <returns>Accepted response with the operation id and message.</returns>
        [HttpPost("upload")]
        [Consumes(typeof(IncidentsUploadModel), "multipart/form-data")]
        [Produces(MediaTypeNames.Application.Json)]        
        [ProducesResponseType(StatusCodes.Status202Accepted)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Upload([FromForm] IncidentsUploadModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var metadata = new Dictionary<string, string>
                {
                    { "uploadedBy", model.UserName }
                };

                await _storageService.UploadFileAsync(model.File, metadata);

                var response = new
                {
                    operation_id = model.File.FileName,
                    message = "Incident Database uploaded for processing.",
                };

                return Accepted(response);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex);
            }
        }

        /// <summary>
        /// Gets the latest uploaded Incident Database file information.
        /// </summary>
        /// <returns>Information about the latest incident</returns>
        [HttpGet("current")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(LatestUploadInfoDto))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetCurrentUploaded()
        {
            try
            {
                _logger.LogInformation("Getting the latest uploaded Incident Database file information.");
                var outputLatestContent = await _storageService.GetBlobContentAsync(_outputLatestBlob);
                var latestUploadInfoDto = JsonSerializer.Deserialize<LatestUploadInfoDto>(outputLatestContent);

                if (latestUploadInfoDto != null) {
                    _logger.LogInformation("Getting the status of the latest uploaded Incident Database file.");
                    var statusContent = await _storageService.GetBlobContentAsync(_statusBlob);
                    latestUploadInfoDto.Status = JsonSerializer.Deserialize<StatusObject>(statusContent);
                }

                return Ok(latestUploadInfoDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting the latest uploaded Incident Database file information.");
                return StatusCode(StatusCodes.Status500InternalServerError, ex);
            }
        }
    }
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Net.Mime;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using System.Text.Json;
using System.Collections.Generic;
using Microsoft.Reflecta.Server.Apis.Services;
using Microsoft.Reflecta.Server.Common.DTO;
using Microsoft.Reflecta.Server.Common.Models;

namespace Microsoft.Reflecta.Server.Apis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly IAzureStorageService _storageService;

        public ReportsController(IAzureStorageService storageService, IOptions<AzureStorageOptions> options)
        {
            if (options == null)
            {
                throw new ArgumentNullException(nameof(options));
            }

            _storageService = storageService;
        }

        /// <summary>
        /// Gets the list of reports.
        /// </summary>
        /// <returns>The list of incidents.</returns>
        [HttpGet]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetReports()
        {
            try
            {
                var blobNames = await _storageService.ListBlobsAsync();
                var reports = new List<Report>();

                foreach (var blobName in blobNames)
                {
                    var blobContent = await _storageService.GetBlobContentAsync(blobName);
                    var report = JsonSerializer.Deserialize<Report>(blobContent);
                    reports.Add(report);
                }

                return Ok(reports);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Creates a new report.
        /// </summary>
        /// <param name="report">The <see cref="ReportRequest"/></param>
        /// <returns></returns>
        [HttpPost]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateReport([FromBody] ReportRequest report)
        {
            try
            {                
                var jsonContent = JsonSerializer.Serialize(report);
                await _storageService.AddMessageToQueueAsync(jsonContent);

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Deletes a report.
        /// </summary>
        /// <param name="fileName">The report file name</param>
        /// <returns>Http 200 ok if the file is deleted</returns>
        [HttpDelete("{fileName}")]
        [Produces(MediaTypeNames.Application.Json)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteReport(string fileName)
        {
            try
            {
                if (string.IsNullOrEmpty(fileName))
                {
                    return BadRequest("File name is empty or null");
                }

                fileName = fileName.EndsWith(".json", StringComparison.OrdinalIgnoreCase) ? fileName : fileName + ".json";

                if (!await _storageService.DeleteBlobAsync(fileName))
                {
                    return NotFound();
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }
    }
}
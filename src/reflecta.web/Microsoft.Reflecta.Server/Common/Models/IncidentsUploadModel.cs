using System.ComponentModel.DataAnnotations;

namespace Microsoft.Reflecta.Api.Common.Models
{
    /// <summary>
    /// The set of fields required to upload the incident database file.
    /// </summary>
    public class IncidentsUploadModel
    {
        /// <summary>
        /// The user name of the user uploading the file.
        /// </summary>
        [Required(ErrorMessage = "UserName is required")]
        public string? UserName { get; set; }

        /// <summary>
        /// The file to upload.
        /// </summary>
        [Required(ErrorMessage = "File is required")]
        public IFormFile File { get; set; }
    }
}

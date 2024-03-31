using System.Text.Json.Serialization;

namespace Microsoft.Reflecta.Server.Common.DTO
{
    public class LifeSavingRule
    {
        /// <summary>
        /// Gets or sets the id.
        /// </summary>
        [JsonPropertyName("id")]
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the title.
        /// </summary>
        [JsonPropertyName("title")]
        public string Title { get; set; }
    }
}

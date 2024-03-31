using System.Text.Json;
using System.Text.Json.Serialization;

namespace Microsoft.Reflecta.Api.Common.DTO
{
    public class LatestUploadInfoDto
    {
        public LatestUploadInfoDto()
        {
            MostRecentIncident = new MostRecentIncident();
            Status = new StatusObject();
        }

        [JsonPropertyName("uploadedDate")]
        public DateTime UploadedDate { get; set; }

        [JsonPropertyName("uploadedBy")]
        public string UploadedBy { get; set; }

        [JsonPropertyName("originalFileName")]
        public string OriginalFileName { get; set; }

        [JsonPropertyName("numberOfIncidents")]
        public int NumberOfIncidents { get; set; }

        [JsonPropertyName("mostRecentIncident")]
        public MostRecentIncident MostRecentIncident { get; set; }

        [JsonPropertyName("pickle")]
        public string Pickle { get; set; }

        [JsonPropertyName("status")]
        public StatusObject Status { get; set; }
    }

    public class MostRecentIncident
    {
        [JsonPropertyName("incidentId")]
        public int IncidentId { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; }

        [JsonPropertyName("date")]
        public DateTime Date { get; set; }
    }

    public class StatusObject
    {
        [JsonPropertyName("status")]
        public string Status { get; set; }

        [JsonPropertyName("message")]
        public string Message { get; set; }

        [JsonPropertyName("filename")]
        public string Filename { get; set; }
    }
}

using System.Text.Json.Serialization;

namespace Microsoft.Reflecta.Api.Common.DTO
{
    public class ReportRequest
    {
        [JsonPropertyName("title")]
        public string Title { get; set; }

        [JsonPropertyName("incidentTimeFrame")]
        public IncidentTimeFrameDTO? IncidentTimeFrame { get; set; }

        [JsonPropertyName("gbus")]
        public List<string>? Gbus { get; set; }

        [JsonPropertyName("lifeSavingRules")]
        public List<string>? LifeSavingRules { get; set; }

        [JsonPropertyName("onlyHipo")]
        public bool OnlyHipo { get; set; }

        [JsonPropertyName("prompt")]
        public string Prompt { get; set; }

        [JsonPropertyName("createdBy")]
        public string CreatedBy { get; set; }
    }

    public class IncidentTimeFrameDTO
    {
        [JsonPropertyName("from")]
        public DateTime From { get; set; }

        [JsonPropertyName("to")]
        public DateTime To { get; set; }
    }

}

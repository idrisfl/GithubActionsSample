using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;


namespace Microsoft.Reflecta.Api.Common.DTO
{
    public class Form
    {
        [JsonPropertyName("title")]
        public string Title { get; set; }

        [JsonPropertyName("incidentTimeFrame")]
        public IncidentTimeFrame IncidentTimeFrame { get; set; }

        [JsonPropertyName("gbus")]
        public List<string> Gbus { get; set; }

        [JsonPropertyName("lifeSavingRules")]
        public List<string> LifeSavingRules { get; set; }

        [JsonPropertyName("onlyHipo")]
        public bool OnlyHipo { get; set; }

        [JsonPropertyName("prompt")]
        public string Prompt { get; set; }
    }

}
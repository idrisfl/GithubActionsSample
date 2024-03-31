using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Microsoft.Reflecta.Server.Common.DTO
{
    public class Report
    {
        [JsonPropertyName("title")]
        public string Title { get; set; }

        [JsonPropertyName("createdBy")]
        public string CreatedBy { get; set; }

        [JsonPropertyName("createdDate")]
        public DateTime CreatedDate { get; set; }

        [JsonPropertyName("query")]
        public string Query { get; set; }

        [JsonPropertyName("systemCompletion")]
        public string SystemCompletion { get; set; }

        [JsonPropertyName("relatedIncidents")]
        public List<RelatedIncident> RelatedIncidents { get; set; }

        [JsonPropertyName("skippedIncidents")]
        public List<object> SkippedIncidents { get; set; }

        [JsonPropertyName("runCosts")]
        public RunCosts RunCosts { get; set; }

        [JsonPropertyName("runTimeSeconds")]
        public decimal RunTimeSeconds { get; set; }

        [JsonPropertyName("criteria")]
        public string Criteria { get; set; }

        [JsonPropertyName("oxDotMap")]
        public string OxDotMap { get; set; }

        [JsonPropertyName("queryId")]
        public string QueryId { get; set; }

        [JsonPropertyName("filters")]
        public Filters Filters { get; set; }

        [JsonPropertyName("pickleUploaded")]
        public DateTime PickleUploaded { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; }

        [JsonPropertyName("errorDetails")]
        public string ErrorDetails { get; set; }
    }

    public class RelatedIncident
    {
        [JsonPropertyName("id")]
        public int ID { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; }
    }

    public class RunCosts
    {
        [JsonPropertyName("models")]
        public List<ModelUsage> Models { get; set; }

        [JsonPropertyName("totalCost")]
        public decimal TotalCost { get; set; }
    }

    public class ModelUsage
    {
        [JsonPropertyName("model")]
        public string Model { get; set; }

        [JsonPropertyName("usage")]
        public Usage Usage { get; set; }
    }

    public class Usage
    {
        [JsonPropertyName("promptTokens")]
        public int PromptTokens { get; set; }

        [JsonPropertyName("completionTokens")]
        public int CompletionTokens { get; set; }

        [JsonPropertyName("totalTokens")]
        public int TotalTokens { get; set; }

        [JsonPropertyName("promptCosts")]
        public decimal PromptCosts { get; set; }

        [JsonPropertyName("completionCosts")]
        public decimal CompletionCosts { get; set; }

        [JsonPropertyName("totalCosts")]
        public decimal TotalCosts { get; set; }
    }

    public class Filters
    {
        [JsonPropertyName("incidentTimeFrame")]
        public IncidentTimeFrame IncidentTimeFrame { get; set; }

        [JsonPropertyName("gbus")]
        public List<string> Gbus { get; set; }

        [JsonPropertyName("lifeSavingRules")]
        public List<string> LifeSavingRules { get; set; }

        [JsonPropertyName("onlyHipo")]
        public bool OnlyHipo { get; set; }
    }

    public class IncidentTimeFrame
    {
        [JsonPropertyName("from")]
        public DateTime From { get; set; }

        [JsonPropertyName("to")]
        public DateTime To { get; set; }
    }
}
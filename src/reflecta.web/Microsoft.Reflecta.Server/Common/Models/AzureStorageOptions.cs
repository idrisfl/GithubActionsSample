namespace Microsoft.Reflecta.Server.Common.Models
{
    /// <summary>
    /// The AzureStorageOptions class.
    /// </summary>
    public class AzureStorageOptions
    {
        /// <summary>
        /// Gets or sets the connection string.
        /// </summary>
        public string? ConnectionString { get; set; }

        /// <summary>
        /// Gets or sets the embeddings container name.
        /// </summary>
        public string? EmbeddingsContainerName { get; set; }

        /// <summary>
        /// Gets or sets the database folder name.
        /// </summary>
        public string? InputFolderName { get; set; }

        /// <summary>
        /// Gets or sets the reports folder name.
        /// </summary>
        public string? ReportsFolderName { get; set; }

        /// <summary>
        /// Gets or sets the status blob name.
        /// </summary>
        public string? StatusBlob { get; set; }

        /// <summary>
        /// Gets or sets the output latest blob name.
        /// </summary>
        public string? OutputLatestBlob { get; set; }

        /// <summary>
        /// Gets or sets the queue name.
        /// </summary>
        public string? QueueName { get; set; }
    }
}

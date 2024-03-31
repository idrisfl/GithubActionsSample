using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Queues;
using Microsoft.Reflecta.Server.Common.Models;
using Microsoft.Extensions.Options;

namespace Microsoft.Reflecta.Server.Apis.Services
{
    public class AzureStorageService : IAzureStorageService
    {
        private readonly BlobServiceClient _blobServiceClient;
        private readonly string _embeddingsContainerName;
        private readonly string _inputFolderName;

        private readonly string _reportsFolderName;
        private readonly QueueClient _queueClient;

        public AzureStorageService(IOptions<AzureStorageOptions> options)
        {
            if (options == null)
            {
                throw new ArgumentNullException(nameof(options));
            }

            if (string.IsNullOrEmpty(options.Value.ConnectionString))
            {
                throw new ArgumentException("Azure Storage connection string is missing.");
            }

            if (string.IsNullOrEmpty(options.Value.EmbeddingsContainerName))
            {
                throw new ArgumentException("Azure Storage container name is missing.");
            }

            if (string.IsNullOrEmpty(options.Value.InputFolderName))
            {
                throw new ArgumentException("Azure Storage input folder name is missing.");
            }

            if (string.IsNullOrEmpty(options.Value.ReportsFolderName))
            {
                throw new ArgumentException("Azure Storage reports folder name is missing.");
            }

            if (string.IsNullOrEmpty(options.Value.QueueName))
            {
                throw new ArgumentException("Azure Storage queue name is missing.");
            }

            _blobServiceClient = new BlobServiceClient(options.Value.ConnectionString);
            _embeddingsContainerName = options.Value.EmbeddingsContainerName;
            _inputFolderName = options.Value.InputFolderName;
            _reportsFolderName = options.Value.ReportsFolderName;
            _queueClient = new QueueClient(options.Value.ConnectionString, options.Value.QueueName);
        }

        public async Task UploadFileAsync(IFormFile file, IDictionary<string, string> metadata = null)
        {
            var blobContainerClient = _blobServiceClient.GetBlobContainerClient(_embeddingsContainerName);

            var blobName = Path.Combine(_inputFolderName, file.FileName.Replace("\\", "/"));
            var blobClient = blobContainerClient.GetBlobClient(blobName);

            var contentType = file.ContentType;

            using var fileStream = file.OpenReadStream();
            await blobClient.UploadAsync(fileStream, new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders { ContentType = contentType },
                Metadata = metadata
            });
        }

        public async Task<string> GetBlobContentAsync(string blobName)
        {
            var blobContainerClient = _blobServiceClient.GetBlobContainerClient(_embeddingsContainerName);
            var blobClient = blobContainerClient.GetBlobClient(blobName);

            if (!await blobClient.ExistsAsync())
            {
                // Handle the case where the blob does not exist
                throw new InvalidOperationException($"Blob '{blobName}' does not exist.");
            }

            using var memoryStream = new MemoryStream();
            var blobDownloadInfo = await blobClient.DownloadAsync();

            await blobDownloadInfo.Value.Content.CopyToAsync(memoryStream);
            memoryStream.Seek(0, SeekOrigin.Begin);

            using var streamReader = new StreamReader(memoryStream);
            return await streamReader.ReadToEndAsync();
        }

        public async Task<IEnumerable<string>> ListBlobsAsync()
        {
            var blobContainerClient = _blobServiceClient.GetBlobContainerClient(_embeddingsContainerName);
            var blobs = new List<string>();

            await foreach (var blobItem in blobContainerClient.GetBlobsByHierarchyAsync(prefix: _reportsFolderName))
            {
                blobs.Add(blobItem.Blob.Name);
            }

            return blobs;
        }

        /// <summary>
        /// Add a message to the queue
        /// </summary>
        /// <param name="message">The message</param>
        /// <returns></returns>
        public async Task AddMessageToQueueAsync(string message)
        {
            await _queueClient.SendMessageAsync(message);
        }

        /// <summary>
        /// Delete a blob from the storage account
        /// </summary>
        /// <param name="blobName">The blob name</param>
        /// <returns></returns>
        public async Task<bool> DeleteBlobAsync(string blobName)
        {
            var blobContainerClient = _blobServiceClient.GetBlobContainerClient(_embeddingsContainerName);
            var reportToDelete = Path.Combine(_reportsFolderName, blobName);
            var blobClient = blobContainerClient.GetBlobClient(reportToDelete);

            return await blobClient.DeleteIfExistsAsync();
        }
    }
}

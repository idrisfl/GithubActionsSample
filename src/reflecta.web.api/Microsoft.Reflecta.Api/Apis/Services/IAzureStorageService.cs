namespace Microsoft.Reflecta.Api.Apis.Services
{
    public interface IAzureStorageService
    {
        Task UploadFileAsync(IFormFile file, IDictionary<string, string> metadata = null);

        Task<string> GetBlobContentAsync(string blobName);

        Task<IEnumerable<string>> ListBlobsAsync();

        Task AddMessageToQueueAsync(string message);

        Task<bool> DeleteBlobAsync(string blobName);
    }
}
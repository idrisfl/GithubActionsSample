using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Microsoft.Reflecta.Api.Common
{
    public class LowerCaseDocumentFilter : IDocumentFilter
    {
        public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
        {
            var paths = new Dictionary<string, OpenApiPathItem>(swaggerDoc.Paths, StringComparer.OrdinalIgnoreCase);
            swaggerDoc.Paths.Clear();

            foreach (var pathItem in paths)
            {
                var newPath = LowercasePath(pathItem.Key);
                swaggerDoc.Paths[newPath] = pathItem.Value;
            }
        }

        private string LowercasePath(string path)
        {
            return string.Join("/", path.Split('/').Select(s => s.ToLower()));
        }
    }
}

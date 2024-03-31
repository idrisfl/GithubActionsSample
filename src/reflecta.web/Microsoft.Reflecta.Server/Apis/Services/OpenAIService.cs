using System;
using System.Threading.Tasks;
using Azure;
using Azure.AI.OpenAI; 
using Microsoft.Reflecta.Api.Common.Models;
using Microsoft.Reflecta.Api.Common.DTO;
using Microsoft.Extensions.Options;
using System.Text.Json;


namespace Microsoft.Reflecta.Api.Apis.Services
{
    public class OpenAIService
    {
        private readonly OpenAIClient _client;
        private readonly string _deploymentName;

        public OpenAIService(IOptions<OpenAIOptions> options)
        {
            _deploymentName = options.Value.DeploymentName;

            Uri azureOpenAIResourceUri = new Uri(options.Value.Endpoint);
            AzureKeyCredential azureOpenAIApiKey = new AzureKeyCredential(options.Value.ApiKey);
            _client = new OpenAIClient(azureOpenAIResourceUri, azureOpenAIApiKey);
        }

        public async Task<string> GenerateTitle(Form input)
        {
             string prompt = File.ReadAllText("prompt_title.txt");

            string json = JsonSerializer.Serialize(input);
            prompt = prompt.Replace("{content}", json);

            var chatCompletionsOptions = new ChatCompletionsOptions()
            {
                DeploymentName = _deploymentName,
                Messages =
                {
                    new ChatRequestUserMessage(prompt),
                }
            };

            Response<ChatCompletions> response = await _client.GetChatCompletionsAsync(chatCompletionsOptions);
            ChatResponseMessage responseMessage = response.Value.Choices[0].Message;

            var title = responseMessage.Content;

            // Remove any double quotes at the beginning or the end of the title if they exist, using regex
            title = System.Text.RegularExpressions.Regex.Replace(title, "^\"|\"$", "");

            return title;
        }
    }
}

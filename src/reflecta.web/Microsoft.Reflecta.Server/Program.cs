using Microsoft.OpenApi.Models;
using Microsoft.Reflecta.Api.Apis.Services;
using Microsoft.Reflecta.Api.Common;
using Microsoft.Reflecta.Api.Common.Models;
using Reflecta01.Server.Common.Models;
using System.Reflection;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddLogging(loggingBuilder =>
{
    loggingBuilder.AddConsole();
    loggingBuilder.AddDebug();
});

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {

     options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
     options.JsonSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase; 
    })
    .ConfigureApiBehaviorOptions(x => { x.SuppressMapClientErrors = true; });

builder.Services.Configure<AzureStorageOptions>(builder.Configuration.GetSection("AzureStorageOptions"));
builder.Services.Configure<ConfigurationSettings>(builder.Configuration.GetSection("ConfigurationSettings"));
builder.Services.Configure<TestOptions>(builder.Configuration.GetSection("TestOptions"));
builder.Services.AddScoped<IAzureStorageService, AzureStorageService>();
builder.Services.AddApplicationInsightsTelemetry();
builder.Services.AddScoped<OpenAIService>();
builder.Services.Configure<OpenAIOptions>(builder.Configuration.GetSection("OpenAIOptions"));


// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.DocumentFilter<LowerCaseDocumentFilter>();
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Swagger Reflecta API",
        Version = "v1",
        Description = "A set of APIs for the Reflecta project",
        Contact = new OpenApiContact
        {
            Name = "Microsoft ISD Team",
            Email = ""
        }
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new List<string>()
        }
    });

    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    c.IncludeXmlComments(xmlPath);
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.OAuthUsePkce();
});

app.UseHttpsRedirection();

app.UseStaticFiles();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();

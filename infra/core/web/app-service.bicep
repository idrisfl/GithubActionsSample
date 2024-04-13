metadata description = 'Creates an App Service Plan and a Web App.'

param location string = resourceGroup().location
param sku string = 'S1'
param linuxFxVersion string = 'DOTNETCORE|8.0'
param appServicePlanName string
param appServiceName string
param appInsightsInstrumentationKey string
param virtualNetworkSubnetId string
param openAIApiKey string
param openAIEndpoint string
param openIdConfigurationClientId string
param openIdConfigurationIssuer string = 'https://login.microsoftonline.com/${tenant().tenantId}/v2.0'
param azureStorageEmbeddingsContainerName string = 'embeddings'
param azureStorageInputFolderName string = 'input_folder'
param azureStorageOutputLatestBlob string = 'output_folder/output_latest.json'
param azureStorageQueueName string = 'input-validation-queue'
param azureStorageReportsFolderName string = 'responses'
param azureStorageStatusBlob string = 'status.json'
param configurationSettingsGBUs string = 'Energy Solutions, GEMS, Networks, Nuke, Other, Renewables, Flexible Generation, Retail'
param configurationSettingsLifeSavingRules string = '[{"id":1,"title":"Do not walk or stand under a load"},{"id":2,"title":"Stay out of the path of moving vehicles, plant and equipment"},{"id":3,"title":"Clip on your harness when working at height"},{"id":4,"title":"Only enter a trench if the appropriate wall supports are in place"},{"id":5,"title":"Test that the atmosphere is safe before entering a confined space and monitor it as you work"},{"id":6,"title":"Do not perform hot work unless the fire or explosion risks have been eliminated"},{"id":7,"title":"Verify that there is no live energy (mechanical, chemical, electrical, fluids under pressure, etc) before starting work"},{"id":8,"title":"Do not manipulate your phone or any other communication device while driving"},{"id":9,"title":"Do not work under the influence of alcohol or drugs including driving"},{"id":10,"title":"Other category"}]'
param openAIDeploymentName string = 'gpt-4-deployment'
param openIdConfigurationAudience string = 'api://default'
param storageAccountName string
param storageConnectionString string

resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: appServicePlanName
  location: location
  properties: {
    reserved: true
  }
  sku: {
    name: sku
  }
  kind: 'linux'
}

resource appService 'Microsoft.Web/sites@2023-01-01' = {
  name: appServiceName
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    virtualNetworkSubnetId: virtualNetworkSubnetId
    vnetRouteAllEnabled: true
  }
  identity: {
    type: 'SystemAssigned'
  }
}

resource appServiceConfig 'Microsoft.Web/sites/config@2023-01-01' = {
  parent: appService
  name: 'web'
  properties: {
    linuxFxVersion: linuxFxVersion
    appSettings: [
      {
        name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
        value: appInsightsInstrumentationKey
      } 
      {
        name: 'AzureStorageOptions__EmbeddingsContainerName'
        value: azureStorageEmbeddingsContainerName
      }
      {
        name: 'AzureStorageOptions__InputFolderName'
        value: azureStorageInputFolderName
      }      
      {
        name: 'AzureStorageOptions__OutputLatestBlob'
        value: azureStorageOutputLatestBlob
      }
      {
        name: 'AzureStorageOptions__QueueName'
        value: azureStorageQueueName
      }
      {
        name: 'AzureStorageOptions__ReportsFolderName'
        value: azureStorageReportsFolderName
      }
      {
        name: 'AzureStorageOptions__StatusBlob'
        value: azureStorageStatusBlob
      }
      {
        name:'AzureStorageOptions__StorageAccountName'
        value: storageAccountName
      }
      {
        name: 'AzureStorageOptions__ConnectionString'
        value: storageConnectionString
      }
      {
        name: 'ConfigurationSettings__GBUs'
        value: configurationSettingsGBUs
      }
      {
        name: 'ConfigurationSettings__LifeSavingRules'
        value: configurationSettingsLifeSavingRules
      }
      {
        name: 'OpenAIOptions__ApiKey'
        value: openAIApiKey
      }
      {
        name: 'OpenAIOptions__DeploymentName'
        value: openAIDeploymentName
      }
      {
        name: 'OpenAIOptions__Endpoint'
        value: openAIEndpoint
      }
      {
        name: 'OpenIdConfiguration__Audience'
        value: openIdConfigurationAudience
      }
      {
        name: 'OpenIdConfiguration__ClientId'
        value: openIdConfigurationClientId
      }
      {
        name: 'OpenIdConfiguration__Issuer'
        value: openIdConfigurationIssuer
      }
    ]
  }
}

output appServiceId string = appService.id
output appServicePrincipalId string = appService.identity.principalId

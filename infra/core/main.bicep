targetScope = 'resourceGroup'

param suffix string
param location string = resourceGroup().location
param openIdConfigurationClientId string
param containersNames array = [
  'embeddings'  
]
param queuesNames array = [
  'input-validation-queue'
  'generation-queue'
]

var abbrs = loadJsonContent('../abbreviations.json')
var uaManagedIentityContainerAppName = '${abbrs.managedIdentityUserAssignedIdentities}${abbrs.appContainerApps}${suffix}'
var logAnalyticsWorkspaceName = '${abbrs.operationalInsightsWorkspaces}${suffix}'
var appInsightsName = '${abbrs.insightsComponents}${suffix}'
var virtualNetworkName = '${abbrs.networkVirtualNetworks}${suffix}s'
var acrName = '${abbrs.containerRegistryRegistries}${suffix}'
var containerAppsEnvironmentName = '${abbrs.appManagedEnvironments}${suffix}'
var storageAccountName = '${abbrs.storageStorageAccounts}${suffix}'
var appServicePlanName = '${abbrs.webServerFarms}${suffix}'
var appServiceName = '${abbrs.webSitesAppService}${suffix}'
var openAiName = '${abbrs.cognitiveServicesAccounts}${suffix}'
var privateEndpointBlobStorageName = '${abbrs.networkPrivateLinkServices}${abbrs.storageStorageAccounts}${suffix}'
var privateEndpointOpenAiName = '${abbrs.networkPrivateLinkServices}${abbrs.cognitiveServicesAccounts}${suffix}'

module uaManagedIentityContainerApp 'identity/ua-managed-identity.bicep' = {
  name: 'uaManagedIentityContainerAppDeployment'
  params: {
    location: location
    name: uaManagedIentityContainerAppName
  }
}

module logAnalyticsWorkspace 'monitor/log-analytics-workspace.bicep' = {
  name: 'logAnalyticsWorkspaceDeployment'
  params: {
    location: location
    name: logAnalyticsWorkspaceName
  }
}

module appInsights 'monitor/app-insights.bicep' = {
  name: 'appInsightsDeployment'
  params: {
    location: location
    name: appInsightsName
    logAnalyticsWorkspaceId: logAnalyticsWorkspace.outputs.id
  }
}

module virtualNetwork 'network/virtual-network.bicep' = {
  name: 'virtualNetwork'
  params: {
    name: virtualNetworkName
    location: location
  }
}

module containerRegistry 'acr/container-registry.bicep' = {
  name: 'acrDeployment'
  params: {
    name: acrName
    location: location
  }
}

module containerAppsEnvironment 'aca/container-apps-environment.bicep' = {
  name: 'containerAppsEnvironmentDeployment'
  params: {
    location: location
    name: containerAppsEnvironmentName
    logAnalyticsWorkspaceCustomerId: logAnalyticsWorkspace.outputs.customerId
    logAnalyticsWorkspacePrimarySharedKey: logAnalyticsWorkspace.outputs.primarySharedKey
    subnetId: virtualNetwork.outputs.subnet03Id
  }
}

module storageAccount 'storage/storage-account.bicep' = {
  name: 'storageAccountDeployment'
  params: {
    name: storageAccountName
    location: location
    containersNames: containersNames
    queuesNames: queuesNames
  }
}

module appService 'web/app-service.bicep' = {
  name: 'appServiceDeployment'
  params: {
    location: location
    appServicePlanName: appServicePlanName
    appServiceName: appServiceName
    appInsightsInstrumentationKey: appInsights.outputs.instrumentationKey
    virtualNetworkSubnetId: virtualNetwork.outputs.subnet02Id    
    openAIApiKey: openAi.outputs.key1
    openAIEndpoint: openAi.outputs.endpoint
    openIdConfigurationClientId: openIdConfigurationClientId
    storageAccountName: storageAccountName
    storageConnectionString: storageAccount.outputs.primaryConnectionString
  }
}

module openAi 'openai/openai.bicep' = {
  name: 'openAiDeployment'
  params: {
    location: location
    name: openAiName
  }
}

module privateEndpointBlobStorage 'network/private-endpoint.bicep' = {
  name: 'privateEndpointBlobStorage'
  params: {
    privateEndpointName: privateEndpointBlobStorageName
    location: location
    serviceId: storageAccount.outputs.id
    serviceName: storageAccountName
    serviceGroupId: 'blob'
    virtualNetworkId: virtualNetwork.outputs.id
    subnetId: virtualNetwork.outputs.subnet01Id
    privateDnsZoneName: 'privatelink.blob.core.windows.net'
  }
}

module privateEndpointOpenAi 'network/private-endpoint.bicep' = {
  name: 'privateEndpointOpenAI'
  params: {
    privateEndpointName: privateEndpointOpenAiName
    location: location
    serviceId: openAi.outputs.id
    serviceName: openAiName
    serviceGroupId: 'account'
    virtualNetworkId: virtualNetwork.outputs.id
    subnetId: virtualNetwork.outputs.subnet01Id
    privateDnsZoneName: 'privatelink.openai.azure.com'
  }
}

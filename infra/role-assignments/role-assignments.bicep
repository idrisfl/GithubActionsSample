metadata description = 'Creates role assignments.'

param uaManagedIentityName string
param containerRegistryName string
param appServiceName string
param storageAccountName string
param openAiName string

@description('ACR Pull role definition ID') 
var acrPullRoleDefinitionId = '7f951dda-4ed3-4680-a7ca-43fe172d538d'
@description('Storage Blob Data Contributor role definition ID')
var blobDataContributorRoleDefinitionId = 'ba92f5b4-2d11-453d-a403-e96b0029c9fe'
@description('Storage Queue Data Message Sender	 role definition ID')
var storageQueueDataMessageSenderRoleDefinitionId = 'c6a89b2d-59bc-44d0-9896-0f6e12d7b80a'
@description('Storage Queue Data Message Processor role definition ID')
var storageQueueDataMessageProcessorRoleDefinitionId = '8a0f0c08-91a1-4084-bc3d-661d67233fed'
@description('Cognitive Services OpenAI Contributor role definition ID')
var cognitiveServicesOpenAIContributorRoleDefinitionId = 'a001fd3d-188f-4b5d-821b-7da978bf7442'	

resource uaManagedIentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
  name: uaManagedIentityName
}

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' existing = {
  name: containerRegistryName
}

resource acrPullRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: containerRegistry
  name: guid(containerRegistry.id, uaManagedIentity.id, acrPullRoleDefinitionId)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', acrPullRoleDefinitionId)
    principalId: uaManagedIentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

resource appService 'Microsoft.Web/sites@2023-01-01' existing = {
  name: appServiceName
}

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' existing = {
  name: storageAccountName
}

resource blobDataContributorPullRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: storageAccount
  name: guid(storageAccount.id, appService.id, blobDataContributorRoleDefinitionId)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', blobDataContributorRoleDefinitionId)
    principalId: appService.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

resource blobDataContributorUamiRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: storageAccount
  name: guid(storageAccount.id, uaManagedIentity.id, blobDataContributorRoleDefinitionId)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', blobDataContributorRoleDefinitionId)
    principalId: uaManagedIentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}


resource storageQueueDataMessageSenderRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: storageAccount
  name: guid(storageAccount.id, appService.id, storageQueueDataMessageSenderRoleDefinitionId)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', storageQueueDataMessageSenderRoleDefinitionId)
    principalId: appService.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

resource storageQueueDataMessageProcessorRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: storageAccount
  name: guid(storageAccount.id, uaManagedIentity.id, storageQueueDataMessageProcessorRoleDefinitionId)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', storageQueueDataMessageProcessorRoleDefinitionId)
    principalId: uaManagedIentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

resource openAi 'Microsoft.CognitiveServices/accounts@2023-05-01' existing = {
  name: openAiName
}

resource cognitiveServicesOpenAIContributorRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: openAi
  name: guid(openAi.id, uaManagedIentity.id, cognitiveServicesOpenAIContributorRoleDefinitionId)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', cognitiveServicesOpenAIContributorRoleDefinitionId)
    principalId: uaManagedIentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

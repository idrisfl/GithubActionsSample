targetScope = 'resourceGroup'

var acrName = '${abbrs.containerRegistryRegistries}${suffix}'

param suffix string
param location string = resourceGroup().location
var containerList = ['main', 'filtering', 'generate_embeddings'] // Construct container and images based on this list
var containerNames = [for (container, i) in containerList: '${replace(container, '_', '-')}-container']
var imageNames = [for (imageName, i) in containerList: '${acrName}.azurecr.io/reflecta-generation/${imageName}:1.0.0']

var abbrs = loadJsonContent('../abbreviations.json')
var uaManagedIdentityContainerAppName = '${abbrs.managedIdentityUserAssignedIdentities}${abbrs.appContainerApps}${suffix}'
var containerAppsEnvironmentName = '${abbrs.appManagedEnvironments}${suffix}'
var containerAppName = '${abbrs.appContainerApps}${suffix}'
var openAiName = '${abbrs.cognitiveServicesAccounts}${suffix}'
var storageAccountName = '${abbrs.storageStorageAccounts}${suffix}'
var filteringQueueName = 'input-validation-queue'
var storageQueueName = 'generation-queue'
var storageContainerName = 'embeddings'
param costCompletionGpt432 string = 'gpt-4-32k-deployment'
param costCompletionGpt48 string = 'gpt-4-deployment'
param costPromptGpt432 string = 'gpt-4-32k-deployment'
param costPromptGpt48 string = 'gpt-4-deployment'

module containerApp 'container-app.bicep' = {
  name: containerAppsEnvironmentName
  params: {
    location: location
    containerAppName: containerAppName
    environmentName: containerAppsEnvironmentName
    uaManagedIentityName: uaManagedIdentityContainerAppName
    containerNames: containerNames
    imageNames: imageNames
    openAiName: openAiName
    storageAccountName: storageAccountName
    storageQueueName: storageQueueName
    storageContainerName: storageContainerName
    filteringQueueName: filteringQueueName
    costCompletionGpt432: costCompletionGpt432
    costCompletionGpt48: costCompletionGpt48
    costPromptGpt432: costPromptGpt432
    costPromptGpt48: costPromptGpt48
    acrName: acrName
  }
}

// // @description('Storage Blob Data Contributor role definition ID')
// // var blobDataContributorRoleDefinitionId = 'ba92f5b4-2d11-453d-a403-e96b0029c9fe'

// // resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' existing = {
// //   name: storageAccountName
// // }

// // resource uaManagedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
// //   name: uaManagedIdentityContainerAppName
// // }

// // // Get the existing container app instance by name
// // resource containerAppInstance 'Microsoft.App/containerApps@2023-05-01' existing = {
// //   name: containerAppName
// // }

// // // Add Blob Data Contributor role to the container app managed identity
// // resource containerAppRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
// //   name: guid(storageAccount.id, containerAppInstance.id, blobDataContributorRoleDefinitionId)
// //   scope: storageAccount
// //   properties: {
// //     principalId: containerAppInstance.identity.userAssignedIdentities[uaManagedIdentity.id].principalId
// //     principalType: 'ServicePrincipal'
// //     roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', blobDataContributorRoleDefinitionId)
// //   }
// // }

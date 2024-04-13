metadata description = 'Creates a Container App.'

param location string = resourceGroup().location
param environmentName string
param containerAppName string
param uaManagedIentityName string
param containerNames array
param imageNames array
param openAiName string
param storageAccountName string
param storageQueueName string
param storageContainerName string
param filteringQueueName string
param costCompletionGpt432 string
param costCompletionGpt48 string
param costPromptGpt432 string
param costPromptGpt48 string
param acrName string

resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' existing = {
  name: environmentName
}

resource uaManagedIentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
  name: uaManagedIentityName
}

resource openAI 'Microsoft.CognitiveServices/accounts@2023-05-01' existing = {
  name: openAiName
}

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' existing = {
  name: storageAccountName
}

resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: containerAppName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${uaManagedIentity.id}': {}
    }
  }
  properties: {
    configuration: {
      registries: [
        {
          identity: uaManagedIentity.id
          passwordSecretRef: ''
          server: '${acrName}.azurecr.io'
          username: ''
        }
      ]
      secrets: [
        {
          name: 'openai-api-key'
          value: openAI.listKeys().key1
        }
        {
          name: 'azure-storage-connection-string'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${listKeys(storageAccount.id, storageAccount.apiVersion).keys[0].value};EndpointSuffix=${environment().suffixes.storage}'
        }
      ]
    }
    environmentId: containerAppsEnvironment.id
    template: {
      containers: [
        for (containerName, i) in containerNames: {
          name: containerNames[i]
          image: imageNames[i]
          command: []
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            {
              name: 'OPENAI_API_KEY'
              secretRef: 'openai-api-key'
            }
            {
              name: 'OPENAI_API_BASE'
              value: openAI.properties.endpoint
            }
            {
              name: 'AZURE_STORAGE_ACCOUNT_NAME'
              value: storageAccountName
            }
            {
              name: 'AZURE_STORAGE_QUEUE_NAME'
              value: storageQueueName
            }
            {
              name: 'AZURE_CONTAINER_NAME'
              value: storageContainerName
            }
            {
              name: 'FILTERING_QUEUE_NAME'
              value: filteringQueueName
            }
            {
              name: 'COST_COMPLETION_GPT432'
              value: costCompletionGpt432
            }
            {
              name: 'COST_COMPLETION_GPT48'
              value: costCompletionGpt48
            }
            {
              name: 'COST_PROMPT_GPT432'
              value: costPromptGpt432
            }
            {
              name: 'COST_PROMPT_GPT48'
              value: costPromptGpt48
            }
            {
              name: 'AZURE_CLIENT_ID'
              value: uaManagedIentity.properties.clientId
            }
            {
              name: 'AZURE_STORAGE_CONNECTION_STRING'
              secretRef: 'azure-storage-connection-string'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
      }
    }
  }
}

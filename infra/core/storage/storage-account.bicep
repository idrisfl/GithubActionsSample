metadata description = 'Creates an Azure storage account.'

param name string
param location string = resourceGroup().location
param sku object = { name: 'Standard_LRS' }
@allowed(['Cool', 'Hot', 'Premium' ])
param accessTier string = 'Hot'
param allowBlobPublicAccess bool = true
param supportsHttpsTrafficOnly bool = true
@allowed([ 'Enabled', 'Disabled' ])
param publicNetworkAccess string = 'Disabled'
param containersNames array
param queuesNames array

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: name
  location: location
  kind: 'StorageV2'
  sku: sku
  properties: {
    accessTier: accessTier
    allowBlobPublicAccess: allowBlobPublicAccess
    allowSharedKeyAccess: false
    defaultToOAuthAuthentication: false
    publicNetworkAccess: publicNetworkAccess
    supportsHttpsTrafficOnly: supportsHttpsTrafficOnly
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  name: 'default'
  parent: storageAccount
}

resource containers 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = [for name in containersNames: {
  name: name
  parent: blobService
  properties: {
    publicAccess: 'None'
    metadata: {}
  }
}]

resource queueService 'Microsoft.Storage/storageAccounts/queueServices@2023-01-01' = {
  name: 'default'
  parent: storageAccount
}

resource queues 'Microsoft.Storage/storageAccounts/queueServices/queues@2023-01-01' = [for name in queuesNames: {
  name: name
  parent: queueService
}]

output id string = storageAccount.id
output primaryConnectionString string = 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${listKeys(storageAccount.id, storageAccount.apiVersion).keys[0].value};EndpointSuffix=${environment().suffixes.storage}'

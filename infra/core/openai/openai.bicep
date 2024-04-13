metadata description = 'Creates an Azure OpenAI instance.'

param name string
param location string = resourceGroup().location
param deployments array = [
  {
    name: 'gpt-4-deployment'
    model: 'gpt-4'
    version: '0613'
  }
  {
    name: 'gpt-4-32k-deployment'
    model: 'gpt-4-32k'
    version: '0613'
  }
  {
    name: 'text-embedding-ada-002-deployment'
    model: 'text-embedding-ada-002'
    version: '2'
  }
]

param kind string = 'OpenAI'

@allowed([ 'Enabled', 'Disabled' ])
param publicNetworkAccess string = 'Disabled'
param sku object = {
  name: 'S0'
}

param allowedIpRules array = []
param networkAcls object = {
  ipRules: allowedIpRules
  defaultAction: 'Deny'
}

resource openAI 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: name
  location: location
  kind: kind
  properties: {
    customSubDomainName: name
    publicNetworkAccess: publicNetworkAccess
    networkAcls: networkAcls
  }
  sku: sku
}

@batchSize(1)
resource deployment 'Microsoft.CognitiveServices/accounts/deployments@2023-05-01' = [for deployment in deployments: {
  parent: openAI
  name: deployment.name
  properties: {
    model: {
      format: 'OpenAI'
      name: deployment.model
      version: deployment.version
    }
    raiPolicyName: contains(deployment, 'raiPolicyName') ? deployment.raiPolicyName : null
  }
  sku: contains(deployment, 'sku') ? deployment.sku : {
    name: 'Standard'
    capacity: 10
  }
}]

output id string = openAI.id
output endpoint string = openAI.properties.endpoint
output key1 string = openAI.listKeys().key1

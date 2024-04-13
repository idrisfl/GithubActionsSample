metadata description = 'Creates a user managed identity.'

param location string = resourceGroup().location
param name string

resource uaManagedIentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: name
  location: location
}

output id string = uaManagedIentity.id
output principalId string = uaManagedIentity.properties.principalId

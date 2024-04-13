metadata description = 'Creates an Azure Container Registry.'

param name string
param location string = resourceGroup().location
@allowed([ 'Basic', 'Standard', 'Premium' ])
param sku string = 'Standard'
param adminUserEnabled bool = false

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: name
  location: location
  sku: {
    name: sku
  }
  properties: {
    adminUserEnabled: adminUserEnabled
  }
}

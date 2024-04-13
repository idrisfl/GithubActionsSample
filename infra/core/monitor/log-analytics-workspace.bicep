metadata description = 'Creates a Log Analytics Workspace.'

param location string = resourceGroup().location
param name string
param sku string = 'PerGB2018'
param retentionInDays int = 30

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: name
  location: location
  properties: {
    sku: {
      name: sku
    }
    retentionInDays: retentionInDays
  }
}

output id string = logAnalyticsWorkspace.id
output customerId string = logAnalyticsWorkspace.properties.customerId
output primarySharedKey string = logAnalyticsWorkspace.listKeys().primarySharedKey

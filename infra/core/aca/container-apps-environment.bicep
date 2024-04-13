metadata description = 'Creates a Container Apps Environment and its associated Log Analytics Workspace.'

param location string = resourceGroup().location
param name string
param logAnalyticsWorkspaceCustomerId string
param logAnalyticsWorkspacePrimarySharedKey string
param subnetId string

resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: name
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsWorkspaceCustomerId
        sharedKey: logAnalyticsWorkspacePrimarySharedKey
      }
    }
    vnetConfiguration: {
      infrastructureSubnetId: subnetId
      internal: true
    }
  }
}

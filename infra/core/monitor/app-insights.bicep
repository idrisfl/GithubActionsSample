metadata description = 'Creates an Application insights.'

param name string
param location string = resourceGroup().location
param logAnalyticsWorkspaceId string

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: name
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspaceId
  }
}

output instrumentationKey string = appInsights.properties.InstrumentationKey

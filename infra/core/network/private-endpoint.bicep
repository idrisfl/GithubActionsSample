metadata description = 'Creates a Private Endpoint for a specific service'
param location string = resourceGroup().location
param privateEndpointName string
param subnetId string
param serviceId string
param serviceName string
param serviceGroupId string
param privateDnsZoneName string
param virtualNetworkId string
param tags object = {}

var privateEndpointDnsGroupName = '${privateEndpointName}/${serviceGroupId}dnsgroup'

resource privateEndpoint 'Microsoft.Network/privateEndpoints@2021-05-01' = {
  name: privateEndpointName
  location: location
  tags: tags
  properties: {
    subnet: {
      id: subnetId
    }
    privateLinkServiceConnections: [
      {
        name: '${privateEndpointName}-connection-${serviceName}'
        properties: {
          privateLinkServiceId: serviceId
          groupIds: [
            serviceGroupId
          ]
        }
      }
    ]
  }
}

resource privateDnsZone 'Microsoft.Network/privateDnsZones@2020-06-01' = {
  name: privateDnsZoneName
  location: 'global'
  properties: {}
}

resource privateDnsZoneLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = {
  parent: privateDnsZone
  name: '${privateDnsZoneName}-link'
  location: 'global'
  properties: {
    registrationEnabled: false
    virtualNetwork: {
      id: virtualNetworkId
    }
  }
}

resource privateEndpointDnsGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2021-05-01' = {
  name: privateEndpointDnsGroupName
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'config1'
        properties: {
          privateDnsZoneId: privateDnsZone.id
        }
      }
    ]
  }
}

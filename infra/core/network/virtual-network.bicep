metadata description = 'Creates a virtual network with two subnets, one of which is delegated to the Microsoft.Web/serverFarms service.'
param name string
param location string = resourceGroup().location
param addressPrefix string = '10.0.0.0/16'
param tags object = {}
param subnet01Name string = 'default'
param subnet01Prefix string = '10.0.0.0/24'
param subnet02Name string = 'webappSubnet'
param subnet02Prefix string = '10.0.1.0/24'
param subnet03Name string = 'caeSubnet'
param subnet03Prefix string = '10.0.2.0/23'

resource virtualNetwork 'Microsoft.Network/virtualNetworks@2022-05-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    addressSpace: {
      addressPrefixes: [
        addressPrefix
      ]
    }
    subnets: [
      {
        name: subnet01Name
        properties: {
          addressPrefix: subnet01Prefix
          privateEndpointNetworkPolicies: 'Disabled'
        }
      }
      {
        name: subnet02Name
        properties: {
          addressPrefix: subnet02Prefix
          privateEndpointNetworkPolicies: 'Disabled'
          delegations: [
            {
              name: 'delegation'
              properties: {
                serviceName: 'Microsoft.Web/serverFarms'
              }
            }
          ]
        }
      }
      {
        name: subnet03Name
        properties: {
          addressPrefix: subnet03Prefix
          privateEndpointNetworkPolicies: 'Disabled'
        }
      }
    ]
  }
}

output id string = virtualNetwork.id
output subnet01Id string = '${virtualNetwork.id}/subnets/${subnet01Name}'
output subnet02Id string = '${virtualNetwork.id}/subnets/${subnet02Name}'
output subnet03Id string = '${virtualNetwork.id}/subnets/${subnet03Name}'

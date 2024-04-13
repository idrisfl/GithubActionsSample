targetScope = 'resourceGroup'

param suffix string

var abbrs = loadJsonContent('../abbreviations.json')
var uaManagedIentityContainerAppName = '${abbrs.managedIdentityUserAssignedIdentities}${abbrs.appContainerApps}${suffix}'
var acrName = '${abbrs.containerRegistryRegistries}${suffix}'
var storageAccountName = '${abbrs.storageStorageAccounts}${suffix}'
var appServiceName = '${abbrs.webSitesAppService}${suffix}'
var openAiName = '${abbrs.cognitiveServicesAccounts}${suffix}'

module roleAssignments 'role-assignments.bicep' = {
  name: 'roleAssignmentsDeployment'
  params: {
    uaManagedIentityName: uaManagedIentityContainerAppName
    containerRegistryName: acrName
    appServiceName: appServiceName
    storageAccountName: storageAccountName
    openAiName: openAiName
  }
}

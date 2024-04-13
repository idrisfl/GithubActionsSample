$timestamp=Get-Date -Format 'yyyyMMddhhmmss'
$suffix='reflectapoc2'
$coreDeploymentName=$suffix+'-dep-'+$timestamp
$roleAssignmentsDeploymentName='ra-'+$suffix+'-dep-'+$timestamp
$containerAppDeploymentName='ca-'+$suffix+'-dep-'+$timestamp
$resourceGroupName='rg-'+$suffix
$coreTemplateFileName='core/main.bicep'
$roleAssignmentsTemplateFileName='role-assignments/main.bicep'
$containerAppTemplateFileName='container-app/main.bicep'
$deploymentMode='incremental' # can be either 'complete' or 'incremental'
$location='francecentral'
$containerNames=@('main-container', 'filtering-container', 'generate-embeddings-container')
$imageNames=@('crreflectademo.azurecr.io/reflecta-generation/main:1.0.0', 'crreflectademo.azurecr.io/reflecta-generation/filtering:1.0.0', 'crreflectademo.azurecr.io/reflecta-generation/generate_embeddings:1.0.0')
$openIdConfigurationClientId='00000000-0000-0000-0000-000000000000'

az group create --name $resourceGroupName --location $location
az deployment group create --resource-group $resourceGroupName --name $coreDeploymentName --mode $deploymentMode --template-file $coreTemplateFileName --parameters suffix=$suffix openIdConfigurationClientId=$openIdConfigurationClientId
az deployment group create --resource-group $resourceGroupName --name $roleAssignmentsDeploymentName --mode $deploymentMode --template-file $roleAssignmentsTemplateFileName --parameters suffix=$suffix
az deployment group create --resource-group $resourceGroupName --name $containerAppDeploymentName --mode $deploymentMode --template-file $containerAppTemplateFileName --parameters suffix=$suffix

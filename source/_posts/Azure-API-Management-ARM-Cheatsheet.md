---
title: Azure API Management ARM Cheat sheet
tags: 
- Azure
- API Management
date: 2018-12-19 10:09:25
---

Deploying an API Management instance via ARM is complicated. I've created a cheat sheet to help you out.
Alot is copied from a complete template originating from [Github](https://github.com/Azure/azure-quickstart-templates/tree/master/201-api-management-create-all-resources).

## ARM
ARM might be the way to deploy a pre-setup instance. For adding API's to an existing API Management instance I prefer to use the [API Management extensions](https://github.com/stephaneey/azure-apim-extension) from the Azure DevOps Marketplace. 

### Instance
Parameterize every option, in your ARM script. Resources sucha as policies, products, api's and such go into the sub resources array.
```json
{
    "apiVersion": "2017-03-01",
    "name": "[variables('apiManagementServiceName')]",
    "type": "Microsoft.ApiManagement/service",
    "location": "[parameters('location')]",
    "tags": {},
    "sku": {
        "name": "[parameters('sku')]",
        "capacity": "[parameters('skuCount')]"
    },
    "properties": {
        "publisherEmail": "[parameters('publisherEmail')]",
        "publisherName": "[parameters('publisherName')]"
    },
    "resources": []
}
```

### Tenant policy
To create a tenant wide policy.
```json
{
    "apiVersion": "2017-03-01",
    "type": "policies",
    "name": "policy",
    "dependsOn": [
        "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'))]"
    ],
    "properties": {
        "policyContent": "[parameters('tenantPolicy')]"
    }
}
```

### API's
Adding API's can be done via Open API definitions. If your Open API definition doesn't contain a `host` property, like: `"host":"somewebsite.azurewebsites.net"`. Then you should add the `service url` property inside your ARM.
```json
{
    "apiVersion": "2017-03-01",
    "type": "apis",
    "name": "PetStoreSwaggerImportExample",
    "dependsOn": [
        "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'))]"
    ],
    "properties": {
        "contentFormat": "SwaggerLinkJson",
        "contentValue": "http://petstore.swagger.io/v2/swagger.json",
        "path": "examplepetstore"
    }
}
```

You can also add operations manually, without using Open API definitions.

```json
{
    "apiVersion": "2017-03-01",
    "type": "apis",
    "name": "exampleApi",
    "dependsOn": [
        "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'))]"
    ],
    "properties": {
        "displayName": "Example API Name",
        "description": "Description for example API",
        "serviceUrl": "https://example.net",
        "path": "exampleapipath",
        "protocols": [
            "HTTPS"
        ]
    },
    "resources": [
        {
            "apiVersion": "2017-03-01",
            "type": "operations",
            "name": "exampleOperationsDELETE",
            "dependsOn": [
                "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'), '/apis/exampleApi')]"
            ],
            "properties": {
                "displayName": "DELETE resource",
                "method": "DELETE",
                "urlTemplate": "/resource",
                "description": "A demonstration of a DELETE call"
            }
        },
        {
            "apiVersion": "2017-03-01",
            "type": "operations",
            "name": "exampleOperationsGET",
            "dependsOn": [
                "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'), '/apis/exampleApi')]"
            ],
            "properties": {
                "displayName": "GET resource",
                "method": "GET",
                "urlTemplate": "/resource",
                "description": "A demonstration of a GET call"
            },
            "resources": [
                {
                    "apiVersion": "2017-03-01",
                    "type": "policies",
                    "name": "policy",
                    "dependsOn": [
                        "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'))]",
                        "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'), '/apis/exampleApi')]",
                        "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'), '/apis/exampleApi/operations/exampleOperationsGET')]"
                    ],
                    "properties": {
                        "policyContent": "[parameters('operationPolicy')]"
                    }
                }
            ]
        }
    ]
}
```
There are also other ways, such as WSDL, and inserting Open API definitions as a value in your ARM.
See the [documentation](https://docs.microsoft.com/en-us/azure/templates/microsoft.apimanagement/2017-03-01/service/apis) and check for `contentFormat` and `contentValue`.

### Product
To create a product and add API's directly to the product.
```json
{
    "apiVersion": "2017-03-01",
    "type": "products",
    "name": "exampleProduct",
    "dependsOn": [
        "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'))]"
    ],
    "properties": {
        "displayName": "Example Product Name",
        "description": "Description for example product",
        "terms": "Terms for example product",
        "subscriptionRequired": true,
        "approvalRequired": false,
        "subscriptionsLimit": 1,
        "state": "published"
    },
    "resources": [
        {
            "apiVersion": "2017-03-01",
            "type": "apis",
            "name": "exampleApi",
            "dependsOn": [
                "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'))]",
                "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'), '/apis/exampleApi')]",
                "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'), '/products/exampleProduct')]"
            ]
        },
        {
            "apiVersion": "2017-03-01",
            "type": "policies",
            "name": "policy",
            "dependsOn": [
                "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'))]",
                "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'), '/products/exampleProduct')]"
            ],
            "properties": {
                "policyContent": "[parameters('productPolicy')]"
            }
        }
    ]
}
```

### User
To create a user. But think of using Azure AAD integration.
```json
{
    "apiVersion": "2017-03-01",
    "type": "users",
    "name": "exampleUser1",
    "dependsOn": [
        "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'))]"
    ],
    "properties": {
        "firstName": "ExampleFirstName1",
        "lastName": "ExampleLastName1",
        "email": "ExampleFirst1@example.com",
        "state": "active",
        "note": "note for example user 1"
    }
}
```

### Group
To create a group of users.
```json
{
    "apiVersion": "2017-03-01",
    "type": "groups",
    "name": "exampleGroup",
    "dependsOn": [
        "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'))]"
    ],
    "properties": {
        "displayName": "Example Group Name",
        "description": "Example group description"
    },
    "resources": [
        {
            "apiVersion": "2017-03-01",
            "type": "users",
            "name": "exampleUser3",
            "dependsOn": [
                "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'))]",
                "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'), '/groups/exampleGroup')]"
            ]
        }
    ]
}
```

### Subscription
To create a subscription for a user.
```json
{
    "apiVersion": "2017-03-01",
    "type": "subscriptions",
    "name": "examplesubscription1",
    "dependsOn": [
        "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'))]",
        "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'), '/products/exampleProduct')]",
        "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'), '/users/exampleUser1')]"
    ],
    "properties": {
        "productId": "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ApiManagement/service/exampleServiceName/products/exampleProduct",
        "userId": "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ApiManagement/service/exampleServiceName/users/exampleUser1"
    }
}
```

### Named values
Add named values, often used in policies as variables.
```json
{
    "apiVersion": "2017-03-01",
    "type": "properties",
    "name": "exampleproperties",
    "dependsOn": [
        "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'))]"
    ],
    "properties": {
        "displayName": "propertyExampleName",
        "value": "propertyExampleValue",
        "tags": [
            "exampleTag"
        ]
    }
}
```

### Certificate
To create a certificate.
```json
{
    "apiVersion": "2017-03-01",
    "type": "certificates",
    "name": "exampleCertificate",
    "dependsOn": [
        "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'))]"
    ],
    "properties": {
        "data": "[parameters('mutualAuthenticationCertificate')]",
        "password": "[parameters('certificatePassword')]"
    }
}
```

#### OpenId Connect
For OpenId integration.
```json
{
    "apiVersion": "2017-03-01",
    "type": "openidConnectProviders",
    "name": "exampleOpenIdConnectProvider",
    "dependsOn": [
        "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'))]"
    ],
    "properties": {
        "displayName": "exampleOpenIdConnectProviderName",
        "description": "Description for example OpenId Connect provider",
        "metadataEndpoint": "https://example-openIdConnect-url.net",
        "clientId": "exampleClientId",
        "clientSecret": "[parameters('openIdConnectClientSecret')]"
    }
}
```

#### Identity providers
You can add multiple identity providers. The following providers are available.
```json
["facebook",
"google",
"microsoft",
"twitter",
"aad",
"aadB2C"]
```

```json
{
    "apiVersion": "2017-03-01",
    "type": "identityProviders",
    "name": "google",
    "dependsOn": [
        "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'))]"
    ],
    "properties": {
        "clientId": "googleClientId",
        "clientSecret": "[parameters('googleClientSecret')]"
    }
}
```

### Logger
You can use either `EventHub` or `Application Insights` as a Logging framework.
The difference is in the credentials.

#### Eventhub
```json
{
    "apiVersion": "2017-03-01",
    "type": "loggers",
    "name": "exampleLogger",
    "dependsOn": [
        "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'))]"
    ],
    "properties": {
        "loggerType": "azureEventHub",
        "description": "Description for example logger",
        "credentials": {
            "name": "exampleEventHubName",
            "connectionString": "[parameters('eventHubNamespaceConnectionString')]"
        }
    }
}
```

#### Application Insights
```json
{
    "apiVersion": "2017-03-01",
    "type": "loggers",
    "name": "exampleLogger",
    "dependsOn": [
        "[concat('Microsoft.ApiManagement/service/', variables('apiManagementServiceName'))]"
    ],
    "properties": {
        "loggerType": "applicationInsights",
        "description": "Description for example logger",
        "credentials": "3e2e9837-b17b-44b3-a652-ed296080c57d"
    }
}
```

## Reference
[Microsoft ARM Docs](https://docs.microsoft.com/en-us/azure/templates/microsoft.apimanagement/2018-01-01/service)

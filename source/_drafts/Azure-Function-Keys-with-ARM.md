---
title: Azure Function Keys with ARM
tags:
---


```json
{
  "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "functionAppResourceGroup": {
      "type": "string",
      "metadata": {
        "description": "The resource group of the function app that you wish to get the key from."
      }
    },
    "functionAppName": {
      "type": "string",
      "metadata": {
        "description": "The name of the function app that you wish to get the key from."
      }
    },
    "keyVaultName": {
      "type": "string",
      "metadata": {
        "description": "The name of the key vault you wish to put the key in."
      }
    }
  },
  "variables": {
    "functionAppId": "[concat(parameters('functionAppResourceGroup'),'/providers/Microsoft.Web/sites/', parameters('functionAppName'))]"
  },
  "resources": [
    {
      "type": "Microsoft.KeyVault/vaults/secrets",
      "name": "[concat(parameters('keyVaultName'),'/', parameters('functionAppName'))]",
      "apiVersion": "2015-06-01",
      "properties": {
        "contentType": "text/plain",
        "value": "[listkeys(concat(variables('functionAppId'), '/host/default/'),'2016-08-01').functionKeys.default]"
      },
      "dependsOn": []
    }
  ]
}
```
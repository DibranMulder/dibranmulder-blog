---
title: Secrets in Azure DevOps the bad parts
tags: 'Azure DevOps, Secrets, FoxIt, Azure, ResourceGroups.'
date: 2018-10-25 12:30:57
---

Storing secrets inside your build and release pipeline variables is a bad practise and Microsoft advises not to use it, but use KeyVault instead. However fact is, is that its also very convenient and easy to use, so people are going to use it alot. But what are the risks of using this? Are your secrets save?

## Decrypting secrets
May 17th of 2018 FoxIt published [a tool](https://www.fox-it.com/en/insights/blogs/blog/introducing-team-foundation-server-decryption-tool/) to decrypt secrets from the TFS/VSTS and now AzureDevops variable stores. This tool on itself is a huge risk from a compliance and security perspective.

Imagine you store connection strings or passwords inside the variables store and they provide access to your production databases. Malicious developers are now able to retrieve those secrets and do their harm. Without any trace. Since you are not able to get a trace log from Azure DevOps. A better way the prevent variables to be decrypted is the read them from KeyVault. 

<img src="/images/secrets.png" />

## Secrets in ARM scripts
Another risk with using secrets inside ARM scripts is the risk of exposing variables without knowing it. ARM parameters are often strings, for example: usernames, password, connection strings, etc. Those strings might come from trusted sources maybe even a KeyVault. One mistake thats often made is that those parameters are of type string. See the example below, these are the parameters for a basic WebApp ARM Script. In this WebApp we want to access a database and we want to have the connection string to that database as a parameter.

```json
{
    "parameters": {
        "webAppName": {
            "type": "string",
            "metadata": {
                "description": "Base name of the resource such as web app name and app service plan "
            },
            "minLength": 2
        },
        "sku":{
            "type": "string",
            "defaultValue" : "S1",
            "metadata": {
                "description": "The SKU of App Service Plan, by defaut is standard  S1"
            }
        },
        "location": {
            "type": "string",
            "defaultValue": "[resourceGroup().location]",
            "metadata": {
                "description": "Location for all resources."
            }
        },
        "databaseConnectionString": {
            "type": "string",
            "defaultValue": "",
            "metadata": {
                "description": "The connection string to the database."
            }
        }
    }
}
```
What a lot of people don't know is that you can look into the deployments of a Resource Group. Simply go to `Resource groups` > `Deployments` and select one. If a parameter is not marked as type: `securestring` then it will be shown in plain text. The bad part of this experience is that you require very few rights to look into the deployments of a resource group. Read rights are enough. You are for instance prohibited to look into the app settings or connection strings of a WebApp but you are often allowed to look into this deployments.

The correct parameter type should be the following:
```json
{
    "parameters": {
        "databaseConnectionString": {
            "type": "securestring",
            "defaultValue": "",
            "metadata": {
                "description": "The connection string to the database."
            }
        }
    }
}
```
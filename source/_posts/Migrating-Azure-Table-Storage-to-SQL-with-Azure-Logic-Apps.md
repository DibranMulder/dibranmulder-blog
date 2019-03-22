---
title: Migrating Azure Table Storage to SQL with Azure Logic Apps
tags:
  - Azure
  - Table Storage
  - Logic Apps
  - SQL Server
date: 2019-03-22 09:36:42
---
I've created an App that uses Azure Table Storage as a backing store. At first this looked like the right decision but after a while I figured that I should migrate to a relational database. But in the mean while the Table Storage database grew quite big. I'm not talking about millions of records but more like: 5 tables with about 100k of records in it. So how do you migrate that data to a SQL Server database? I figured I would use Azure Logic Apps.

<img src="/images/logicapps/start-logic-app.png" />

It all starts with a trigger, in Azure Logic Apps a manual trigger is often an Http Request. After that I initialize 2 variables, the `FirstRun` and `NextRowKey` variables. The `FirstRun` is used to call the Azure Table Storage tables without a `NextRowKey` query parameter. Once the first page is fetched this variable will be set to `false` and the subsequent pages will be requested with a `NextRowKey` query parameter. This is the first step to fetch your data with pages. **Bear in mind Azure Table Storage can only return 1000 records per request!** 

The JSON for initializing the variables.
```json
{
    "Init_first_run": {
        "inputs": {
            "variables": [
                {
                    "name": "FirstRun",
                    "type": "Boolean",
                    "value": true
                }
            ]
        },
        "runAfter": {},
        "type": "InitializeVariable"
    },
    "Initialize_nextrowkey": {
        "inputs": {
            "variables": [
                {
                    "name": "NextRowKey",
                    "type": "String",
                    "value": ""
                }
            ]
        },
        "runAfter": {
            "Init_first_run": [
                "Succeeded"
            ]
        },
        "type": "InitializeVariable"
    }
}
```

<img src="/images/logicapps/until.png" />
The next part is to repeat the fetch records part until there are no more records or when its the first run. I use this expression to check wether to continue or not: `@and(equals(variables('NextRowKey'), null), not(variables('FirstRun')))`

After that I use a condition Action to check whether its the first run or not. Remember I initialize a variable to determine if its the first run.  If its the first run that obviously we've to set the `FirstRun` variable to `false`. After that its just quite simple, either we fetch a page with a `NextRowKey` query parameter or not. Either way we Parse the outcome of the fetch entities and loop over it to insert the records into the SQL database.

The trick is to retrieve the `NextRowKey` token from the Http Response header of the `Get Entities` action. I've searched in the documentation but its actually quite hard to come up with an expression to get it. But here it is: ```json
{
    "Set_variable": {
        "inputs": {
            "name": "NextRowKey",
            "value": "@{actions('Get_next_page')?['outputs']?['headers']?['x-ms-continuation-NextRowKey']}"
        },
        "runAfter": {
            "Get_next_page": [
                "Succeeded"
            ]
        },
        "type": "SetVariable"
    }
}
```

So basically, we refer to the `action` to fetch the next page, check at its `ouputs`, look at its `headers` and get the `x-ms-continuation-NextRowKey`. We then set the value of it in the `NextRowKey` iteration and use it to fetch the next page. Its actually quite easy but sometimes it can be hard to get the right syntax. I find this [Workflow definition functions reference documentation]('https://docs.microsoft.com/en-us/azure/logic-apps/workflow-definition-language-functions-reference') very handy.

## Complete Workflow definition 

```json
{
    "$connections": {
        "value": {
            "azuretables": {
                "connectionId": "/subscriptions/9b4ed9c7-de20-49df-b301-d39322443140/resourceGroups/TradersmateBackend/providers/Microsoft.Web/connections/azuretables",
                "connectionName": "azuretables",
                "id": "/subscriptions/9b4ed9c7-de20-49df-b301-d39322443140/providers/Microsoft.Web/locations/westeurope/managedApis/azuretables"
            },
            "sql": {
                "connectionId": "/subscriptions/9b4ed9c7-de20-49df-b301-d39322443140/resourceGroups/TradersmateBackend/providers/Microsoft.Web/connections/sql",
                "connectionName": "sql",
                "id": "/subscriptions/9b4ed9c7-de20-49df-b301-d39322443140/providers/Microsoft.Web/locations/westeurope/managedApis/sql"
            }
        }
    },
    "definition": {
        "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
        "actions": {
            "Init_first_run": {
                "inputs": {
                    "variables": [
                        {
                            "name": "FirstRun",
                            "type": "Boolean",
                            "value": true
                        }
                    ]
                },
                "runAfter": {},
                "type": "InitializeVariable"
            },
            "Initialize_nextrowkey": {
                "inputs": {
                    "variables": [
                        {
                            "name": "NextRowKey",
                            "type": "String",
                            "value": ""
                        }
                    ]
                },
                "runAfter": {
                    "Init_first_run": [
                        "Succeeded"
                    ]
                },
                "type": "InitializeVariable"
            },
            "Until": {
                "actions": {
                    "Condition": {
                        "actions": {
                            "Get_first_page": {
                                "inputs": {
                                    "host": {
                                        "connection": {
                                            "name": "@parameters('$connections')['azuretables']['connectionId']"
                                        }
                                    },
                                    "method": "get",
                                    "path": "/Tables/@{encodeURIComponent('yourTable')}/entities",
                                    "queries": {
                                        "$select": "PropA, PropB"
                                    }
                                },
                                "runAfter": {
                                    "Set_variable_3": [
                                        "Succeeded"
                                    ]
                                },
                                "type": "ApiConnection"
                            },
                            "Set_variable_2": {
                                "inputs": {
                                    "name": "NextRowKey",
                                    "value": "@{actions('Get_first_page')?['outputs']?['headers']?['x-ms-continuation-NextRowKey']}"
                                },
                                "runAfter": {
                                    "Get_first_page": [
                                        "Succeeded"
                                    ]
                                },
                                "type": "SetVariable"
                            },
                            "Set_variable_3": {
                                "inputs": {
                                    "name": "FirstRun",
                                    "value": false
                                },
                                "runAfter": {},
                                "type": "SetVariable"
                            }
                        },
                        "else": {
                            "actions": {
                                "Get_next_page": {
                                    "inputs": {
                                        "host": {
                                            "connection": {
                                                "name": "@parameters('$connections')['azuretables']['connectionId']"
                                            }
                                        },
                                        "method": "get",
                                        "path": "/Tables/@{encodeURIComponent('userTrackedProducts')}/entities",
                                        "queries": {
                                            "$select": "PropA, PropB",
                                            "NextRowKey": "@variables('NextRowKey')"
                                        }
                                    },
                                    "runAfter": {},
                                    "type": "ApiConnection"
                                },
                                "Set_variable": {
                                    "inputs": {
                                        "name": "NextRowKey",
                                        "value": "@{actions('Get_next_page')?['outputs']?['headers']?['x-ms-continuation-NextRowKey']}"
                                    },
                                    "runAfter": {
                                        "Get_next_page": [
                                            "Succeeded"
                                        ]
                                    },
                                    "type": "SetVariable"
                                }
                            }
                        },
                        "expression": {
                            "and": [
                                {
                                    "equals": [
                                        "@variables('FirstRun')",
                                        true
                                    ]
                                }
                            ]
                        },
                        "runAfter": {},
                        "type": "If"
                    },
                    "For_each": {
                        "actions": {
                            "Insert_products": {
                                "inputs": {
                                    "body": {
                                        "PropA": "@items('For_each')['PropA']",
                                        "PropB": "@items('For_each')?['PropB']"
                                    },
                                    "host": {
                                        "connection": {
                                            "name": "@parameters('$connections')['sql']['connectionId']"
                                        }
                                    },
                                    "method": "post",
                                    "path": "/datasets/default/tables/@{encodeURIComponent(encodeURIComponent('[dbo].[YourTable]'))}/items"
                                },
                                "runAfter": {},
                                "type": "ApiConnection"
                            }
                        },
                        "foreach": "@body('Parse_JSON_2')",
                        "runAfter": {
                            "Parse_JSON_2": [
                                "Succeeded"
                            ]
                        },
                        "type": "Foreach"
                    },
                    "Parse_JSON_2": {
                        "inputs": {
                            "content": "@if(not(variables('FirstRun')), body('Get_next_page')?['value'], body('Get_first_page')?['value'])",
                            "schema": {
                                "items": {
                                    "properties": {
                                        "PropA": {
                                            "type": "string"
                                        },
                                        "PropB": {
                                            "type": "string"
                                        }
                                    },
                                    "required": [
                                        "odata.etag",
                                        "PropA",
                                        "PropB"
                                    ],
                                    "type": "object"
                                },
                                "type": "array"
                            }
                        },
                        "runAfter": {
                            "Condition": [
                                "Succeeded"
                            ]
                        },
                        "type": "ParseJson"
                    }
                },
                "expression": "@and(equals(variables('NextRowKey'), null), not(variables('FirstRun')))",
                "limit": {
                    "count": 60,
                    "timeout": "PT1H"
                },
                "runAfter": {
                    "Initialize_nextrowkey": [
                        "Succeeded"
                    ]
                },
                "type": "Until"
            }
        },
        "contentVersion": "1.0.0.0",
        "outputs": {},
        "parameters": {
            "$connections": {
                "defaultValue": {},
                "type": "Object"
            }
        },
        "triggers": {
            "manual": {
                "inputs": {
                    "schema": {}
                },
                "kind": "Http",
                "type": "Request"
            }
        }
    }
}
```
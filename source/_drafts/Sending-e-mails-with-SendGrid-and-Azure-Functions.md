---
title: Sending e-mails with SendGrid and Azure Functions
date: 2019-06-12 12:44:16
tags:
- Azure Functions
- SendGrid
---
In this blogpost I'll show how to send e-mails with SendGrid and Azure Functions.
The goal is to send an email like this, stating in Dutch that some products that people are selling are hijacked.
<img src="/images/sendgrid/email.png" />
## SendGrid in Azure
First or all we need a SendGrid instance, you can simply create one using the Azure Portal. But who uses the portal to create Azure services? If you're still doing that you probably have a completely unmanged Azure subscription and you have no control over it. So start using Azure ARM templates or CLI!

```json
{
    "name": "[parameters('sendgridAccountName')]",
    "type": "Sendgrid.Email/accounts",
    "location": "[resourceGroup().location]",
    "apiVersion": "2015-01-01",
    "plan": {
        "name": "free",
        "publisher": "Sendgrid",
        "product": "sendgrid_azure",
        "promotionCode": ""
    },
    "properties": {
        "password": "[parameters('sendgridPassword')]",
        "acceptMarketingEmails": "0",
        "email": ""
    }
}
```
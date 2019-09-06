---
title: Sending e-mails with SendGrid and Azure Functions
tags:
  - Azure Functions
  - SendGrid
date: 2019-08-23 12:44:16
---


In this blogpost I'll show how to send e-mails with SendGrid and Azure Functions.
The goal is to send an email like this, stating in Dutch that some products that people are selling are hijacked.
<img src="/images/sendgrid/email.png" />
## SendGrid in Azure
First or all we need a SendGrid instance, you can simply create one using the Azure Portal. But who uses the portal to create Azure services? If you're still doing that you probably have a completely unmanged Azure subscription and you have no control over it. So start using Azure ARM templates or Azure CLI! SendGrid has a nice free tier. 

<img src="/images/sendgrid/pricing.png" />

## ARM
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
## Azure Function
```csharp
[FunctionName("SendHijackMails")]
public async Task SendHijackAlertsAsync(
    [ServiceBusTrigger(
        "hijack-alert",
        Connection = "ServiceBusConnectionString")] Message updatedMessage,
    [SendGrid(ApiKey = "SendGridApiKey")] IAsyncCollector<SendGridMessage> messageCollector,
    ILogger log) 
{
    var hijackedAlert = JsonConvert.DeserializeObject<HijackedAlert>(
                    Encoding.UTF8.GetString(updatedMessage.Body));

    var msg = new SendGridMessage();
    msg.AddTo(hijackedAlert.Email, $"{hijackedAlert.FirstName} {hijackedAlert.LastName}");
    msg.From = new EmailAddress("info@somecompany.com");
    msg.TemplateId = "d-sampletemplateId";

    msg.SetTemplateData(new DynamicTemplateData()
    {
        Products = hijackedAlert.Products.Select(x => new EmailProduct()
        {
            Name = x.Product?.Title,
            Url = x.Product?.Url,
            ProductId = x.ProductId
        }).ToArray()
    });

    await messageCollector.AddAsync(msg);
}

```

## Handelbar syntax
```html
<br>

<div><strong>Hijackt alert</strong>- Sellest.io heeft geconstateerd dat er nieuwe aanbieders zijn gevonden voor de volgende producten:</div>

<ul>
{{#each products}}
<li><a href="https://app.sellest.io/#/product/{{this.productId}}">{{this.name}}</a></li>
{{/each}}
</ul>
```


---
title: Expire data in CosmosDb
tags: 
- Azure
- CosmosDb
date: 2018-06-25 11:50:22
---

Applications often have to deal with temporary data, such as: logs, user session information and others.
Purging that data can be a struggle especially when your database doesn't support temporary storage.
With CosmosDb, developers are able to set Time To Live properties on Collections and Documents.

## Example
Lets say you have a shopping cart in your application with which users can select items.
It doesn't make sense to have those items indefinitely in your cart, lets say one week will be suffice.
Lets see how we can set the time to live to one week.

### Create a collection with a default time to live
In order for time to live to be effective you have to set a default time to live on the collection. Setting it on __documents alone will not work__. You can also replace the collection and set it to `null` to disable the time to live for the collection.

```csharp
    await documentClient.CreateDatabaseIfNotExistsAsync(new Database()
    {
        Id = "MyShop"
    });

    // Creating a collection with a default time to live.
    DocumentCollection collection = await documentClient.CreateDocumentCollectionIfNotExistsAsync(
        UriFactory.CreateDatabaseUri("MyShop"),
        new DocumentCollection
        {
            Id = "ShoppingCart",
            // Set default time to live to one week. 
            DefaultTimeToLive = 24 * 60 * 7
        },
        new RequestOptions
        {
            OfferThroughput = 400
        });

    // Disable the time to live.
    collection.DefaultTimeToLive = null;

    await client.ReplaceDocumentCollectionAsync(collection);
```

Once you've set the time to live on collections than every document will have that time to live as default. You can override it to prolong, shorten or disable the time to live for the selected document.

```csharp
    // Set time to live
    cart.TimeToLive = TimeToLiveSeconds;

    // Disable time to live
    cart.TimeToLive = null;

    await documentClient.CreateDocumentAsync(
        UriFactory.CreateDocumentCollectionUri("MyShop", "ShoppingCart"),
        cart);

    // Update time to live
    cart.TimeToLive = TimeToLiveSeconds;

    await documentClient.ReplaceDocumentAsync(cart);
```

Once a document is created in a time to live collection then a `_ttl` property will be added to the document. Note that it doesn't count down or something like that so you can't see if a document is about to expire.

```json
{
    "userId": "test@user.com",
    "cart": [
        {
            "itemId": "49a4ce2c-ddde-4f04-bb79-46546566a",
            "title": "Bike",
            "desc": "A brandnew bike"
        },
        {
            "itemId": "dfsa8789-abde-4f04-bb79-46546566a",
            "title": "Helmet",
            "desc": "A helmet keeps you save"
        }
    ],
    "ttl": 10080,
    "id": "49a4ce2c-99e4-4f04-bb79-35a9c3a4d6b5",
    "_rid": "VfYnAKmODgAkAAAAAAAAAA==",
    "_self": "dbs/VfYnAA==/colls/VfYnAKmODgA=/docs/VfYnAKmODgAkAAAAAAAAAA==/",
    "_etag": "\"0100cb12-0000-0000-0000-5b2a44170000\"",
    "_attachments": "attachments/",
    "_ts": 1529496599
}
```

Hopefully this helped a little, for further reading please see:
https://docs.microsoft.com/en-us/azure/cosmos-db/time-to-live
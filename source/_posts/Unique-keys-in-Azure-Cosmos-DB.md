---
title: Unique keys in Azure Cosmos DB
tags: 'Azure, CosmosDb, UniqueKeys, PrimaryKey'
date: 2018-07-03 16:06:31
---

NoSQL databases often don't have support for database constraints. It doesn't make sense to constraint since the data is schemaless and therefore where does the database has to constrain on?
Well its true for most cases but sometimes you just want to make sure that there's only 1 document for an entity. Lets say your CosmosDb is managing client or user entities. It doesn't make sense to have 2 users documents representing the same user, does it? It could result in bugs or other unwanted behavior.

## Unique keys
CosmosDb supports Unique Keys, well I rather call them Unique Paths.
Lets say you have a document representing a client and it looks something like this:

```json
{
    "id": "1234567",
    "name": "BigFirm",
    "country": "The Netherlands",
    "address": {
        "street": "Sillicon Valley Road",
        "housenumber": "42",
        "state": "California",
        "country": "The Greatest Country on Earth"
    },
    "users": [
        {
            "name": "Dibran",
            "title": "CEO",
            "username": "d.mulder@bigfirm.com"
        },
        {
            "name": "Charles",
            "title": "Slave",
            "username": "charles@bigfirm.com"
        }
    ]
}
```
Lets say you want every document to have an unique combination of name and country. And secondly, you want to have unique list of user titles inside your users array. Its actually quite easy to do that, but the sad part is that you can only add unique keys at the creation of a collection. After that you're not able to edit them anymore.
```csharp  
DocumentCollection myCollection = new DocumentCollection();
myCollection.Id = "ClientCollection";
myCollection.UniqueKeyPolicy = new UniqueKeyPolicy
{
    UniqueKeys =
    new Collection<UniqueKey>
    {
        new UniqueKey { Paths = new Collection<string> { "/name" , "/country" }}
        new UniqueKey { Paths = new Collection<string> { "/users/title" } },
    }
};
await client.CreateDocumentCollectionAsync(
    UriFactory.CreateDatabaseUri(dataBase),
    myCollection,
    new RequestOptions { OfferThroughput = 400 });
```
Its just that simple, now you'll have a collection with a unique key policy. Actually if you look at the json definition of a collection then you'll be able to see it, take a look:
```json
{
  "id": "ClientCollection",
  "indexingPolicy": {
    "indexingMode": "consistent",
    "automatic": true,
    "includedPaths": [
      {
        "path": "/*",
        "indexes": [
          {
            "kind": "Range",
            "dataType": "Number",
            "precision": -1
          },
          {
            "kind": "Hash",
            "dataType": "String",
            "precision": 3
          }
        ]
      }
    ],
    "excludedPaths": []
  },
  "uniqueKeyPolicy": {
    "uniqueKeys": [
      {
        "paths": [
          "/name",
          "/country"
        ]
      },
      {
        "paths": [
          "/users/title"
        ]
      }
    ]
  }
}
```
Bear in mind that you'll have to check for conflict exceptions in your code. If you're violating the unique key policy then a `Microsoft.Azure.Documents.DocumentClientException` is thrown. This exceptions contains a `System.Net.HttpStatusCode.Conflict` status code, this is where you want to check on. Your code will look something like this:
```csharp
try
{
    response = await client.CreateDocumentAsync(collectionUri, document, requestOptions);
}
catch (Microsoft.Azure.Documents.DocumentClientException ex)
{
    if ( ex.StatusCode == System.Net.HttpStatusCode.Conflict )
    {
        // Unique key constraint violation ...
    }
    else
    {
        // Some other issue ...
        throw;
    }
}
```
Hopefully this helped a little, for further reading please see:
https://docs.microsoft.com/en-us/azure/cosmos-db/unique-keys
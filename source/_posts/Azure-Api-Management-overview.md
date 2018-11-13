---
title: Azure API  Management overview
tags: 'Azure, API Management'
date: 2018-11-13 16:43:45
---

Azure API Management is a jungle of configurations, options and possibilities. The documentation is not always that clear and sometimes its hard to see what your options are and which suit your solution best. In this blogpost I'm trying to shine some light into that darkness.

## Terminology
Lest started with some very basics. API Management(from now on APIM, cauz im lazy) is a service sitting in the middle of a consuming client application and a backend service. Its there for reasons, such as: enforcing policies, caching, routing, security and so on. Its often used as a central hub within a company to manage outgoing and incomming traffic. Its main goal is to retrain control over your API's.

<img src="/images/apim/apim basic.png" />

* The consuming client applications are called: Client or front-end application.
* The incomming traffic from a client application is call inbound traffic.
* Your API which you are disclosing via APIM is called the backend service or api.
* The response from the backend service is called outbound traffic.

<img src="/images/apim/apim basic flow.png" />

### Products and groups
Next up APIM got some features and data structures which you need to be familiar with. It all starts with products and groups. A product essentially is a set of API's. For a client application to be effective it might have to consult several backend api's to get all data. Especially when you are using a microservice based architecture. A product then might be a combination of multiple backend api's. Its important to keep in mind that a set of backend API's should look like one product from a client application perspective. Once you've defined a set of API's for a product you'll have to grant groups of users to a product. APIM also contains a build in group called 'Guests' which once allowed access to a product opens up your API's in your product for everyone. 

### Subscriptions
You can also choose to enable subscriptions for a product. Once enabled users have to request a subscription and they obtain a set of keys. Those keys should be added to every call to APIM so that APIM can validate if your subscription is still valid.

### Policies
Lastly a product can also contain policies. Later you'll see that you can also define policies on API or even on operation level. Policies applied on product level apply on every API inside the product. Its a hierachial system for defining policies.

## Add API's
<img src="/images/apim/addapi.png" />
You can add API's in various ways. With a blank API's you'll have to define every thing youself. Its doesn't bootstrap any operations or whatsoever. Other options do bootstrap your API's inside APIM. OpenAPI spefications for instance delivery detailed operations and improve efficiency and usability. OpenAPI definitions were previously called Swagger definitions. 

Its also possibile to integrate with a Function App in Api Management. As discussed in [this post](2018/10/19/Building-Serverless-APIs-in-Azure/) an API Gateway is recommended when you're creating a Serverless API or when you're using a Microservice based architecture. Be aware that OpenAPI definitons inside Azure Functions V2 are still in preview and therefore the bootstrapped operations lack some detail.

In the next blogpost I'll address the CI/CD posibilities in combination with APIM. In my opinion its indispensable for a DevOps team, let alone a whole company using the same APIM instance.

## Security

<img src="/images/apim/apim.png" />

### Client Authentication

OpenId
OAuth
Subscription Keys

### Backend service 
Function keys
Basic Auth
Client certificates

<img src="/images/apim/functions keys.png" />

## Policies
```xml
<policies>
    <inbound>
        <base />
    </inbound>
    <backend>
        <base />
    </backend>
    <outbound>
        <base />
    </outbound>
    <on-error>
        <base />
    </on-error>
</policies>
```

### Categories
* Restriction
* Advanced
* Authentication
* Caching
* Cross domain policies (CORS)
* Transformation 

https://docs.microsoft.com/en-us/azure/api-management/api-management-policies
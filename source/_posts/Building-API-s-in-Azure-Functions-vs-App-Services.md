---
title: 'Building Serverless API''s in Azure'
tags: 'Azure, API management, Functions, API Gateway.'
date: 2018-10-19 15:44:40
---
Serverless is a hot topic in Cloud Development. Serverless cloud computing is all about scalability, performance, minimizing cost and maximizing business value by eliminating complexity. Its a true game changer but is it always the best approach for your software? In this blogpost I'll address the pros and cons regarding Serverless API's.

## REST API's
We've been building API's for decades, with techniques like RCP, SOAP, Enterprise Service Buses, etc. The majority of the people nowadays build their API's based on a REST or RESTful architecture. How does this trend match the new serverless hype that's taking place? In this blogpost we are trying to find that out. 

I'll assume that you know what REST is but in case you don't. It's based on the following principles: 
> performance, scalability, simplicity, modifiability, visibility, portability, and reliability

In order for an architecture to achieve those goals, REST has the following constraints:
> Client-Server Architecture, Statelessness, Cachability, Layered system, Code on demand and Uniform Interface. 

More information about the constraints and principles can be found [here](https://en.wikipedia.org/wiki/Representational_state_transfer)

So, at first sight, it doesn't really look that Serverless computing and REST are in conflict. Moreover, Serverless computing might be complementary to REST. Let's have a closer look.

## Serverless
According to Martin Fowler's blog this is the definition of Serverless:

> Serverless can also mean applications where server-side logic is still written by the application developer, but, unlike traditional architectures, it’s run in stateless compute containers that are event-triggered, ephemeral (may only last for one invocation), and fully managed by a third party. One way to think of this is “Functions as a Service” or "FaaS".

[Source from Martin Fowler](https://martinfowler.com/articles/serverless.html)

So the key takeaways are: event triggered, ephemeral and fully managed by a third party. So those Functions are serverside logic, triggered by events. In a REST based scenario that trigger might be an Http call, representing a REST operation. So far so good.

<img src="/images/serverless/Serverless API.png" />

So, we might end up building Azure Functions for every REST operation. The client application then has to orchestrate the REST calls to the right functions. This might be done via naming conventions, a pattern which is common in REST based architectures. If you are questioning if this is really a good idea, hold that thought! I'll come back to it.

Calling Azure Functions directly from your Client feels like a bad idea. Azure Functions should be those little snippets of code just executing at crazy scale and they should perform really well. On the other hand, we want to have an API with all kinds of additional features, we need those features to have an effective and future proof communication with our clients. I'm talking about:

* SSL termination
* Authentication
* IP whitelisting
* Client rate limiting (throttling)
* Logging and monitoring
* Response caching
* Web application firewall
* GZIP compression
* Servicing static content
* Restfull routing
* Versioning
* Health checking
* Documentation

These features and Functions don't fit really well. If we end up adding all those features to our Azure Functions we should just have picked ASP.net core and we could have built that API way faster than we would have in Azure Functions. So how do we bring those features in play while keeping our Azure Functions lean and mean. Well we need some sort of Application Gateway. A service sitting in the middle of the client and our Azure Functions which takes care of most of the features above. This Application Gateway should scale very good and shouldn't introduce a new bottle neck. Think of it as an Load Balancer.

<img src="/images/serverless/Serverless.png" />

## Azure API Gateway
Azure offers a set of services which have the possibility to route traffic, cache and so on. However most of them are not a good fit to act as an API Gateway. 

The following services are just for routing traffic on different levels but don't implement documentation, logging, analytics, caching and so on:

* Azure Traffic manager
DNS based (global) load balancer and fail-over solution
* Azure Application Gateway
HTTP/HTTPS based redirect + SSL offload + Web Application Firewall (OWASP) solution 
* Azure Load Balancer
Generic (port based) load balancer -> often used for IaaS VM’s

## Azure API Management
The only service which is an actual API Gateway implementation is Azure API management. It includes caching, routing, security, documentation, logging and so on. It's a comprehensive suite of features, and I'm planning to write a bunch of blog posts about it. So, stay tuned.

One thing to consider is the pricing of Azure API management. It's quite expensive with a start rate of about 670 dollars. If you want to do Global API management or VNET integration you will have to pick the Premium tier, which comes at 2700 dollar a month. So the key take away is that if you want to build a REST API on Functions you might have to give in some features or pay a little extra.

<img src="/images/serverless/costs.png" />

A best practice is to share the API management instance across a company. In this way you can manage all outbound API's from one service. Also you are managing all clients inside one service, offboarding clients is way easier this way.

<img src="/images/serverless/announcement.png" />
[Link to the Video](https://www.youtube.com/watch?v=BoZimCedfq8&t=39m58s)

On Ignite 2018, Microsoft announced an API Management Consumption based tier. This tier should be optimized to handle Serverless scenarios. So basically Microsoft confirms the need for API Gateway when building Serverless architectures.

This consumption tier is now in private preview, hopefully it will be in public preview and later GA very soon. In the near future I will write some blog posts on:

* How to configure an API management instance via ARM and Azure DevOps
* How to add Azure Functions to API management via Azure DevOps.
* Building REST API's on Azure Functions. Including features like:
 - Dependency injection
 - Response caching
 - Authentication

Stay tuned and happy coding.
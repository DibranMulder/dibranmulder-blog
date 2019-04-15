---
title: Cloud first Microservices in Azure
tags:
---
Building cloud first microservices is rather complicated. The amount of options are growing, in this blog I will discuss sevaral approaches to build a microservice architecture in the cloud.

According to the famous blog of Martin Fowler, a microservice architecture has the following characteristics:
- Componentization via Services
- Organized around Business Capabilities
- Products not Projects
- Smart endpoints and dumb pipes
- Decentralized Governance
- Decentralized Data Management
- Infrastructure Automation
- Design for failure
- Evolutionary Design
[Martin Fowler on Microservices](https://martinfowler.com/articles/microservices.html)

This basically drills down to the fact that microservices are event driven and consist of several smaller services.
In Azure we can take multiple approaches to build such an architecture. 

- Azure Functions Serverless
- App Services
- Service Fabric (mesh)
- Kuburnetes

- Cost efficiency
- Developer productivity
- Performance and scalability
- Amount of maintenance


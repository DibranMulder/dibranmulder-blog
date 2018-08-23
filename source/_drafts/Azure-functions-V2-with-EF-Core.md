---
title: Azure functions V2 with EF Core
tags:
---
Last week I was trying to build an API on top of Azure Functions V1 and a SQL database. This sounds like an easy task but that was not the case. Here is my story.

Normally when I use a SQL database then I also use an ORM mapper, preferrably Entity Framework. However when you're Azure Functions is a [trigger and binding based framework](https://docs.microsoft.com/en-us/azure/azure-functions/functions-triggers-bindings), and SQL isn't supported there. Since I'm building an API I use http triggers to trigger  my functions. The preferred way of altering and consulting your database would be to use a SQL binding but as I told you, its not supported yet. 

## Entity Framework migrations 

## Dependency injection



One of my clients asked me to build a high scalable API implementation of a certain REST protocol. As I was reading the protocol specs I quickly noticed that the protocol is a relational scheme based protocol. It contains reverse lookups, paging, filtering and so on. Normally when I have to use a database at high scale I tent to use CosmosDb. But for now this was a bad match.

Since high scale is the prime requirement

Azure Functions v2 is still in public preview, but is expected to become GA per Microsoft Ignite (24th - 28th of Sept 2018). The main difference between Azure Functions v1 and v2 is the change of runtimes. Azure functions v1 runs on the .NET framework 


Projecten Entity Framework
.NET standard projects.

Don't use Nuget packages for tools and tools.dotnet

```
The EF Core tools version '2.1.0-rtm-30799' is older than that of the runtime '2.1.1-rtm-30846'. Update the tools for the latest features and bug fixes.````
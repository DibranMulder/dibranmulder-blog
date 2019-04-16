---
title: Versioning with Azure PaaS and Serverless
tags: 'Azure, PaaS, Serverless, Teams, Agile, Versioning'
date: 2019-04-16 14:45:39
---
Working with multiple teams on a big microservices architecture can be a real struggle. What I often see is that teams are responsible for their set of microservices and struggle to isolate their services. Resulting in the following problems:
* Teams are not able to release independently.
* Teams are building release trains that have to be coordinated precisely.
  - Hence, companies are hiring people as release coordinators.
* Reverting release trains is not possible, fix-over-fix scenario's will occur.
* The applications are temporary in a state of flux while releasing a train.

<img src='images/versioning/releasetrain.png' />

What we ideally want is that teams stop building release trains and start releasing independently at any given time of the day. However, a lot has to be done before companies achieve that kind of development maturity. I came up with a set of principles that will guide an organization to become more maturity, and there by increasing flexibility, productivity and quality.

### The golden principles.
1. Services must be able to run independently.
    - Services must be able to reconnect with other services. Any dependency can be deployed at any time. Design your service to fail.
2. Services can never introduce breaking changes.
    - This means services should adopt a versioning strategy.
3. There can be no direct dependencies between services, that means no direct REST interfaces anymore.
4. Teams are able to release their service at any given time.
5. Teams are responsible and accountable for their own services.

Most of the principles are kind of straight forward, but keep in mind they are key for success. Sometimes simple principles are the hardest to implement, especially when you have legacy components in your microservices architecture, or maybe because it's technically difficult to implement them. In this blog I'll help you implementing some of the principles in Azure PaaS and Serverless services. Let's start with a combination of versioning strategy and mitigating direct dependencies. 

## Service bus versioning
The most common way for microservices to communicate in an asynchronous matter on Azure is the use of Azure Service Bus. With Azure Service Bus, teams can define message channels to communicate between microservices. What a lot of development teams forget is to adopt a versioning strategy for their service bus messages.

One way of versioning service bus messages is to add a `custom property` to a message. I like this better then to add a `version` property to the actual JSON or XML message because, in my opinion, a version is not part of the data you actually want to send, it's the metadata. It's important for the consuming party to know.

So depending on the programming language you use you can add a `custom message property` to a service bus message. In C# it will look like something like this.
```csharp
// Data you want to send.
var user = new
{
    name = "Dibran",
    lastName = "Mulder",
    position = "Dev"
};
// Serialize to JSON.
string json = JsonConvert.SerializeObject(user);
Message message = new Message(Encoding.UTF8.GetBytes(json));
// Add a custom verison property.
message.UserProperties.Add("Version", "1.0");
```
I like to keep the version the same as the version of your microservice. In this way we are not bogged down into a versioning hell. The version of the message is equal to the version of the service that actually created the message. A simple but effective rule. In this way you can also track by what version of a microservice a message is actually created.

With [Azure Service Bus explorer](https://github.com/paolosalvatori/ServiceBusExplorer) you can easily check messages, create additional subscriptions, etc. I highly recommend you to use it, you can see what kind of messages are send and also inspect the custom message properties. It's a nice tool to debug your versioning strategy.

So if you send messages with a Version `custom message property` you can create for instance create 2 subscriptions for each version. With a service bus filter you can then make sure that messages with a specific version are only received by certain topics.

<img src='images/versioning/servicebus.png' />

A simple service bus filter can be:
```sql
Version='1.0'
```
**Don't forget to remove the default rule: 1=1.** If one of the rules match a message will be accepted by a subscription.

You can also choose to do the filtering and version handling in the consuming service. But I personally like it better to separate messages in subscriptions based on version numbers.

Lastly, I would like to add that service bus filters can easily be created by [ARM scripts](https://docs.microsoft.com/en-us/azure/service-bus-messaging/service-bus-resource-manager-namespace-topic-with-rule). In this way you won't need to service bus explorer or code to manage your infrastructure. 

```json
{
    "apiVersion": "[variables('sbVersion')]",
    "name": "[parameters('serviceBusRuleName')]",
    "type": "Rules",
    "dependsOn": [
        "[parameters('serviceBusSubscriptionName')]"
    ],
    "properties": {
        "filterType": "SqlFilter",
        "sqlFilter": {
            "sqlExpression": "StoreName = 'Store1'",
            "requiresPreprocessing": "false"
        },
        "action": {
            "sqlExpression": "set FilterTag = 'true'"
        }
    }
}
```
## Azure Functions versioning
With Azure functions it's pretty easy to handle versioning. You can add a versioning scheme to the route of an `Http Trigger` like this.
```csharp
[FunctionName("SomeHttpFunctions")]
public static async Task<HttpResponseMessage> Run(
    [HttpTrigger(
        AuthorizationLevel.Function,
        "POST",
        Route = "v1/some/endpoint")]
    HttpRequestMessage req,
    ILogger log)
{
    // Code...
}
```
However, routing in Azure Functions is pretty badly implemented. ASP.net core handles it way better and its therefore highly recommended to use an API gateway in front of it. As I described in [this blog post](https://dibranmulder.github.io/2018/10/19/Building-Serverless-APIs-in-Azure/) you can use for instance Azure API Management to handle that for you. You will then get a lot of additional options such as: routing, mocking, caching, authorization, etc.
<img src='images/serverless/Serverless.png' />

## ASP.net core versioning
Lastly I would like to point out to a very nice [Github repository](https://github.com/Microsoft/aspnet-api-versioning) for ASP.net core versioning. It has several examples to implement versioning correctly. Versioning is actually a 1st class citizen in ASP.net core, enabling you to adopt a solid strategy and never make breaking changes again.
---
title: Versioning with Azure PaaS
tags: Azure, PaaS, Serverless, Teams, Agile, Versioning
---
Working with multiple teams on a big microservices architecture can be a real struggle. What I often see is that teams are responsible for their set of microservices and struggle to isolate their services. Resulting in the following problems:
* Teams are not able to release independently.
* Teams are building release trains that have to be coordinated precisely.
  - Hence, companies are hiring people as release coordinator.
* Reverting release trains is not possible, fix-over-fix scenario's will occur.
* The applications are temporary in a state of flux while releasing a train.

<img src='images/versioning/releasetrain.png' />

What we ideally want is that teams stop building release trains and start with releasing independently at any given time of the day. However, a lot has to be done before companies achieve that kind of development maturity. So lets start with some golden principles to achieve maximum flexbility and productivity.

1. Services must be able to run independently.
    - Services must be able to reconnect with other services. Any dependency can be deployed at any time. Design your service to fail.
2. Services can never introduce breaking changes.
    - This means services should adopt a versioning strategy.
3. There can be no direct dependencies between services, that means no direct REST interfaces anymore.
4. Teams are able to release their service at any given time.
5. Teams are responsible and accountable for their own services.

Most of the principles are kind of straight forward, but keep in mind they are key for success. Sometimes simple principles are hard to implement, especially when you have legacy components in your microservices landscape. Or because its technically difficult to implement them. Lets start with a combination of versioning strategy and direct dependencies. 

## Service bus versioning
The most common way for microservices to communicate in an asynchronous matter on Azure is the use of Azure Service Bus. With Azure Service Bus, teams can define message channels to communicate between microservices. What a lot of development teams forget is to adopt a versioning strategy for service bus messages.

One way of versioning service bus messages is to add a `custom property` to a message. I like this better then to add a `version` property to the actual JSON or XML message because in my opinion a version is not part of the data you actually want to send, its the metadata. Its important for the consuming party to know.

So depending on the programming language you use you can add a `custom message property` to a service bus message. In C# it will look like something like this.
```csharp
var user = new
{
    name = "Dibran",
    lastName = "Mulder",
    position = "Dev"
};

string json = JsonConvert.SerializeObject(user);
Message message = new Message(Encoding.UTF8.GetBytes(json));
message.UserProperties.Add("Version", "1.0");
```
I like to keep the version the same as the version of your microservice. In this way we are not bogged down into a versioning hell. The version of the message is equal to the version of the service that actually produced the message. A simple but effective rule. In this way you can also track by what version of a microservice a message is actually produced.

If you use the [Azure Service Bus explorer](https://github.com/paolosalvatori/ServiceBusExplorer), I highly recommend you to use it, you can see what kind of messages are 

```

https://docs.microsoft.com/en-us/azure/service-bus-messaging/service-bus-resource-manager-namespace-topic-with-rule


## Microservices and versioning
So 
PaaS and Serverless




**Don't forget to remove the default rule**

https://codehollow.com/2016/03/azure-servicebus-filters/
https://docs.microsoft.com/en-us/azure/service-bus-messaging/topic-filters


```sql
Version='1.0'
```

## API versioning
3rd party API's
Front-end API's

### ASP.net core API's
https://github.com/Microsoft/aspnet-api-versioning
### Functions Http triggers
API Management



## Contracts
Versioning

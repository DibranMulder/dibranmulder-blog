---
title: Azure Functions Http Response caching
tags:
  - Azure
  - Functions
  - Cache
date: 2019-01-14 14:06:13
---

As you might know its a [best practice to keep your Azure Functions stateless](https://docs.microsoft.com/en-us/azure/azure-functions/functions-best-practices#write-functions-to-be-stateless). That means that also in memory caching should not be done inside your functions. Especially when you're using a consumption plan. Your cache will be recycled when the plan goes to sleep.
What a lot of fokes forget is that the Http protocol as of Http 1.1 contains caching. Setting the right caching headers on a `HttpResponseMessage` is actually quite easy.

[In ASP.net core we even had packages for us to do that](https://docs.microsoft.com/en-us/aspnet/core/performance/caching/response?view=aspnetcore-2.2). Those obviously don't work for functions since the attributes can't be placed on top of Azure Functions with Http Triggers. So sadly we've to write code to se the right headers. However its so easy that you won't be sad for long.

Here's a simple Http triggered function. Notice the `CreateCachedResponse` instead of `CreateResponse` extension method.
```csharp
[FunctionName("SomeFunction")]
public static async Task<HttpResponseMessage> SomeHttpTriggeredFunctions(
    [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "some/route")] HttpRequestMessage req,
    ILogger log)
{
    try
    {
        log.LogInformation("SomeFunction called");

        // Do something

        return req.CreateCachedResponse(HttpStatusCode.OK, response);
    }
    catch (Exception e)
    {
        log.LogError(e.Message, e);
        return req.CreateErrorResponse(HttpStatusCode.BadRequest, e);
    }
}
```
In the extension method we will simply add some headers to the response.
```csharp
using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;

public static class CacheResponseExtensions
{
    public static HttpResponseMessage CreateCachedResponse<T>(this HttpRequestMessage request, HttpStatusCode statusCode, T value, TimeSpan? maxAge = null)
    {
        HttpResponseMessage responseMessage = request.CreateResponse<T>(statusCode, value);
        responseMessage.Headers.CacheControl = new CacheControlHeaderValue()
        {
            Public = true,
            MaxAge = maxAge ?? defaultTimeSpan
        };
        return responseMessage;
    }
}
```
And voila we've got client side caching working.

<img src="/images/cache-functions.png" />


https://docs.microsoft.com/en-us/aspnet/core/performance/caching/response?view=aspnetcore-2.2

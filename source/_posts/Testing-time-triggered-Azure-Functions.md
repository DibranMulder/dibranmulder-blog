---
title: Locally testing Azure Functions
tags:
  - Azure Functions
date: 2019-05-20 13:24:46
---
Azure Functions with for instance TimeTriggers or ServiceBusTriggers can be difficult to test. Especially when you're trying not to interfere in a development or testing environment. What a lot of people don't know is that the Azure Functions platform provides a feature to manually trigger Azure Functions, regardless of their actual trigger type.

The only thing you'll have to do is to send a Http POST message to an admin enpoint. **Keep it mind to add a payload with at least an empty input property**, otherwise the function will not be triggered.

Take for instance this Functions with a TimeTrigger named `TriggerOnTime`.
```csharp
public static class Functions
{
    [FunctionName("TriggerOnTime")]
    public static async Task DoSomethingAsync(
        [TimerTrigger("0 0 */8 * * *")] TimerInfo myTimer,
        ILogger log)
    {
        log.LogInformation("This function triggers every 8 hours.");
        // ...
    }
}
```
To manually fire this off, perform a Http POST message to the following endpoint: `POST: http://localhost:7071/admin/functions/TriggerOnTime`
Don't forget to add an empty payload.
```json
{
    "input": ""
}
```
You can perform this request with a simple curl command.
```bash
curl
    --header "Content-Type: application/json"
    --request POST 
    --data '{"input":""}' 
    http://localhost:7071/admin/functions/TriggerOnTime
```
To mock a ServiceBusMessage simple provide the JSON serialized content of the message inside the input property.

Happy coding!
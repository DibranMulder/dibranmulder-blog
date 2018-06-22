---
title: Azure Function V2 tips & tricks
tags:
---

```
"AppSettings:FilterStateFunctionEndpoint": "[listsecrets(resourceId('Microsoft.Web/sites/functions', variables('realtimeEventsFunctionsName'), 'FilterStateFunction'),'2015-08-01').trigger_url]",
```

```
    [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,

    string requestBody = new StreamReader(req.Body).ReadToEnd();
    FilterState data = JsonConvert.DeserializeObject<FilterState>(requestBody);
```
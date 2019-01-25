---
title: Using Wordpress / Woocommerce in Serverless Azure
tags:
  - Azure
  - Wordpress
  - Woocommerce
  - Functions
date: 2019-01-25 09:12:18
---
Sometimes Wordpress isn't that bad. When for instance you're building a SEO optimized landing page for a custom made tool and you don't want to develop everything your self. Secondly, Wordpress has thousands of plugins that can be very useful. In my case we are using Woocomerce with a subscription payment module, so that we can manage payed subscriptions for our tool and secondly we want to manage the user accounts inside Wordpress. This saves me lots of development hours and next to that I don't have to build any maintenance tooling since that is already inplace in Wordpress. So first line support can be done by not-so-much technical people, in other words they won't call for every problem :)

## Overview
<img src="/images/wordpress azure.png" />
So in essence its very easy. We just have a user with a single set of credentials which he can use in both the SEO optimized page, lets say `example.com` and in the custom made tool lets say `app.example.com`. Using the [JWT Authentication for WP REST API](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/) plugin of Wordpress we can login any user and get a JWT bearer token as response. The JWT Authentication plugin requires a JWT Auth Secret key which we can define and share with the `Azure Functions` backend. The functions backend then checks the validity of incoming Bearer token with the shared JWT Auth Secret key, making an additional call to Wordpress unnecessary. Its blazing fast.

But we are not there yet. We need some communication between the Functions backend and Wordpress on an application to application level. In my case I want to retrieve the available subscriptions and the active subscription for a user from Wordpress / Woocommerce. Subscriptions are the trial, starter, business and pro packs that users can buy and those "packs" enable the user some privileges inside my Angular tool. Since its app to app communication I can't use a Bearer token, because thats user context bounded, and secondly the [Woocommerce API](https://docs.woocommerce.com/document/woocommerce-rest-api/) requires an OAuth 1.0 authentication. It comes down to this. The Functions backend requires a `Consumer key` and a `Consumer secret` which need to be passed into a query string. Postman has excellent OAuth 1.0 support to test it out.

**Keep in mind to not add the empty parameters to the signature. Woocommerce doesn't support it.**

<img src="/images/postman oauth1.png" />

So how does this look like in code. There are 2 parts that I want to share with you. Verifying a JWT Bearer token based on a JWT Auth Secret key and the OAuth 1 implementation with Woocommerce.

### Verifying a JWT Bearer token
- Perform a Http REST call from Angular.
```typescript
public async authenticate(username: string, password: string) {
    const authResponse = await this.http.post(environment.wordpressBackend + this.jwtEndpoint, { username, password }).toPromise();
    localStorage.setItem('token', (authResponse as AuthResponse).token);
}

public async getSubscription() {
    const res = await this.http.get(environment.tradersmateBackend + 'api/subscriptions').toPromise();
    localStorage.setItem('subscription', res as string);
}
```
- Wordpress anwers with a JWT Bearer token and some meta information.
```json
{
    "token": "secrettokenwillbehere",
    "user_email": "dibran@example.com",
    "user_nicename": "dibranmulder",
    "user_display_name": "Dibran Mulder"
}
```

- Perform a `protected` Azure Function call, using an Angular interceptor to add the Bearer token.
```typescript
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(public auth: AuthService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}
```

- A backend Azure Function checks the incoming Http Request and validates the Bearer token. 
- Don't forget to respond with a 401 status code when the token is invalid.

```csharp
[FunctionName("SomeGet")]
public static async Task<HttpResponseMessage> GetSome(
    [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "some")] HttpRequestMessage req,
    [Inject] IValidateJwt validateJwt,
    ILogger log)
{
    try
    {
        log.LogInformation("Product add called");

        // Throws an UnAuthorizedException exception when the Bearer token can't be validated.
        int userId = validateJwt.ValidateToken(req);

        // Do some business logic here.
        var results = ...

        return req.CreateResponse(HttpStatusCode.OK, results);
    }
    catch (UnAuthorizedException e)
    {
        log.LogError(e.Message, e);
        return req.CreateResponse(HttpStatusCode.Unauthorized);
    }
    catch (Exception e)
    {
        log.LogError(e.Message, e);
        return req.CreateErrorResponse(HttpStatusCode.BadRequest, e);
    }
}
```

- Verify the Bearer token inside your Azure Functions.
- Inject the JWT Auth Secret Key into the constructor.

```csharp
public class ValidateJwt : IValidateJwt
{
    private const string dataClaimType = "data";
    private readonly TokenValidationParameters tokenValidationParameters;

    public ValidateJwt(string secretKey)
    {
        tokenValidationParameters = new TokenValidationParameters
        {
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secretKey)),
            ValidateIssuerSigningKey = true,
            ValidateIssuer = false,
            ValidateAudience = false
        };
    }

    public int ValidateToken(HttpRequestMessage httpRequest)
    {
        try
        {
            // We need bearer authentication.
            if (httpRequest.Headers.Authorization.Scheme != "Bearer")
            {
                throw new UnAuthorizedException();
            }

            // Get the token.
            string authToken = httpRequest.Headers.Authorization.Parameter;
            if (string.IsNullOrEmpty(authToken))
            {
                throw new UnAuthorizedException();
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            // Validate it.
            ClaimsPrincipal principal = tokenHandler.ValidateToken(authToken, tokenValidationParameters, out SecurityToken validatedToken);
            if (principal.Identity.IsAuthenticated)
            {
                // Check for a data claim.
                if (principal.HasClaim(x => x.Type == dataClaimType))
                {
                    Claim dataClaim = principal.Claims.FirstOrDefault(x => x.Type == dataClaimType);
                    var userObj = JsonConvert.DeserializeObject<DataClaim>(dataClaim.Value);
                    // With a user object.
                    if (userObj != null && userObj.User != null)
                    {
                        return userObj.User.Id;
                    }
                }
            }
        }
        catch
        {
            // Do nothing
        }
        throw new UnAuthorizedException();
    }
}
```

## Calling Woocommerce with OAuth 1.0
To interact with the Woocommerce API we need to implement the OAuth 1 flow. Its not used that much so you won't find a lot of C# examples online. Here's mine.

Inject a `HttpClient`, `ConsumerKey` and `ConsumerSecret` into the Constructor. Only set the OAuth properties that are actually used, remember the Postman option with including empty parameters. It was a pain in the ass to get in working but I tested this client with Wordpress 5.0.3 and Woocommerce 3.5.4.

```csharp
public class WordpressHttpClient : BaseHttpClient
{
    private readonly string consumerKey;
    private readonly string consumerSecret;
    private readonly Random rand;

    public WordpressHttpClient(string consumerKey, string consumerSecret, HttpClient httpClient)
        : base(httpClient)
    {
        rand = new Random();
        this.consumerKey = consumerKey;
        this.consumerSecret = consumerSecret;
    }

    public async Task<IEnumerable<Subscription>> GetSubscriptionsAsync()
    {
        var nonce = GetNonce();
        var timeStamp = GetTimeStamp();

        var queryCollection = HttpUtility.ParseQueryString(string.Empty);
        queryCollection["oauth_consumer_key"] = consumerKey;
        queryCollection["oauth_signature_method"] = "HMAC-SHA1";
        queryCollection["oauth_timestamp"] = timeStamp;
        queryCollection["oauth_nonce"] = nonce;
        queryCollection["oauth_version"] = "1.0";
        string baseQueryString = queryCollection.ToString();

        var requestParameters = new List<string>();
        foreach (string key in queryCollection)
        {
            requestParameters.Add($"{key}={queryCollection[key]}");
        }
        // We need to sign a base string.
        string otherBase = GetSignatureBaseString(HttpMethod.Get.ToString(), "https://www.example.com/wp-json/wc/v1/subscriptions", requestParameters);
        var otherSignature = GetSignature(otherBase, consumerSecret);

        // Add that signature to the query parameters.
        queryCollection["oauth_signature"] = otherSignature;
        string finalQueryString = queryCollection.ToString();

        // And actually perform the request.
        var finalUri = new Uri("https://www.example.com/wp-json/wc/v1/subscriptions?" + finalQueryString, UriKind.Absolute);
        HttpRequestMessage httpRequestMessage = new HttpRequestMessage(HttpMethod.Get, finalUri);
        var response = await Client.SendAsync(httpRequestMessage);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsAsync<Subscription[]>();
    }

    private string GetNonce()
    {
        var nonce = rand.Next(1000000000);
        return nonce.ToString();
    }

    private string GetTimeStamp()
    {
        var ts = DateTime.UtcNow - new DateTime(1970, 1, 1, 0, 0, 0, 0);
        return Convert.ToInt64(ts.TotalSeconds).ToString();
    }

    private string GetSignature(string signatureBaseString, string consumerSecret, string tokenSecret = null)
    {
        var hmacsha1 = new HMACSHA1();

        var key = Uri.EscapeDataString(consumerSecret) + "&" + (string.IsNullOrEmpty(tokenSecret)
                        ? ""
                        : Uri.EscapeDataString(tokenSecret));
        hmacsha1.Key = Encoding.ASCII.GetBytes(key);

        var dataBuffer = Encoding.ASCII.GetBytes(signatureBaseString);
        var hashBytes = hmacsha1.ComputeHash(dataBuffer);

        return Convert.ToBase64String(hashBytes);
    }

    private string GetSignatureBaseString(string method, string url, List<string> requestParameters)
    {
        var sortedList = new List<string>(requestParameters);
        sortedList.Sort();

        var requestParametersSortedString = ConcatList(sortedList, "&");

        // Url must be slightly reformatted because of:
        url = ConstructRequestUrl(url);

        return method.ToUpper() + "&" + Uri.EscapeDataString(url) + "&" +
                Uri.EscapeDataString(requestParametersSortedString);
    }

    private string ConstructRequestUrl(string url)
    {
        var uri = new Uri(url, UriKind.Absolute);
        var normUrl = string.Format("{0}://{1}", uri.Scheme, uri.Host);
        if (!(uri.Scheme == "http" && uri.Port == 80 || uri.Scheme == "https" && uri.Port == 443))
        {
            normUrl += ":" + uri.Port;
        }

        normUrl += uri.AbsolutePath;

        return normUrl;
    }

    private Dictionary<string, string> ExtractQueryParameters(string queryString)
    {
        if (queryString.StartsWith("?"))
            queryString = queryString.Remove(0, 1);

        var result = new Dictionary<string, string>();

        if (string.IsNullOrEmpty(queryString))
            return result;

        foreach (var s in queryString.Split('&'))
        {
            if (!string.IsNullOrEmpty(s) && !s.StartsWith("oauth_"))
            {

                if (s.IndexOf('=') > -1)
                {
                    var temp = s.Split('=');
                    result.Add(temp[0], temp[1]);
                }
                else
                {
                    result.Add(s, string.Empty);
                }
            }
        }

        return result;
    }

    private static string ConcatList(IEnumerable<string> source, string separator)
    {
        var sb = new StringBuilder();
        foreach (var s in source)
        {
            if (sb.Length == 0)
            {
                sb.Append(s);
            }
            else
            {
                sb.Append(separator);
                sb.Append(s);
            }
        }
        return sb.ToString();
    }
}
```
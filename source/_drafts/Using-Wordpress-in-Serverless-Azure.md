---
title: Using Wordpress / Woocommerce in Serverless Azure
tags: 
- Azure
- Wordpress
- Woocommerce
- Functions
---

Sometimes Wordpress isn't that bad. When for instance you're building a SEO optimized landing page for your tool and you don't want to develop everything your self. Secondly, Wordpress has thousands of plugins that can be very useful. In my case we are using Woocomerce with a subscription payment module, so that we can manage payed subscriptions for our tool and the whole user context inside Wordpress. This saves me lots of development hours and secondly the maintenance can be done by not-so-much technical people, in other words they won't call for every problem :)

## Overview
<img src="/images/wordpress azure.png" />

So in essence its very easy. We just have a user with a single set of credentials which he can use in both the SEO optimized page, lets say example.com and in the tool lets say app.example.com. Using the [JWT Authentication for WP REST API](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/) plugin of Wordpress we can login any user and get a JWT bearer token as response. The JWT Authentication plugin requires a JWT Auth Secret key which we can define and share with the functions backend. The functions backend can check the validity of incomming Bearer token with the shared JWT Auth Secret key, making a call to Wordpress unnecessary. Its blazing fast this way.

But we are not there yet. We need some communication between the Functions backend and Wordpress on a application to application level. In my case I want to retrieve the available subscriptions and the active subscription for a user from Wordrpess / Woocommerce. Subscriptions are the trial, starter, business and pro packs that users can buy and those enable the user some privileges inside my Angular tool. Since its app to app communication I can't use a Bearer token and secondly the [Woocommerce API](https://docs.woocommerce.com/document/woocommerce-rest-api/) requires an OAuth 1.0 authentication. It comes down to this. The Functions backend requires a `Consumer key` and a `Consumer secret` which need to be passed into a query string. Postman has excellent OAuth 1.0 uspport to test it out.

**Keep in mind to not add the empty parameters to the signature. Woocommerce doesn't support it.**

<img src="/images/postman oauth1.png" />

## Code
Enough talking, time for code. There are 2 parts that I want to share with you. Verifying a JWT Bearer token based on a key and the OAuth 1 implementation with Woocommerce.

### Verifying a JWT Bearer token

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

        string otherBase = GetSignatureBaseString(HttpMethod.Get.ToString(), "https://www.example.com/wp-json/wc/v1/subscriptions", requestParameters);
        var otherSignature = GetSignature(otherBase, consumerSecret);

        queryCollection["oauth_signature"] = otherSignature;
        string finalQueryString = queryCollection.ToString();

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
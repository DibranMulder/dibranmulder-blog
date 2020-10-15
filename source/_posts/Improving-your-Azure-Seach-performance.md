---
title: Improving your Azure Cognitive Seach performance
date: 2020-09-22 00:00:00
tags:
- Azure
- Azure Search
---
It can be a quite a struggle to really understand the in and outs of Azure Search and how search results are scored and how scoring profiles with weights and functions add up. In this blogpost I aim to explain the Azure Search inner workings, explaining the scoring algorithm and how to tweak it into your advantage. I also provide some practical tips on how to improve on search performance, but in order for you to apply those tips correctly you have to have a deeper understanding of the Azure Search itself. 

# Azure Search
<figure><img src="/images/search/azure-search-diagram.svg" /><figcaption style="font-style: italic; text-align: center;"><a href="https://docs.microsoft.com/bs-cyrl-ba/azure/search/search-what-is-azure-search">Azure Cognitive Search</a></figcaption></figure>
Azure Cognitive Search can index various data sources and make them searchable by text queries. It lets you connect multiple data sources such as CosmosDb collections, SQL databases or even documents such as PDF's. The index then indexes the content based on the Index definition that has been configured. In most cases the indexation takes place on databases such as SQL databases or CosmosDb, enabling users to index for instance their E-commerce platform or knowledge base.

Once the content has been indexed one can query the index with a text query and additionally add facets, filters and sorting. This query will be evaluated against the index and the system will return the highest scored documents. This blogpost is about unraveling the scoring system, and to help you to improve on your search performance. It matters because the user experience of the search is mainly impacted by the usability of the returned documents. In projects with Azure Cognitive Search I have come across way to many questions like: How did this document score this high? And why does it also find these documents? This blogpost is written to help you answer such questions.

# The Search Engine
<figure><img src="/images/search/search workflow.png" /><figcaption style="font-style: italic; text-align: center;">Azure Cognitive Search Overview</figcaption></figure>

The search engine of Azure Cognitive Search is quite complex. To be honest, the documentation isn't really forthcoming in how documents are being indexed and how the entered query eventually gets processed and scored against the indexed documents. This blogpost intents to shine some light into that black box. First I will explain the general flow of indexing, secondly I will explain how a search query is evaluated against the index and lastly I will give some practical tips on how to improve your Azure Search Performance.

# Indexing documents
Indexing documents basically comes down to the creation of a database which stores a set of tokens per field that are generated for each document that has been indexed. The search engine will then use this so called index to evaluate a given query to it. What's important to notice is is that the same process for indexing a document aswell as for tokenizing a query is performed. The data either a document or a search query will go through a so called analyzer, more on those later.

## Index
An Azure Cognitive Search Index consists out of `fields`, `analyzers`, `charFilters`, `tokenizers` and `tokenFilters`. In most cases one won't need to create a custom analyzer but rather would use one of the prebuild analyzers such as the language specific analyzers (nl.microsoft, en.microsoft) or the default analyzer. However it is possible to create a custom analyzer and configure it for the appropriate fields. Note that every field can configure its own analyzer. Even more so, its possible to configure a different analyzer for indexing the document than for searching(querying) the document. This can be a usefull scenario when one is trying to reduce the noise in the search results. Especially the prebuild language analyzers generate a lot of lingistic tokens that are not necessarily helpfull at all times. Below a JSON representation of an index.
```json
 {
     "name":"myindex",
     "fields":[
        {
           "name":"id",
           "type":"Edm.String",
           "key":true,
           "searchable":false
        },
        {
           "name":"title",
           "type":"Edm.String",
           "analyzer": "en.microsoft",
           "indexAnalyzer": null,
           "searchAnalyzer": null,
           "searchable": true
        },
        {
           "name":"text",
           "type":"Edm.String",
           "searchable":true,
           "analyzer":"my_analyzer"
        }
     ],
     "analyzers":[
        {
           "name":"my_analyzer",
           "@odata.type":"#Microsoft.Azure.Search.CustomAnalyzer",
           "charFilters":[
              "map_dash",
              "remove_whitespace"
           ],
           "tokenizer":"my_standard_tokenizer",
           "tokenFilters":[
              "my_asciifolding",
              "lowercase"
           ]
        }
     ],
     "charFilters":[
        {
           "name":"map_dash",
           "@odata.type":"#Microsoft.Azure.Search.MappingCharFilter",
           "mappings":["-=>_"]
        },
        {
           "name":"remove_whitespace",
           "@odata.type":"#Microsoft.Azure.Search.MappingCharFilter",
           "mappings":["\\u0020=>"]
        }
     ],
     "tokenizers":[
        {
           "name":"my_standard_tokenizer",
           "@odata.type":"#Microsoft.Azure.Search.StandardTokenizerV2",
           "maxTokenLength":20
        }
     ],
     "tokenFilters":[
        {
           "name":"my_asciifolding",
           "@odata.type":"#Microsoft.Azure.Search.AsciiFoldingTokenFilter",
           "preserveOriginal":true
        }
     ]
  }
```

## Analyzers
Let's take a closer look at an analyzer. As stated before an (custom) analyzer includes a `charFilter`, `tokenizer` and `tokenFilter`. The index requires an analyzer for every  `searchable` property, this can either be the same analyzer for indexing aswell as for searching. The analyzers can be configured using the `indexAnalyzer` and the `searchAnalyzer` properties. If one requires the same analyzer for both indexing aswell as searching then the `analyzer` property can be set. 

Depending on either or not one needs custom `charFilters`, `tokenizers` and `tokenFilters` one can configure them in the Index. [The Azure Cogntive Search documentation contains a reference of all prebuild components](https://docs.microsoft.com/en-us/azure/search/index-add-custom-analyzers). One can pick and choose to create the most optimal analyzer for its needs.
<figure><img src="/images/search/analyzer-flow.png" /><figcaption style="font-style: italic; text-align: center;">Azure Cognitive Search Analyzer</figcaption></figure>

It's important to know how an analyzer works. The tokens that are generated for every seachable field form the basis for every search outcome. One can easily test what tokens are generated by performing a simple REST call to the Azure Cognitive Search service. Below is an example of the difference between a `standard` (default) analyzer and the English `en.microsoft` analyzer. When entered the text `cycling helmet` the `en.microsoft` analyzer adds a conjugation of the word cycling namely the stem: cycle. When for instance this analyzer is configured for searching, then all properties that have the word cycle present in the index will be returned as a match on the given search query. This can be the cause of lots of noise or bad matching search results. Properties containing the exact match `Cycling` will return a higher score, but more on scoring in the Scoring chapter.

### Example of a language specific and default analyzer
Below one can see two examples of tokens being generated by a language specific and default analyzer. Note that language specific analyzers add conjugations of certain words. In a lot of cases conjugations of verbs, nouns but also adjectives are added. Note that in the example the stem of the verb is added and also the singular conjugation of the noun helmets. The standard analyzer however just splits the search query based on spaces and doesn't add any conjugations.

#### Example language specific analyzer
```json
POST https://[az search].search.windows.net/indexes/[index name]/analyze?api-version=[api-version]
    Content-Type: application/json
    api-key: [admin key]
{
  "text": "cycling helmets",
  "analyzer": "en.microsoft"
}
```
Response
```json
{
    "@odata.context": "https://[az search].search.windows.net/$metadata#Microsoft.Azure.Search.V2020_06_30.AnalyzeResult",
    "tokens": [
        {
            "token": "cycle",
            "startOffset": 0,
            "endOffset": 7,
            "position": 0
        },
        {
            "token": "cycling",
            "startOffset": 0,
            "endOffset": 7,
            "position": 0
        },
        {
            "token": "helmet",
            "startOffset": 8,
            "endOffset": 15,
            "position": 1
        },
        {
            "token": "helmets",
            "startOffset": 8,
            "endOffset": 15,
            "position": 1
        }
    ]
}
```
#### Example Standard Analyzer
```json
POST https://[az search].search.windows.net/indexes/[index name]/analyze?api-version=[api-version]
    Content-Type: application/json
    api-key: [admin key]
{
  "text": "cycling helmet",
  "analyzer": "standard"
}
```
Response
```json
{
    "@odata.context": "https://[az search].search.windows.net/$metadata#Microsoft.Azure.Search.V2020_06_30.AnalyzeResult",
    "tokens": [
        {
            "token": "cycling",
            "startOffset": 0,
            "endOffset": 7,
            "position": 0
        },
        {
            "token": "helmet",
            "startOffset": 8,
            "endOffset": 14,
            "position": 1
        }
    ]
}
```
For more information on how to test `analyzers`, `charFilters`, `tokenizers` and `tokenFilters` please visit: https://docs.microsoft.com/en-us/rest/api/searchservice/test-analyzer.

# Searching through documents. 
Now that you know how tokens are generated for both documents and search terms, we've come to a further review of the Azure Cognitive Search scoring mechanism. Depending on the API version you are using, Azure Cognitive Search uses the BM25 or TFIDF algorithm. In principle, both algorithms come down to the same thing. Basically what the algorithms do is compare the list of tokens stored in the index with the tokens generated for the specified search query and calculate a `term frequency`. The score that is calculated has a range of {% katex %}0...1{% endkatex %} where no results will be produced with a score of 0, but everything above is considered a result. So you can imagine that the conjugations the analyzer adds to the tokens can cause more documents to return a score of {% katex %}> 0{% endkatex %}, which could cause your search results to be noisy. Obviously, the documents with the most matched terms will score the highest, as a result of which the documents with the most matching content will be considered the best search results.

## Scoring profiles
In addition to the standard `term frequency` scoring mechanism, a scoring profile can be configured. A scoring profile consists of two parts, namely: weights & functions. Weights can be used to weigh certain fields in index more strongly than other fields. Each searchable field basically counts proportionally in determining the `0 - 1` term frequency score. What is important to know is that fields with a relatively long text will yield a lower score than fields with a short text. In other words, the term frequency of a short text field is logically higher than the term frequency of a long text field. For example, if you search for `cyling helmet` and the title of the document contains the exact terms, the score off that field will be higher than if the description of ~ 200 words also contains the text cycling helmet. Suppose the title is 'Red Specialized Cycling Helmet', then the term frequency is relatively high. The description may also include content such as aerodynamics or other details of the product in which the words `cylcing helmet` are relatively less frequent. Based on this reasoning, it is therefore not always wise to weigh the title more heavily as the description field, because the length of the content of the fields is already strongly included in the `term frequency` algorithm.

However, weights can be a good addition to tweak search results. A good example is to apply weights to keyword fields. An E-commerce platform often has keywords that should give a strong boost in relevance when the user enters exactly the keyword as search term. In the case of keywords, it is important to determine whether conjugations generated by the analyzer have a negative or positive effect on the accuracy of the search results. For keywords you may want to ensure that only exact matches cause an increase in relevance and not conjugations. An example to illustrate the concept. The `en.microsoft` analyzer will generate the tokens `cylcing`,` cycle` and `helmet` for the search query: `cylcing helmet`. When the user enters the search query: `motorcycle helmet`, document with the keyword `Cycling helmet` will also be scored. If, for example, a comparison is made with a motorcycle helmet in the description, it is possible that a cycling helmet document scores even higher than a motorcycle helmet. So keep in mind what keywords you store and how much you let them weigh in.

## Scoring algorithm 
Azure Cognitive Search uses a scoring algorithm which they do not publish in their documentation. It can therefore be quite hard to figure out how a score is composed and how the different factors come in play. I tried to the sum it up in a mathematical equation. I'm by no means a mathematician but I tried to do it well. I found this algorithm by reverse engineering the Azure Cognitive Search. The process was quite simply, first add some searchable fields to an index, add some documents and evaluate the total unweighted score, I then added weights to see how they affect the search score and I found out that the weights multiply the raw search score which are yielded by the BM25 or TFIDF algorithm. I then added functions to see how they would come into play and I realised they also multiply the total weighted score of all searchable fields. If you put all of that you will get the following equation:

{% katex %}
% s = \displaystyle\left(\sum_{i=0}^\infin{f_s(a_i) * w_i}\right)*\left(f_a({\sum_{n=0}^\infin{f_n(x)}})\right)\\
s_t = ((f_s(a_1) * w_1) + (f_s(a_2) * w_2) + ...) * (f_a(f_1(x), f_2(x), ...))
{% endkatex %}
</br>
{% katex %}s_t{% endkatex %} will be the total score for each document. </br>

### Weights
{% katex %}
s_t = \boldsymbol{((f_s(a_1) * w_1) + (f_s(a_2) * w_2) + ...)} * (f_a(f_1(x), f_2(x), ...))
{% endkatex %}
The left hand of the function is a series of searchable fields ({% katex %}a_i{% endkatex %}) which will be evaluated. Each field will be evaluated by the scoring function ({% katex %}f_s {% endkatex %}) which is either a BM25 or TFIDF algorithm. The output of the function will yield a score of {% katex %}0...1{% endkatex %} which will be multiplied by the weight ({% katex %}w_i{% endkatex %}) which corresponds to the evaluated field ({% katex %}a_i{% endkatex %}). The total of all evaluated search fields will be summed up and yield a total weighted score.

### Functions
{% katex %}
s_t = ((f_s(a_1) * w_1) + (f_s(a_2) * w_2) + ...) * \boldsymbol{(f_a(f_1(x), f_2(x), ...))}
{% endkatex %}

The right hand of the function is a series of functions ({% katex %}f_i{% endkatex %}) which will be evaluated. Each function can either be a `freshness`, `magnitude`, `distance` or `tag` functions. The aggregration of the series of functions can be either a `summation`, `average`, `minimum`, `maximum` or first matching function ({% katex %}f_a{% endkatex %}).

The score yielded by a function can be quite hard to understand. In all cases one needs to pick an `interpolation` and a `boost` factor. The interpolation affects the score prior to boosting it. When the interpolation is not constant then the function score will be determined on the range set in the scoring function. The `freshness`, `magnitude`, `distance` logically need a range of values to work with. These scoring functions boost documents that are within a time period, a numeric range or a geographical range. In all cases the scoring functions returns a score of {% katex %}0...1{% endkatex %}. The boost function will then multiply the score with an offset of 1. This is also the reason why the boosting function has to be {% katex %} > 1{% endkatex %}. The equation of predicting the total score of a function is: {% katex %}s = 1+(b-1)*f_s{% endkatex %}, where {% katex %}s{% endkatex %} is the score, {% katex %}b{% endkatex %} is the `boost` factor and {% katex %}f_s{% endkatex %} is the function score.

<figure><img src="/images/search/scoringfunction.png" /><figcaption style="font-style: italic; text-align: center;">Scoring Function Interpolation</figcaption></figure>

I will eloborate further with an example. Lets say you have a new site or E-commerce platform that needs to boost document that are written in the last year. In order for you to do that you need to configure a `magnitude` function with for instance a linear `interpolation`. If you want to relevance to decrease rapidly or slowly then one should choose a quadratic or logarithmic interpolation. If documents need to boost constantly over the entire year one chooses constant. 

Lets say we have a document that has a written date of 50 days ago. The range of the freshness function is set from today to 365 days ago. That gives us a range of 0...365. In our example 50 days from now scores a `0.8630137` if 1 is today and 0 is 365 ago or earlier. One can easily calculate the value on a custom scale by this function: {% katex %}(minimum-value)/(minimum-maximum){% endkatex %}, in our case: {% katex %}(365-50)/(365-0)=0.8630137{% endkatex %}. If a boost of 2 is configured the total score of the function will be {% katex %}1.8630137 = 1+(2-1)*0.8630137{% endkatex %}

### Total
{% katex %}
total score = (weighted field scores) * (function aggregration)
{% endkatex %}
This brings us at the grand total of a document including weights, functions and boosting. The total is a simple multiplication of the total weightes score times the total of the function aggregation.

# Measuring performance
Measuring search performance is very difficult. Apart from the fact that it is complex to understand the logic that drives the search results, understanding the performance of your Azure Search is complex. This is because a search query often returns multiple results that come back in a certain order. The order of the results largely determines the performance of your Azure Search device. Tweaking the analyzers, scoring profiles and the like can have a big effect on the performance of your Azure Search. However, it is strongly recommended to compile a gold set of the most commonly used queries before tweaking. Depending on the size of your Azure Search, I recommend a Goldset of about 100-200 commonly used search terms. The goldset helps you to stay out of the discussion of edge cases, too often I have seen that the Azure Search was adjusted to accommodate a certain egde case, but I forgot to test regression properly. It may then happen that an adjustment actually results in a worse general performance. To prevent this, you should always test with a gold set that is representative of your target audience. If an edge becomes so important, you should add it to the gold set in order to always test from a fixed basis whether the adjustments you make bring about a general improvement.

An important tip I would like to give you is that it is wise to store the gold set in a database. For example a SQL Database table or an Azure Table Storage table. This will allow you to automate the regression test in the long run. Automating the regression test is essential to be able to continuously make small improvements to your Azure Search in an Agile way.
## Regression testing
Suppose you have a gold set, how do you perform a regression test on Azure Search? First of all, you need to create a script that retrieves the goldset from the database and runs it on the Azure Search index. You must then store the results in a database. This can be a simple table with the search term as primary key, a date time column and as other columns the IDs of the top 10 search results. With this data you can analyze the impact of an adjustment by comparing 2 test runs. The first metric of interest is the ** significance of the adjustment **. To determine the significance you can simply use the percentage of:
* the number of queries where the 1st search result has been changed.
* the number of queries where the first 3 search results were changed.
* the number of queries where the first 5 search results were changed.
* the number of queries where the first 10 search results were changed.

This gives you an idea of whether the change you have made has a major impact or not. If it has a big impact then you should be aware that it can also have a big impact on the user experience.

## Analysing a regression test
When you have performed a regression test, it is wise to classify the major changes as improvement or deterioration. Of course, you cannot classify the changes based on the average change reate, you will have to look at certain search terms more closely. What I find a clear and good method is to compare 2 test runs with each other and thus generate the following table.

| Search term     | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|-----------------|--------------------------------------|---|---|---|---|---|---|---|---|----|
| Racing bike     |<span class="w3-badge w3-orange">2</span>|<span class="w3-badge w3-orange w3-orange">3</span>|<span class="w3-badge w3-orange">4</span>|<span class="w3-badge w3-orange">5</span>|<span class="w3-badge w3-orange w3-red">1</span>|<span class="w3-badge">6</span>|<span class="w3-badge">7</span>|<span class="w3-badge">8</span>|<span class="w3-badge">9</span>|<span class="w3-badge">10</span>|
| Gravel bike     |<span class="w3-badge">1</span>|<span class="w3-badge">2</span>|<span class="w3-badge">3</span>|<span class="w3-badge w3-orange ">5</span>|<span class="w3-badge w3-orange ">4</span>|<span class="w3-badge">6</span>|<span class="w3-badge">7</span>|<span class="w3-badge">8</span>|<span class="w3-badge">9</span>|<span class="w3-badge">10</span>|
| Cyclocross bike |<span class="w3-badge">1</span>|<span class="w3-badge">2</span>|<span class="w3-badge">3</span>|<span class="w3-badge">4</span>|<span class="w3-badge">5</span>|<span class="w3-badge">6</span>|<span class="w3-badge">7</span>|<span class="w3-badge ">8</span>|<span class="w3-badge w3-orange ">10</span>|<span class="w3-badge w3-orange ">9</span>|
| Mountainbike    |<span class="w3-badge w3-green">8</span>|<span class="w3-badge w3-green">9</span>|<span class="w3-badge w3-green">10</span>|<span class="w3-badge">4</span>|<span class="w3-badge">5</span>|<span class="w3-badge">6</span>|<span class="w3-badge">7</span>|<span class="w3-badge w3-red ">2</span>|<span class="w3-badge w3-red">1</span>|<span class="w3-badge w3-red">3</span>|
| Cycling helmet  |<span class="w3-badge">1</span>|<span class="w3-badge w3-green">new</span>|<span class="w3-badge w3-orange">2</span>|<span class="w3-badge w3-orange">3</span>|<span class="w3-badge w3-orange ">6</span>|<span class="w3-badge w3-orange ">5</span>|<span class="w3-badge w3-orange ">7</span>|<span class="w3-badge w3-orange ">8</span>|<span class="w3-badge">9</span>|<span class="w3-badge">10</span>|
| Cycling gloves  |<span class="w3-badge">1</span>|<span class="w3-badge">2</span>|<span class="w3-badge">3</span>|<span class="w3-badge w3-orange ">4</span>|<span class="w3-badge w3-orange ">5</span>|<span class="w3-badge w3-orange ">6</span>|<span class="w3-badge w3-orange ">7</span>|<span class="w3-badge w3-orange ">8</span>|<span class="w3-badge">9</span>|<span class="w3-badge">10</span>|
| Bicycle lights  |<span class="w3-badge w3-green">7</span>|<span class="w3-badge w3-orange ">4</span>|<span class="w3-badge w3-orange ">3</span>|<span class="w3-badge w3-orange ">2</span>|<span class="w3-badge w3-orange ">5</span>|<span class="w3-badge w3-orange ">6</span>|<span class="w3-badge w3-red">1</span>|<span class="w3-badge w3-orange ">8</span>|<span class="w3-badge">9</span>|<span class="w3-badge">10</span>|
| Cycling bibs    |<span class="w3-badge">1</span>|<span class="w3-badge w3-orange ">4</span>|<span class="w3-badge w3-orange ">6</span>|<span class="w3-badge w3-orange ">2</span>|<span class="w3-badge w3-orange ">5</span>|<span class="w3-badge w3-orange ">3</span>|<span class="w3-badge w3-orange ">7</span>|<span class="w3-badge w3-orange ">8</span>|<span class="w3-badge">9</span>|<span class="w3-badge">10</span>|
| Cycling tights  |<span class="w3-badge">1</span>|<span class="w3-badge">2</span>|<span class="w3-badge">3</span>|<span class="w3-badge">4</span>|<span class="w3-badge">5</span>|<span class="w3-badge">6</span>|<span class="w3-badge">7</span>|<span class="w3-badge w3-orange ">10</span>|<span class="w3-badge w3-orange ">9</span>|<span class="w3-badge w3-orange ">8</span>|

<span class="w3-badge w3-green">?</span> If it has moved more than 5 places forwards.
<span class="w3-badge w3-red ">?</span> If it has moved more than 5 places backwards.
<span class="w3-badge w3-orange ">?</span> If it has the same rank with a margin of 3.
<span class="w3-badge">?</span> If its has the same rank.

In this example I use a gold set of 10 search terms which can be used for for instance a bicycle E-commerce store. In this overview, the significance of the change can be seen quickly and easily. When you see major changes, you can always analyze the results more closely and see if the change you made in case of a single search term is an improvement or a deterioration. If too many deteriorations have occurred, consider whether you want to bring the adjustment live.

This way you can regression test adjustments to an Azure Search. You keep the old index intact and also build a new one. By running the goldset on both Azure Search indexes you can analyze the impact of your change and later classify the results of individual search terms as improvement or deterioration.

# 10 Azure Search performance tips
1. Create a gold set of search terms and improve your Azure Search based on this set.
2. Make sure to test regression so that you can estimate the impact and classify it as improvement or deterioration.
3. Automate the regression test.
4. Make sure you have good and clean data. Divide the data into fields. Avoid adding additional fields with bulks of text.
5. Apply weights for fields that are important. Make sure weights are balanced.
6. Apply functions to determine scenarios such as time relevance or commercial considerations.
7. Make sure you use the same indexing analyzer as search.
8. Provide good facet and filter options so that the data being searched with text search is already limited.
9. Use the correct analyzers for fields or create custom analyzers as needed.
10. A / B test the changes you make to the Azure Search.


<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
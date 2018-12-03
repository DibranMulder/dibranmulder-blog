---
title: Building a Web Scraper in Azure
tags:
---
Building a web scraper is pretty hard. Doing it in Azure is harder. Utilizing Serverless and PaaS services is challenging. I dont want to hire a VM and just deploy the scraper there because I need it to be scalable, secondly I only want to pay for actual usage and not for a VM thats idle.

## The case
I want to scrape certain websites 2 a day. At 10:00 UTC and at 18:00 UTC. This frequency might change in the future so I don't want to have it build in hard coded. I'm scraping ecommerce sites and the pages that need to be scraped depend on a list of id's comming from a database. So the input for the scraper is dynamic. Lastly the output of the scraper has to be stored in a database. Later on I will have to develop some UI which discloses the information for ecommerce traders.

## The solution
<img src="/images/scraper/azure-web-scraper.png" />
Web scraping comes in different shapes and sizes. Some packages just perform Http calls and evaluate the response. Others spin up and entire (headless) browser and perform actual DOM operations. Since I want to scrape different ecommerce sites spinning up an actual browser looked like the way to go. Also because lots of ecommerce sites rely on alot on JavaScript. Some are build as an SPA and that requires per definition a browser based approach. After some research I stumbled upon `puppeteer`. A headless Chrome API build by Google itself, very promising.

My initial idea was to run puppeteer inside an Azure Function, however after some research I came to the conclusion that running a headless browser on Azure PaaS or Serverless [is not going to happen](https://github.com/GoogleChrome/puppeteer/issues/515). So what are the alternatives? Well containers seems like a reasonable solution. I can spin up and tear down the container with some orchestration and thereby limit my costs. A good start point for running puppeteer containers in Azure is [this blog post](https://medium.com/@bogdanbujdea/running-puppeteer-in-azure-container-instances-b24fb0a8d3e).

For orchestrating the scraper I was thinking about using Azure Functions again. But then on a bright day I figured I would use Azure Logic Apps instead. Logic Apps are great for defining and running workflows and look like a perfect fit. They are pay per usage and are easy to develop!

## The details


### Puppeteer, TypeScript and NodeJs
I wanted to brush up my TypeScript and NodeJS skills since it has been a while that I seriously developed in TypeScript. The last time I did something significant I was still using Visual Studio instead of VS Code for TypeScript development. So here's the story to get a puppeteer scraper working in NodeJs, Express and TypeScript.

#### Depedencies
```bash
npm install puppeteer --save
npm install azure-storage --save

npm install @types/puppeteer --save-dev
```

`CTRL + SHIFT B` To compile
sourcemaps enabled.
tsconfig.json
```json
{
    "compilerOptions": {
        "module": "commonjs",
        "target": "es5",
        "lib": ["es5", "es6", "dom"],
        "noImplicitAny": false,
        "sourceMap": true
    }
}
```

Debug
launch.json
```
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "preLaunchTask": "tsc",
            "name": "Launch Program ",
            "sourceMaps": true,
            "program": "${workspaceFolder}\\scraper.js",
            "outFiles": [
                "${workspaceFolder}/**/*.js"
            ]
        }
    ]
}
```

#### Async programming with Node
- Express json


### Docker and Azure

### Azure Logic Apps


https://medium.freecodecamp.org/the-ultimate-guide-to-web-scraping-with-node-js-daa2027dcd3


I started with the idea to run 
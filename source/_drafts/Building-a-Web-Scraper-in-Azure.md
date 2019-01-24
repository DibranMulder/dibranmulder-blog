---
title: Building a Web Scraper in Azure
date: 2019-01-18 13:38:43
tags: 
- Azure
- Logic Apps
- Functions
- Wordpress
- Docker
- TypeScript
---

Building a web scraper is pretty hard. Doing it in Azure is harder. Utilizing Serverless and PaaS services is challenging. I don't want to pay for a VM and just deploy the scraper on it because I need the solution to be scalable. Secondly I only want to pay for actual usage and not for a VM thats idle.

## The case
I want to scrape certain websites twice a day. At 10:00 UTC and at 18:00 UTC. This frequency might change in the future so I don't want to have it build in hard coded. I'm scraping ecommerce sites and the pages that need to be scraped depend on a list of id's comming from a database. So the input for the scraper is dynamic. Lastly the output of the scraper has to be stored in a database. Later on I will have to develop some UI which discloses the information for ecommerce traders.

## The solution
<img src="/images/scraper/azure-web-scraper.png" />
Web scraping comes in different shapes and sizes. Some packages just perform Http calls and evaluate the response. Others spin up and entire (headless) browser and perform actual DOM operations. Since I want to scrape different ecommerce sites spinning up an actual browser looked like the way to go. Also because lots of ecommerce sites rely on alot on JavaScript. Some are build as an SPA and that requires per definition a browser based approach. After some research I stumbled upon `puppeteer`. A headless Chrome API build by Google itself, very promising.

My initial idea was to run puppeteer inside an Azure Function, however after some research I came to the conclusion that running a headless browser on Azure PaaS or Serverless [is not going to happen](https://github.com/GoogleChrome/puppeteer/issues/515). So what are the alternatives? Well containers seems like a reasonable solution. I can spin up and tear down the container with some orchestration and thereby limit my costs. A good start point for running puppeteer containers in Azure is [this blog post](https://medium.com/@bogdanbujdea/running-puppeteer-in-azure-container-instances-b24fb0a8d3e).

For orchestrating the scraper I was thinking about using Azure Functions again. But then on a bright day I figured I would use Azure Logic Apps instead. Logic Apps are great for defining and running workflows and look like a perfect fit. They are pay per usage and are easy to develop!

### Puppeteer, TypeScript and NodeJs
I wanted to brush up my TypeScript and NodeJS skills since it has been a while that I seriously developed in TypeScript. The last time I did something significant I was still using Visual Studio instead of VS Code for TypeScript development. So here's the story to get a puppeteer scraper working in NodeJs and TypeScript.

#### Depedencies
First of all get TypeScript tsconfig.json file there using the following command. 
```cmd
tsc --init
message TS6071: Successfully created a tsconfig.json file.
```
A sample of how your TypeScript configuration file might look like is this.
Once important thing is to enable source maps. This allows you to debug your TypeScript code instead of debugging the transpiled JavaScript (which is a mess).
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
Once you've setup the TypeScript configuration its time to setup a NPM project.
```cmd
npm init
```
You are now ready to start developing your TypeScript application.
You probably need some packages to interface with Puppeteer, Azure storage or whatever. Install them using npm.
```cmd
npm install puppeteer --save
npm install azure-storage --save
```
A lot of packages got separate TypeScript definition packages. These are required to have type checking. We also require them for puppeteer. You should install them as a dev-dependency instead of a regular dependency.
```cmd
npm install @types/puppeteer --save-dev
```
#### Puppeteer
Once you've installed your dependencies you can start developing your scraper. It's all up to you to interact with the page and retrieve the right information. A very basic example is this:
```typescript
import * as puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('https://somesite.com');

// Evaluate the page and interact with it.

await browser.close();
```
One thing you probably want to do is to debug your code. In VSCode you'll have to add a debug configuration. This can be achieved by adding the following configuration in `launch.json`. Notice the "Launch program" configuration inside the debug panel of VS Code.
```json
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
### Docker and Azure
Well you've got your scraper working on Node using TypeScript. The next thing is to host it in the Cloud. We want to containerize the application inside a docker container. Building a docker container requires a dockerfile. Here's one that works for the Puppeteer scraper. 

A nice blogpost that I used to run a Docker container on Azure Container Instances [is this](https://medium.com/@bogdanbujdea/running-puppeteer-in-azure-container-instances-b24fb0a8d3e).

```docker
FROM node:8-slim

# install chrome rather than relying on Puppeteer 
RUN apt-get update && apt-get install -y wget --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get purge --auto-remove -y curl \
    && rm -rf /src/*.deb

# copy project files and install dependencies
COPY . /var/app  
WORKDIR /var/app
RUN npm install
#for some reason puppeteer must be installed separately, although it is included in package.json
RUN npm i puppeteer 
ENV AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=tradersmatest01;AccountKey=/1hvL/O98Ni5NVqhIbL52MugGk0pVUFevP/Kw1uRXfMtGneWtIKtLkP8ZVtA/+YbFjIS0hY/u9q/8QolC5hIUw==;EndpointSuffix=core.windows.net
ENV AZURE_SERVICEBUS_CONNECTION_STRING=Endpoint=sb://tradersmatesb01.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=5pNgC1zxPFxcmajxf9w4fZdyiKpRa3i3pqIhsaoiHno=

ENTRYPOINT ["node", "scraper.js"]
```

### Azure Logic Apps
<img src="/images/scraper/logicapp.png" />

https://medium.freecodecamp.org/the-ultimate-guide-to-web-scraping-with-node-js-daa2027dcd3


I started with the idea to run 
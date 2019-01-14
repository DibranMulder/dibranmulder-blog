---
title: Using Azure Functions Core tools for NodeJS functions
tags:
---

- npm install -g azure-functions-core-tools@core
- func init <projectname> --docker
- func new 
    - Follow wizard
- tsc --init
- npm init

- func start
- func extensions install --package Microsoft.Azure.WebJobs.Extensions.ServiceBus --version 3.0.1
- func start

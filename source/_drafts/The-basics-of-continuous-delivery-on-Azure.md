---
title: The basics of continuous delivery on Azure
tags: Azure, VSTS, SPN, ARM, Powershell, Subscription, Resource Group
---
Continuous delivery can get pretty complicated, especially when you have multiple stage gates and workloads. In this blogpost I will describe the basics of continuous delivery with Azure and VSTS.

## The big picture
<img src="/images/SPN.png" />
As you probably know Azure has works with subscriptions and resource groups. You can have multiple Subscriptions, typically one for Production and one or more for Dev, Test and Acceptance. These subscriptions often contain douzens of resource groups. Resource groups typically contain a workload or logically separated unit of your workload, lets say a mircoservice for instance.


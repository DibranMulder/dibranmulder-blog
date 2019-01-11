---
title: Using Wordpress in Serverless Azure
tags:
---
I recently started a startup which facilitates product research on ecommerce marketplaces. The software tool being development communicates with multiple marketplace API's and also with my custom made web scraper, running inside a docker container in Azure.

To attract customers my tool needs a landing page which must be SEO optimized. Secondly I need to administer users and arrange subscriptions. These subscriptions allow the user access to my product research tool. Some level of subscriptions (e.g. starter, professional, enterprise) require a recurring payment via for instance Ideal or Creditcard payments. 

To develop this by hand it will take me a lot of time and secondly my partners can't contribute. Therefore we decided to build the user management and subscriptions module inside Wordpress. In this way my partners can help to setup a landing page, SEO optimize it and arrange the recurring payments module inside Wordpress.

In this blogpost I will demonstrate some key concepts that will 
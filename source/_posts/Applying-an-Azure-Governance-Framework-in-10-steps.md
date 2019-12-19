---
title: Applying an Azure Governance Framework in 10 steps
date: 2019-12-06 16:17:55
tags:
---
<figure><img src="/images/governance/framework.png" /><figcaption style="font-style: italic; text-align: center;">Caesar Azure Governance Framework.</figcaption></figure>

Every year RightScale, now Flexera, holds a survey to measure the current cloud challenges. This year just like in previous years Managing cloud spend and applying governance were the top challenges companies face. This blogpost is to manage the governance challenge. It provides a simple but yet effective framework to apply cloud governance into your business.

# 1. Get a grip on your subscriptions
<figure><img style="width: 400px;" src="/images/governance/subscriptions.png" /><figcaption style="font-style: italic; text-align: center;">Azure account types</figcaption></figure>

It all starts with your Azure subscriptions. When creating an Azure tetant there are 4 ways of creating it. 
If you choose to create one via Microsoft then you have 2 options, either the Pay-As-You-Go account type or an Enterprise Agreement.
If your organization it not a small or medium business then you will probably need an Enterprise Agreement. It offers you a way to easily create multiple subscriptions and create them accordingly to for instance your business value domains.

The alternative is to choose either a direct on indirect Microsoft partner. These are so called Cloud Solution Providers. The CSP's will get a kick back fee for your Azure consumption making it a interesting option for them to help you with your Azure needs. In return Microsoft expects that CSP's will give a first line of support to their customers.

<figure><img style="width: 400px;" src="/images/governance/dta-prod.png" /><figcaption style="font-style: italic; text-align: center;">Azure subscriptions; dev, test, acceptance & production.</figcaption></figure>

It's also wise to always create a separate production subscription or dependent on the size of your value domains also separate dev, test and acceptance subscriptions. For security and governance reasons later described in the Role based Access Control section, it is wise to separate production from dta. 

## To conclude
Basically, the rules of thumb are:
1. Only if you're a really small company or start-up use a Pay-As-You-Go subscription.
2. Use CSP subscriptions if you need a 3rd party to help you with 1st line of support questions.
3. Use an Enterprise Agreement if your reasonable in size and want to negotiate with Microsoft regarding Azure prices.

Secondly,
1. Create multiple subscriptions for different value domains within your company.
2. Create separate subscriptions for dev, test, acceptance and production workloads.

For a detailed overview of Enterprise Agreement, CSP and Pay-As-You-Go subscriptions please visit [this blog](https://medium.com/@vunvulear/different-ways-of-buying-azure-services-pay-as-you-go-ea-direct-csp-indirect-csp-a563aa8cd89d).

# 2. Apply structure with Naming conventions
It sounds evident but it's certainly not. Applying **transparent** and **clear** naming conventions is often forgotten or poorly implemented. Especially when there is no central organ within an organization that sees to it that the conventions are correctly applied. The importance of naming conventions can't be overestimated. Without them Azure subscriptions quickly become a mess of unrelated, unregulatable resources. 

It's very important that the naming conventions are consistent throughout the various subscriptions.
Often Infrastructure as Code (IAC) code, such as ARM templates or Azure CLI commands, is parameterized based on these conventions.
Its helps to **reuse code** and make **fewer mistakes**.

A naming convention is often a composition of properties that describe the Azure resource.
One composition that I often use is the following:

```
env-company-businessunit-application-resourcetype-region-suffix
```

Its made up out of several critical properties, some that are also used within some naming conventions proposed by [the Microsoft documentation](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/naming-and-tagging).

<table><tr><th>Property</th><th>Example</th><th>Abbreviation</th></tr><tr><td>Environment</td><td>Production</td><td>p</td></tr><tr><td>Company</td><td>Cloud Republic B.V.</td><td>clr</td></tr><tr><td>Business unit</td><td>Development</td><td>dev</td></tr><tr><td>Application</td><td>Customer Portal</td><td>csp</td></tr><tr><td>Resource type</td><td>Resource Group</td><td>rg</td></tr><tr><td>Region</td><td>West Europe</td><td>weu</td></tr><tr><td>Suffix</td><td>001</td><td>001</td></tr></table>

**Resulting in this name**:
```
p-clr-dev-csp-rg-weu-001
```

Applying the same naming conventions throughout the whole organization can be very useful. Organizations often endup building tooling to automate development processes and workflows. Without a consistent and clear naming convention this can be very hard. Secondly having a consistent and clear naming convention can help to reduce security issues. For Ops-people it has to be clip and clear if the resource is a production one and if its vital to the organization. With the right naming its easier to categorize resources.

## Some generic tips for composing a naming convention
1. Start with the environment property because its often the only parameterized property. This reduces the need for string concatenation within IaC code.
2. Use 3 or 4 letter abbreviations consistently throughout all properties.
3. Use the resource abbreviations [proposed by Microsoft](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/naming-and-tagging#recommended-resource-type-prefixes).
4. Add a suffix because it may occur that a resource name is locked for a significant amount of time when its deleted.
 - This happened to me once when I tried to recreate an Azure Service Bus. The name was locked for 2 days.
5. Use all lower cases characters, [there are some restrictions](https://docs.microsoft.com/en-us/azure/architecture/best-practices/resource-naming).
6. Don't use special characters, only alphanumeric characters. Hyphen (-) excluded.
7. Try to be unique
 - Some resource names, such as PaaS services with public endpoints or virtual machine DNS labels, have global scopes, which means that they must be unique across the entire Azure platform.

# 3. Take precautions with Blueprints / Policies
<figure><img src="/images/governance/azure-gov.png" style="width:600px" /><figcaption style="font-style: italic; text-align: center;">[Azure Governance Architecture](https://www.microsoft.com/en-us/us-partner-blog/2019/07/24/azure-governance)</figcaption></figure>

There are several ways to create Azure resources, namely via the Azure portal, ARM templates, Azure CLI or via Powershell. In all cases its very important that Azure resources are created in a controlled manner. We often see organizations struggling with compliance and governance, especially when an organization wants to get back in control after a period of experimenting and starting.

Its very important to adopt the major DevOps practices to truely get back in control. Some practices that really relate to governance are the following.
1. Version control
2. Continuous integration
3. Continuous delivery
4. Infrastructure as Code
5. Monitoring and logging

These practices all point to a set of underlying principles, namely: traceability and accountability and the least access principle.
## Traceability and accountability
**Version control** and CI/CD enables organizations to get in control of the artifacts that are being deployed in their cloud environment. With an DevOps platform like Azure Devops its very easy to setup source code repositories (with for instance Git) to take care of an organizations source code. Version control helps organizations to collaboratively work on code in a controlled way. 

With **Continuous integration** organizations can continuously check the status of their code. Does the latest change negatively or positively impacted the quality of the code? With static code analysis and automated testing with for instance unit testing the quality of the code can be made deterministic. Did the unit test code coverage increase or decrease with the latest change? And did we have more or less compiler warnings?

With **continuos delivery** organizations can continuously deploy their artifacts to a testing environment. Getting the feedback loop as quick as possible boosts the quality of an Agile development cycle. It enables testers to test a developers work earlier and also it enables product owners and stakeholders to provide feedback earlier. Lastly setting up a delivery pipeline to for instance Azure reduces the amount of deployment mistakes. Once the delivery pipeline is setup it should also work for production.

With **infrastructure as code (IaC)** organizations can make sure that the created resources in Azure are consistent and reliable. IaC enables developers to specify the infrastructure needed for their applications in code. This can either be template like for instance an JSON ARM template, but it can also be a script with Azure CLI or Azure Powershell. It's also possible to use cloud independent tools like Terraform, Ansible or Pulumi. In all cases automation accounts are used to create or update resources in Azure. Secondly within your DevOps platform, like Azure DevOps you can make sure that this IaC code is reviewed by atleast 2 people and use Continuous delivery pipelines to execute the IaC code against your Azure subscriptions.

With **monitoring and logging** organizations can get continuous feedback on the health, performance and reliability of their applications. With a good governance framework in place organizations will use the monitoring dashboards as a primary source of information for their production applications. When RBAC is taking care of developers are typically not authorized to sneak and peek into production. More on that in the least access principle.

## Least access principle
One very important principle which is truely going to impact your business, both in a developers mindset way but also in a procedural way, is the **least access principle**. Basically it comes down to the fact that no developer has access to read or modify production related resources. DevOps-engineers should use monitoring and logging to get a sense of how table their production applications are running. With this measure we tackle two very important, namely: GPDR law and unintended production disorders.

When DevOps-engineers can't touch production and are obligated to work via the CI/CD pipelines and use monitoring then they are going to think different. Initially they might slow down but eventually they will test better and add better monitoring and logging to get insights into their applications. You don't want your engineers to run blind and therefore implementing this measure requires true care. You can start with taking away their contributor rights and let them fix issues via the CI/CD pipeline.

### Temporary access via Privileged Identity Management
Ofcourse we understand that sometimes when a production issue occurs DevOps-engineers have to look into the Azure resources manually. Ideally this is not what you want since how do you know they don't break other things? How do you know that they do not get access data privacy related data and so on. However sometimes its necessary, especially when the logging isn't suffice.

Azure Active Directory has a great feature for this scenario, its called Privileged Identity Management, short PIM. With PIM administrators can give **just-in-time** role assignments to DevOps-engineers. The role assignments can be **time-bound** so that the role assignments will be resigned after a given period of time. Secondly a very important feature for GPDR and the Dutch AVG privacy laws is the **audit history**. An admin can download an audit history for the temporary elevated privileges, this can be needed for audits regarding privacy and security.

## So what are Azure Policy and Azure Blueprints?
So once you've setup the DevOps practices you can apply Azure policies and blueprints to further secure your Azure environment and ensure compliance. Policies are basically a set of rules to which an Azure resource has to comply. Think about tagging your Azure resources with costs center tags or maybe you want to enable SSL/TLS for all web traffic and disable plain Http encrypted traffic. You can enforce this with Azure Policy. 

Blueprints on the other hand are more a template sort of functionality. It enables organizations to define a way of setting up Azure resources, a default way of setting up for instance a SQL Server with a Web App. Complying to the set of rules defined by your organization, like for instance default SSL/TLS, always encrypted databases, integrated Active Directory authentication and so on. This helps to prevent that Azure resources are being created that do not comply to your policies.

https://docs.microsoft.com/en-us/azure/devops/learn/what-is-devops
https://www.microsoft.com/en-us/us-partner-blog/2019/07/24/azure-governance

# 4. Add security with Role based Access Control (RBAC)
<figure><img src="/images/governance/rbac-overview.png" style="width:400px" /><figcaption style="font-style: italic; text-align: center;">[Azure - Role Bassed Access Control](https://docs.microsoft.com/en-us/azure/role-based-access-control/overview)</figcaption></figure>

One of the key pilars of any governance framework is an authorization / authentication framework. In Azure its tightly linked with Azure Active Directory and how that integrates with Azure resources. In essence there are 4 types of security principals namely: **users**, **groups**, **service principals** and **managed identities**. Those service principals are then **assigned a role**, typically: **owner**, **contributor** or **reader** to a specific scope. Let's say a resource group or subscription.

## Users and groups
Having a clear separation between production and dev/test workloads helps to arrange the right RBAC implementation. For dev and test subscription you might want to assign everyone the contributor role to the whole subscription. In acceptance workloads you might want to narrow down the role assignments to teams of DevOps-engineers being having reader role assignments to their resource groups. And in production you only want maybe first line of support engineers to have reader role assignments.

When DevOps-engineers are assigned roles to certain Azure scopes its very important to create logical groups of users, and then assign the roles to those groups instead of to users directly. If an admin assigns roles directly to users it will quickly become a clumsy mess of role assignments, and people eventually will get access to the Azure resources which they should get access to. irectly to user accounts. It will quickly become a clumsy mess swamp of role assignments which is not controllable. 

## Managed identities
Managed identities are basically security principals that behave on behalf of applications. These managed identities and their role assignments should always be created through Infrastructure as Code. Redeploying applications should never break these identities. 

## Service principals
Service principals on the other hand are Azure security principals that are used to connected other services to the Azure environment. Its often used to connect Azure Devops pipeliens to an Azure account. Its very important that these sevice principals do not become God accounts. Its a common mistake to allow the service principals on the whole subscription. One should always narrow the scope of such a service principals to the resource groups a team should have access to. Secondly the service principals will have access to production application. If a developer has access to the service principals via for instance Azure DevOps pipelines then the engineer basically has delegated production rights. Administrators therefore have to take care of the Azure DevOps roles and rights aswell. The rule of thumb that we use alot is that every change has to be seen by 2 sets of eyes. So a DevOps-engineer should never be able to release anything into production without having an extra peer review. This especially counts for edits on the release pipelines, thats why Yaml release pipelines are such a great feature.

# 5. Bring logic in the universe with Azure Resource Groups
<figure><img src="/images/governance/resource-group-example.png" style="width:600px" /><figcaption style="font-style: italic; text-align: center;">Azure Resource Groups example</figcaption></figure>
Setting up resource groups in Azure sounds like a next-next-finish exercise, however in practise it can be very difficult to come up with a clear and understandable setup of your resource groups. A rule of thumb that you can use is that **a resource group should always be a single unit of deployment**. In the example above I have tried to come up with a clear example.

Let's say you are building a portal. Its build with React and an ASP.net core backend. Ideally you want to be able to deploy the backend API separately from your front-end single page application. Its then fundamental to split those resources up into 2 separate resource groups. In the naming scheme we have used the following pattern: environment-company-production-resource-region-suffix, where the company, Cloud Republic is abbreviated to: ```clr``` and the product portal to: ```por``` and the financial module to: ```fin```. 

With this resource groups are a logical set up Azure resources that are deployed as a single unit. **Secondly resource groups are linked with their names to collectively form a product**. This helps for instance Ops-engineers to determine to importance of the Azure resources and take the necessary steps.

# 6. Monitor with Azure security center
One way of monitoring the security of your Azure resources is with Azure security center. It continuously checks all your Azure resources and will come up with a secure score, recommendations, alerts and possible measures. It's a costly feature but if security is a top priority for your organization then it can be very helpful. 

<figure><img src="/images/governance/security-center.png" /><figcaption style="font-style: italic; text-align: center;">Azure Security Center</figcaption></figure>

## Alerts
bla

<!-- Failed brute force attacks were detected from the following attackers: ["IP Address: 0.0.0.0"]. Attackers were trying to access the host with the following user names: ["(unknown user)","admin","logout","cisco","root","user","install","guest","anonymous","support","ftp","test","john"]. -->

# 7. Automate your work with Azure Automation
One helpful tool to apply governance measures at scale can be Azure Automation. It can help in several scenario's ranging from adding tags to all Azure resources to fixing security center findings like outdated VM's for instance. 

# 8. Tag your resources to get insights
Tagging resources can help to identify important properties of Azure resources. Its often used as a type of documentation for Azure resources. Most of the time a tag is correlated to either: accountability, costs or reliability, but other categories can be useful aswell. With accountability tags we often try to answer questions like: Who created this resource? Who should we contact if anything happens? Which business unit is accountable? And additionally some tracability. For costs related tags we often try to answer questions like: Who is paying for the resource? Which budget does it relate to? And lastly with reliability tags we answers questions like: What is the expected uptime? Is this resource business critical? What needs to happen when a disaster happens?

You can use the template below as a starting point ([copied from Microsoft](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/naming-and-tagging])).

<table><tr><th>Accountability</th><th>Costs</th><th>Reliablity</th></tr><tr><td>Start date of the project</td><td>Budget required/approved</td><td>Disaster recovery</td></tr><tr><td>End date of the project</td><td>Cost center</td><td>Service class</td></tr><tr><td>Application name</td><td>Environment deployment</td><td></td></tr><tr><td>Approver name</td><td></td><td></td></tr><tr><td>Requester name</td><td></td><td></td></tr><tr><td>Owner name</td><td></td><td></td></tr><tr><td>Business unit</td><td></td><td></td></tr></table>

# 9. Lock your viable resources
A quick win for organizations who start to implement the governance framework is to enable locking. With locking you can prevent developers or ops-engineers to accidently remove or edit Azure resources. This can be very helpful in securing critical production workloads. Within Azure there are 2 types of locks, namely: CanNotDelete and ReadOnly.

## CanNotDelete
CanNotDelete means that an authorized user is still able to read and modify the resource. However the user is not able to delete the resource without explicitly removing the lock first.

## ReadOnly
ReadOnly means that an authorized user is able to read the resource but is not able to change or delete the resource. Effectively it restricts all users even admins to the Reader role.

## To conclude
In my opinion resource locking is not something organizations have to implement in an ideal situation. When production workloads are separated in production subscriptions, and when RBAC is implement correctly then the need for Locking resources is minimal. However when organizations are in the beginning of applying this or any governance framework it can be a helpful instrument to prevent mistakes or to ensure business continuity.

<!-- ### An example of locking a App Service via ARM
```json
{
    "type": "Microsoft.Web/sites/providers/locks",
    "apiVersion": "2016-09-01",
    "name": "[concat(variables('siteName'), '/Microsoft.Authorization/siteLock')]",
    "dependsOn": [
        "[resourceId('Microsoft.Web/sites', variables('siteName'))]"
    ],
    "properties": {
        "level": "CanNotDelete",
        "notes": "Site should not be deleted."
    }
}
``` -->

# Further reading

<table><tr><th>Topic</th><th>Resource</th></tr><tr><td>Azure Accounts / Enterprise agreement</td><td>https://docs.microsoft.com/azure/azure-resource-manager/resourcemanager-subscription-governance</td></tr><tr><td>Naming conventions</td><td>https://docs.microsoft.com/azure/guidance/guidance-naming-conventions</td></tr><tr><td>Azure Blueprints</td><td>https://docs.microsoft.com/en-us/azure/governance/blueprints/overview</td></tr><tr><td>Azure policies</td><td>https://docs.microsoft.com/en-us/azure/governance/policy/overview</td></tr><tr><td>Resource tags</td><td>https://docs.microsoft.com/azure/azure-resource-manager/resourcegroup-using-tags</td></tr><tr><td>Resource groups</td><td>https://docs.microsoft.com/azure/azure-resource-manager/resourcegroup-overview</td></tr><tr><td>RBAC</td><td>https://docs.microsoft.com/azure/active-directory/role-based-accesscontrol-what-is</td></tr><tr><td>Azure locks</td><td>https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-lock-resources</td></tr><tr><td>Azure Automation</td><td>https://docs.microsoft.com/azure/automation/automation-intro</td></tr><tr><td>Security Center</td><td>https://docs.microsoft.com/azure/security-center/security-center-intro</td></tr></table>

## References
A big inspiration for this blog comes from this article.
https://novacontext.com/azure-strategy-and-implementation
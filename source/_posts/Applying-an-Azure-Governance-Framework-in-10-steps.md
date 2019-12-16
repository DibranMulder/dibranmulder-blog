---
title: Applying an Azure Governance Framework in 10 steps
date: 2019-12-06 16:17:55
tags:
---

<img src="/images/governance/framework.png" />

Every year RightScale, now Flexera, holds a survey to measure the current cloud challenges. This year just like in previous years Mananing cloud spend and applying governance were the top challenges companies face. This blogpost is to manage the governance challange. It provides a simple but yet effective framework to apply cloud governance into your business.

# 1. Get a grip on your subscriptions
<img style="width: 400px;" src="/images/governance/subscriptions.png" />
It all starts with your Azure subscriptions. When creating an Azure tetant there are 4 ways of creating it. 
If you choose to create one via Microsoft then you have 2 options, either the Pay-As-You-Go account type or an Enterprise Agreement.
If your organisation it not a small or medium business then you will probably need an Enterprise Argreement. It offers you a way to easily create multiple subscriptions and create them accordingly to for instance your business value domains.

The alternative is to choose either a direct on indirect Microsoft partner. These are so called Cloud Solution Providers. The CSP's will get a kick back fee for your Azure consumption making it a interesting option for them to help you with your Azure needs. In return Microsoft expects that CSP's will give a first line of support to their customers.

<img style="width: 400px;" src="/images/governance/dta-prod.png" />
It's also wise to always create a separate production subscription or dependant on the size of your value domains also separate dev, test and acceptance subscriptions. For security and governance reasons later described in the Role based Access Control section, it is wise to separate production from dta. 

## To conclude
Basically the rules of thumb are:
1. Only if your a really small company or start-up use a Pay-As-You-Go subscription.
2. Use CSP subscriptions if you need a 3rd party to help you with 1st line of support questions.
3. Use an Enterprise Agreement if your reasonable in size and want to negotiate with Microsoft regarding Azure prices.

Secondly,
1. Create multiple subscriptions for different value domains within your company.
2. Create separate subscriptions for dev, test, acceptance and production workloads.

For a detailed overview of Enterprise Agreement, CSP and Pay-As-You-Go subscriptions please visit [this blog](https://medium.com/@vunvulear/different-ways-of-buying-azure-services-pay-as-you-go-ea-direct-csp-indirect-csp-a563aa8cd89d).

# 2. Apply structure with Naming conventions
It sounds evident but its certainly not. Applying **transparent** and **clear** naming conventions is often forgotten or poorly implemented. Especially when there is no central organ within an organization that sees to it that the conventions are correctly applied. The importance of naming conventions can't be over estimated. Without them Azure subscriptions quickly become a mess of unrelated, unregulatable resources. 

Its very important that the naming conventions are consistent throughout the various subscriptions.
Often Infrastructure as Code (IAC) code, such as ARM templates or Azure CLI commands, is parameterized based on the these conventions.
Its helps to **reuse code** and make **fewer mistakes**.

A naming convention is often a composition of properties that describe the Azure resource.
One composition that I often use is the following:

```
env-company-businessunit-application-resourcetype-region-suffix
```

Its made up out of several critical properties, some that are also used within some naming conventions proposed by [the Microsoft documentation](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/naming-and-tagging).

<table> <tr><th>Property</th><th>Example</th><th>Abbreviation</th></tr><tr><td>Environment</td><td>Production</td><td>p</td></tr><tr><td>Company</td><td>Cloud Republic B.V.</td><td>clr</td></tr><tr><td>Business unit</td><td>Development</td><td>dev</td></tr><tr><td>Application</td><td>Customer Portal</td><td>csp</td></tr><tr><td>Resource type</td><td>Resource Group</td><td>rg</td></tr><tr><td>Region</td><td>West Europe</td><td>weu</td></tr><tr><td>Suffix</td><td>001</td><td>001</td></tr></table>

**Resulting in this name**:
```
p-clr-dev-csp-rg-weu-001
```

Applying the same naming conventions throughout the whole organisation can be very usefull. Organisations often endup building tooling to automate development processes and workflows. Without a consistent and clear naming convention this can be very hard. Secondly having a consistent and clear naming convention can help to reduce security issues. For Ops-people it has to be clip and clear if the resource is a production one and if its vital to the organisation. With the right naming its easier to categorize resources.

## Some generic tips for composing a naming convention
1. Start with the environment property because its often the only parameterized property. This reduces the need for string concatenation within IaC code.
2. Use 3 or 4 letter abbreviations consistently throught all properties.
3. Use the resource abbreviations [proposed by Microsoft](- https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/naming-and-tagging#recommended-resource-type-prefixes).
4. Add a suffix because it may occur that a resource name is locked for a significant amount of time when its deleted.
 - This happened to me once when I tried to recreate an Azure Service Bus. The name was locked for 2 days.
5. Use all lower cases characters, [there are some restrictions](https://docs.microsoft.com/en-us/azure/architecture/best-practices/resource-naming).
6. Don't use special characters, only alphanumeric characters. Hyphen (-) excluded.
7. Try to be unique
 - Some resource names, such as PaaS services with public endpoints or virtual machine DNS labels, have global scopes, which means that they must be unique across the entire Azure platform.

# 3. Take precautions with Blueprints / Policies
<figure>
  <img src="/images/governance/azure-gov.png" style="width:600px">
  <figcaption>Azure Governance Architecture. https://www.microsoft.com/en-us/us-partner-blog/2019/07/24/azure-governance/</figcaption>
</figure>

https://www.microsoft.com/en-us/us-partner-blog/2019/07/24/azure-governance/

# 4. Add security with Role based Access Control (RBAC)
<img style="width: 400px;" src="/images/governance/rbac-overview.png" />

https://docs.microsoft.com/en-us/azure/role-based-access-control/overview

Users
Groups
PIM

## Tips
1. Don't assign roles directly to users, preferably use groups.
2. Use the least access principle.
 - An user is provided the minimum privileges needed to accomplish the tasks they are authorized to perform.


Least access principle.

A recommended security practice in which every user is provided with only the minimum privileges needed to accomplish the tasks they are authorized to perform. This practice minimizes the number of Global Administrators and instead uses specific administrator roles for certain scenarios.
https://docs.microsoft.com/en-us/azure/active-directory/privileged-identity-management/pim-configure

# 5. Monitor with security center

# 6. Automate your work with Azure Automation.

# 7. Bring logic in the universe with Azure Resource Groups.

# 8. Tags you resources to get insights
Tagging resources can help to identify important properties of Azure resources. 

Most of the time I split them up into 3 categories, namely accountability, costs and reliability.

## Accountability
Basically answers: Who created this resource? Who should we contact if anything happends? Which business unit is accountable? And some tracability.
- Start date of the project
- End date of the project
- Application name
- Approver name
- Requester name
- Owner name
- Business unit

## Costs
Basically answers: Who is paying for the resource? Which budget does it relate to?
- Budget required/approved
- Cost center	
- Environment deployment 

## Reliablity
Basically answers: What is the expected uptime? Is this resource business critical? What needs to happends when a disaster happends?
- Disaster recovery
- Service class

# 9. Lock your viable resources

## Further reading

<table><tr><th>Topic</th><th>Resource</th></tr><tr><td>Azure Accounts / Enterprise agreement</td><td>https://docs.microsoft.com/azure/azure-resource-manager/resourcemanager-subscription-governance</td></tr><tr><td>Naming conventions</td><td>https://docs.microsoft.com/azure/guidance/guidance-naming-conventions</td></tr><tr><td>Azure Blueprints</td><td>https://docs.microsoft.com/en-us/azure/governance/blueprints/overview</td></tr><tr><td>Azure policies</td><td>https://docs.microsoft.com/en-us/azure/governance/policy/overview</td></tr><tr><td>Resource tags</td><td>https://docs.microsoft.com/azure/azure-resource-manager/resourcegroup-using-tags</td></tr><tr><td>Resource groups</td><td>https://docs.microsoft.com/azure/azure-resource-manager/resourcegroup-overview</td></tr><tr><td>RBAC</td><td>https://docs.microsoft.com/azure/active-directory/role-based-accesscontrol-what-is</td></tr><tr><td>Azure locks</td><td>https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-lock-resources</td></tr><tr><td>Azure Automation</td><td>https://docs.microsoft.com/azure/automation/automation-intro</td></tr><tr><td>Security Center</td><td>https://docs.microsoft.com/azure/security-center/security-center-intro</td></tr></table>

## References
A big inspiration for this blog comes from this article.
https://novacontext.com/azure-strategy-and-implementation
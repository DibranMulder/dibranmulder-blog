---
title: Bedrijfskritische applicaties in de cloud
tags: 'cloud, resilient, availability, zone'
date: 2018-06-22 09:12:39
---

Bedrijfskritische applicaties bouwen op een cloud platform als Microsoft Azure is nog niet zo makkelijk als het lijkt. De keuzes die developers en architecten maken kunnen enorme impact hebben op de continuiteit van uw business. 

# Storingen
Elke Cloud dienst heeft te maken met storingen. Deze storingen kunnen voorkomen door hardware falen of door softwarematige storingen. In beide gevallen heeft dit direct impact op de continuiteit van de applicaties die u heeft draaien in de betreffende regio.

> Storingen van Cloud diensten kun je vaak terug vinden op hun status pagina's. 
> https://azure.microsoft.com/status
> https://status.aws.amazon.com/

Deze storingen zijn jammer genoeg niet te voorkomen en hier hadden we vroeger ook al last van met onze eigen Virtual Private Services of Dedicated Rack Space. Maar wat nu als uw applicatie echt kritisch is? Hoe kunt u uw applicatie zo ontwerpen dat er sprake is van maximale availability and resilence?

# Azure Regions en Availability Zones
<img src="/images/azure regions.png" />
Azure heeft momenteel [40 regio's](https://azure.microsoft.com/en-us/global-infrastructure/regions/) beschikbaar en er zijn er 12 aangekondigd, waaronder de meest recent aangekondigde Norway East en Norway West.

Veel mensen denken dat een Azure regio gelijk staat aan 1 datacenter maar dit is zeker niet het geval. In feite zijn het een set van datacenters die samen een regio vormen. Sommige regio's zoals France central bevatten al 3 datacenters die fysiek meerdere kilometers van elkaar gescheiden zijn. Deze datacenters hebben allemaal een eigen elektriciteits- en wateraansluiting en overige voorzieningen waardoor een failure van 1 datacenter niet direct betekent dat de regio unavailable wordt.

Maar hoe weet je nou welke applicaties van jou draaien in welke datacenters? Microsoft heeft dat met opzet geabstraheerd voor zijn gebruikers. Het is de bedoeling dat meer regio's meer dan 3 datacenters krijgen waardoor ze automatisch een [availability zone](https://docs.microsoft.com/en-us/azure/availability-zones/az-overview) worden. Momenteel hebben alleen Central US en France Central support voor Availability zones en zijn er nog 3 in preview.

* Central US
* France Central
* East US 2 (Preview)
* West Europe (Preview)
* Southeast Asia (Preview)

## Availability zone
<img src="/images/azure-regional-architecture.png" />
Er is sprake van een availability zone als een Azure regio meerdere fysiek gescheiden datacenters heeft. Zoals eerder gezegd hebben deze datacenters een eigen elektriciteits-, cooling- en netwerkvoorziening. Maar wat houdt zo'n availability zone nu in, en wat heb je eraan?

Availability zones bieden een abstractie voor een set van diensten binnen Azure. Uw diensten worden, mits gebruikmakend van availability zones, automatisch gerepliceerd over de verschillende zones binnen de Azure regio. Wanneer er een storing optreedt in één van de datacenters dan wordt die betreffende zone uitgeschakeld en nemen de overige het werk over.

### Services
Availability zones zijn nog niet beschikbaar voor alle services binnen Azure. Gelukkig groeit de lijst wel, sterker nog deze is [support voor Service Bus aangekondigd](https://azure.microsoft.com/nl-nl/blog/azure-service-bus-is-now-offering-support-for-availability-zones-in-preview/) en daarmee is weer een belangrijke service ondersteund. Dit is een lijst van de beschikbare services:

* Linux Virtual Machines
* Windows Virtual Machines
* Virtual Machine Scale Sets
* Managed Disks
* Load Balancer
* Public IP address
* Zone-redundant storage
* SQL Database
* Event Hubs
* Service Bus

> Services op availability zones hebben geen additionele kosten.

## Voorbeeld
Het aanzetten van availability zones op services is zo simpel als een vinkje aanzetten bij het aanmaken van de resource. Via ARM kan het gemakkelijk met de `zoneRedundant` property.

```JSON
"resources": [
    {
        "apiVersion": "2018-01-01-preview",
        "name": "[parameters('serviceBusNamespaceName')]",
        "type": "Microsoft.ServiceBus/namespaces",
        "location": "[parameters('location')]",
        "sku": {
            "name": "Premium"
        },
        "properties": {
            "zoneRedundant": true
        }
    }
],
```
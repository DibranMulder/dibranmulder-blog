---
title: Bedrijfskritische applicaties in de cloud
tags: cloud, resilient, availability
---
Bedrijfskritische applicaties bouwen op een cloud platform als Microsoft Azure is nog niet zo makkelijk als het lijkt. De keuzes die developers en architecten maken kunnen enorme impact hebben op de continuiteit van uw business. 

# Storing
Elke Cloud dienst heeft te maken met storingen. Deze storingen kunnen voorkomen door hardware falen of door softwarematige storingen. In beide gevallen heeft dit direct impact op de applicaties die u heeft draaien in de betreffende regio.

> Storingen van Cloud diensten kun je vaak terug vinden op hun > > status pagina's. 
> https://azure.microsoft.com/status
> https://status.aws.amazon.com/

Deze storingen zijn jammer genoeg niet te voorkomen en hier hadden we vroeger ook al last van met onze eigen Virtual Private Services of Dedicated Rack Space. Maar wat nu als uw applicatie echt kritisch is? Hoe kunt u uw applicatie zo ontwerpen dat er sprake is van maximale availability and resilence?

# Azure Regions en Availability Zones
<img src="/images/azure regions.png" style="height: 200px;" />
Azure heeft momenteel 40 regio's beschikbaar en er zijn er 12 aangekondig, waaronder de meest recent aangekondige Norway East en Norway West.

Veel mensen denken dat een Azure regio gelijk staat aan 1 datacenter maar dit is zeker niet het geval. In feite zijn het een set van datacenters die samen een regio vormen. Sommige regio's zoals France central bevatten al 3 datacenters die fysiek meerdere kilometers van elkaar gescheiden zijn. Deze datacenters hebben allemaal een eigen elektriciteits- en wateraansluiting en overige voorzieningen waardoor een failure van 1 datacenter niet direct betekent dat de regio unavailable wordt.

Maar hoe weet je nou welke applicaties van jou draaien in welke datacenters? Microsoft heeft dat met opzet geabstraheerd voor zijn gebruikers. Het is de bedoeling dat meer regio's meer dan 3 datacenters krijgen waardoor ze automatisch een availability zone worden.

## Availability zone
Oke een regio heeft minstens 3 datacenters en dan is het een availability zone, hoe helpt dat de availability en resilence van mijn applicaties?

Microsoft heeft een availability zone abstractie gemaakt voor verschillende diensten binnen Azure. Zo wordt uw service of data automatisch gerepliceerd over de zones waardoor u een hogere availability krijgt. Jammer genoeg is deze feature nog niet beschikbaar voor alle services binnen Azure maar de lijst groeit gelukkig wel.

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

dergelijke. Zo probeert Microsoft de maximale  


Deze week werd aangekondigd dat er in Europa weer 2 Azure regio's bijkomen, namelijk: Norway East en Norway West. Azure regio's staan niet gelijk aan 1 datacenter maar 

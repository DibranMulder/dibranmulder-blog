---
title: Autonoom rijden
tags:
- Self driving cars
- Autonoom rijden
- Tesla
---
_Dibran over Artificial Intelligence_.
Dit is de eerste blog in de serie: “Dibran over Artificial Intelligence”, een serie blogs waarin ik dieper in ga op de hedendaagse mogelijkheden en toepassingen van artificial intelligence (kunstmatige intelligentie). Omdat het taalgebruik in het software- en artificial intelligencevakgebied doorgaans Engels is zal ik in mijn blogs ook de Engelse benamingen gebruiken.

## Wat is autonoom rijden?
We horen in de media veel over autonoom rijden, bijna alle autofabrikanten zijn er mee bezig maar hoe ver zijn ze eigenlijk? En wanneer kunnen we echt slapend op de achterbank naar ons werk rijden? Hoe werkt het eigenlijk? In deze blogpost geef ik antwoord op deze vragen.

Autonoom rijden is opgedeeld in 5 levels(niveaus). Van geheel handmatig rijden tot volledig automatisch. Er is nog geen enkele auto in de wereld, ook geen test auto’s, die al level 5 hebben gehaald. Dit komt omdat een level 5 auto overal ter wereld zelfstandig moet kunnen rijden, dus van hartje Amsterdam tot de wegen in Afrika. Daarnaast moet het ook om kunnen gaan met allerlei omstandigheden, zoals: sneeuw, extreme regenval, wegwerkzaamheden, etc.

<img src="/images/selfdriving/levels.png" />

### Autonoom rijden in de praktijk
De meeste toepassingen van autonoom rijden die we vandaag de dag zien zijn op level 2 of 3 niveau. Vaak wordt de combinatie van een ‘x’ aantal functies omgedoopt tot een nieuwe term als “autopilot” of iets vergelijkbaars. In de praktijk is het eigenlijk een combinatie van ingeschakelde functies waardoor de auto in sommige omstandigheden zelfstandig kan rijden. Omdat Tesla de meeste informatie deelt en ook het meest ver is met haar implementatie neem ik Tesla als voorbeeld. De autopilot van Tesla is momenteel een combinatie van de volgende functies: Traffic-Aware Cruise Control, Autosteer, Auto Lane Change, Side Collision Warning, Automatic Emergency Braking. Daarnaast omvat het ook nog overige functies zoals AutoPark en Summon.

De autopilot staat niet standaard aan wanneer de auto wordt gestart. De bestuurder kan op een snelweg de autopilot aanzetten, ook wel ‘engage’ genoemd. De auto zal dan op basis van het niveau van zelfrijden automatisch afstand houden met de voorganger en automatisch sturen. Sommige zelfrijdende auto’s kunnen ook zelf inhalen wanneer de bestuurder het knipperlicht aanzet.

Wanneer de auto de situatie niet meer kan inschatten zal het de besturing teruggeven aan de gebruiker. Dit gebeurt ook wanneer de gebruiker zelf gaat sturen of wanneer het op de rem trapt. Dit moment noemen we ‘disengage’. Disengage momenten zijn belangrijk om van te leren vooral wanneer de bestuurder de controle overneemt over het voertuig. Veel autofabrikanten zullen de data van de sensoren bewaren om disengage momenten later te evalueren.

Momenteel is het zo dat de bestuurder moet opletten wanneer autopilot is ingeschakeld. De bestuurder moet zelfs het stuur af en toe vasthouden om aan te geven dat het nog oplet. Wanneer de bestuurder dit signaal negeert zal de auto hem waarschuwen, door flitsende meldingen en geluidsindicaties. Als de gebruiker weigert om het stuur vast te houden dan wordt disengage geforceerd en is autopilot voor de rest van de rit uitgeschakeld.

Vooralsnog zijn er weinig autofabrikanten die een auto met autopilot of vergelijkbare functionaliteit bieden. Het hogere segment van de auto’s van Volvo, Audi en Volkswagen hebben vaak wel een uitgebreide suite aan functies die op level 2 niveau zitten. Bijvoorbeeld adaptive cruise control en soms zelfs lane keeping. Echter er zijn weinig auto’s op de markt die dit combineren in een zelfrijdende modus.

## Hoe werkt autonoom rijden?
Een mens gebruikt zijn cognitieve zintuigen om een auto te besturen. Vanzelfsprekend is het gezichtsvermogen het belangrijkste zintuig voor het besturen van een auto. Met ons zicht zijn wij in staat om te bepalen hoe de weg loopt, diepte in te schatten en gevaren te herkennen. Met ons zicht, gehoor en tast verzamelen wij doorgaans genoeg informatie om een veilige autoreis te maken.

<img src="/images/selfdriving/auto sight.png" />
 
Toch is de mens niet perfect, los van domme beslissen is ons gezichtsveld namelijk vrij beperkt. Met spiegels hebben we dit gedeeltelijk opgelost, echter het is voor ons onmogelijk om telkens alle informatie te verzamelen. We kunnen maar 1 van de 4 gezichtsvelden tot ons nemen. Door periodiek alle informatiekanalen af te scannen krijgen we toch een vrij compleet beeld van onze omgeving.

Bij een autonome auto gaat het in essentie hetzelfde. Een auto wordt verrijkt met tal van sensoren waarmee genoeg informatie verzameld wordt om de omgeving van de auto in kaart te brengen. Deze ruwe data wordt ter plekke, in de auto, verwerkt door machine learning software. Dit levert een soort van kunstmatige menselijke intelligentie ervaring op die we doorgaans artificial intelligence noemen.

### Sensoren
Je hebt meerdere sensoren nodig om een auto autonoom te laten rijden. Niet alle fabrikanten gebruiken dezelfde sensoren, wat dit onderwerp an sich al tot een interessant onderwerp van discussie maakt. Het doel van de sensoren is om onder alle omstandigheden een juiste representatie te kunnen maken van de omgeving van de auto. Dit betekent dat de sensoren moeten kunnen werken, in het donker, in sneeuw, hevige regenval, felle zonneschijn, etc.

<img src="/images/selfdriving/sensorscar.png" />
 
Alle huidige toepassingen van autonoom rijdende auto’s maken gebruik van camera’s. In het geval van Tesla zitten er 8 camera’s in een auto. Deze camera’s hebben gezamenlijk een 360° beeld rondom de auto. Afhankelijk van de kijkrichting is het een camera van hogere kwaliteit waardoor het verder weg ook scherp kan zien.

Naast camera’s zien we nog meer sensoren die gebruikt worden. In het geval van Tesla worden ook nog radar en ultrasonics gebruikt. Met een radar kunnen objecten in de ruimte voor de auto gedetecteerd worden. Het mooie aan een radar sensor is dat het door fysieke objecten heen kan meten. Als het bijvoorbeeld heel hard regent, of er is mist dan kan de radar toch detecteren of er objecten in de buurt zijn. Vaak zit de radar alleen aan de voorkant van de auto. We zien bij veel auto’s dat de voorkant van de auto de meeste sensoren heeft, logisch aangezien daar de meest belangrijke informatie vandaan komt.

Ultrasonics kennen we van de parkeersensoren in onze huidige auto’s. Het is voor camera’s vrij moeilijk te detecteren of er een object naast de auto staat als hij heel dicht naast de auto staat. In het geval van Tesla zitten er 12 ultrasonics in de auto waarmee objecten in de nabije omgeving van de auto ook gedetecteerd kunnen worden.

> “Lidar vs Vision”

Een verhitte discussie onder onderzoekers en ontwikkelaars van zelfrijdende auto’s is het gebruik van Lidar. Lidar is in wezen een soort van radar sensor die werkt op basis van laserstralen. Vaak zien we dit soort sensors boven op een dak van een auto, de sensor draait razendsnel rond en schiet allemaal laserstraaltjes af. De weerkaatsing van de laserstraaltjes wordt opgevangen door de sensor en de software kan hiermee een gedetailleerde representatie maken van de omgeving. Een belangrijk voordeel van de sensor is dat er een 360° 3D kaart van de omgeving mee gemaakt kan worden. In tegenstelling tot Radar die slechts een 3D kaart van de voorkant van de auto maakt. Belangrijke nadelen die worden genoemd zijn: 
- Het is een dure sensor is om te maken.
- Er gaat informatie verloren die je met beeldherkenning wel zou kunnen interpreteren.

Lidar zou bijvoorbeeld een verkeersbord kunnen detecteren. Maar de betekenis van het bord zou het niet kunnen bepalen. Daarnaast kan lidar moeilijker gebruikt worden voor object herkenning. Stel er vliegt een plastic tas voorbij op de snelweg. Is dat een plastic tas of een kapotte autoband? Met lidar heb je niet genoeg informatie op dit te achterhalen.
- Objecten achter objecten worden niet herkent.

Lidar gebruikt laser signalen in het visuele spectrum. Hierdoor is het supersnel en super accuraat. Echter heeft dit ook als gevolg dat het niet objecten achter objecten kan herkennen. Een radarsensor kan dit wel, doordat het een veel lagere frequentie gebruikt waardoor de sensor de auto voor de auto waar je achter rijdt ook kan detecteren.

Onlangs is er in de “Lidar vs Vision” discussie nog wat kolen op het vuur gegooid door Elon Musk, CEO van Tesla. Hij claimde het volgende: “Lidar is a crutch” en “Anyone relying on Lidar is doomed”. Een gedurfde uitlating, echter een uitlating die later grondig is onderbouwt door Tesla in de Autonomy days Videos.

Er is volgens Tesla namelijk geen reden waarom je met “vision technology” (de camera sensors) geen diepte zou kunnen bepalen en daarmee een 3D kaart van de omgeving kan maken. De mens doet in feite precies hetzelfde met zijn ogen. Wanneer 2 camera’s hetzelfde beeld vangen kan er op basis van stereo vision techniek diepte worden gemeten. Bij ons vindt de diepte bepaling plaats in het brein maar bij camera’s en computers kunnen we algoritmes implementeren die exact hetzelfde doen.

<img src="/images/selfdriving/eyes.png" />

Lidar lijkt dus een overbodige sensor te zijn, echter momenteel is het wel de meest accurate sensor om een 3D representatie van de omgeving te krijgen. De verwachtingen zijn echter dat vision in combinatie met radar het op lange termijn gaat winnen.
> “People don’t drive with lasers in their forehead.”
## Software
Alle output van de sensoren in een auto genereren een enorme stroom aan data. Uit deze stroom van data moet alle informatie gehaald worden om de auto veilig over de weg te laten rijden. Hiervoor heb je software nodig. Logica die van camera beelden, ultrasonic en radarsignalen een representatie kan maken van de wereld en op basis van die representatie de juiste beslissingen kan maken. Maar hoe schrijf je ooit een programma dat alle scenario’s omvat? Als je dit leest en niet kan programmeren vergelijk het dan met het maken van een flowchart. Hoe kan je een alomvattend flowchart maken die in 99.999% van de gevallen de juiste beslissing neemt? Dat is praktisch onmogelijk. 
### Van data naar een representatie van de wereld
Hoe kom je van ruwe camera beelden, ultrasonic en radar gegevens tot een goede representatie van de wereld? Belangrijk is om alle informatie uit de verschillende kanalen te combineren tot één werkelijkheid. Camera’s hebben vaak een overlappend beeld waardoor herkenning van objecten elkaar kunnen bevestigen of juist een error van 1 sensor kunnen voorkomen. Hetzelfde geldt voor radar en ultrasonic gegevens. Objecten die door de camera worden herkend dienen ook door de radar gezien te worden, zo kan het systeem met meer zekerheid zeggen of een object echt aanwezig is.

Het systeem combineert alle informatie van de sensoren en rekent het om naar een universeel lokaal coördinatensysteem. De software kan dan met alle gegevens de juiste beslissing gaan nemen. Hoe dat plaats vindt leg ik later uit.

Een ander belangrijk gegeven is dat de verwerking van alle data lokaal in de auto plaatsvindt. Het is namelijk praktisch onmogelijk om alle data te versturen naar de cloud om daar de verwerking van de gegevens te laten plaatsvinden. Dit komt omdat het simpelweg te veel data is die in te korte tijd verwerkt moet zijn. 8 camera’s, 12 ultrasonic en een radarsensor genereren gezamenlijk makkelijk 100Mbps. Dat is te veel data om realtime over-the-air te sturen naar een datacenter en te wachten op het antwoord. Daarbij opgeteld is de latency naar een datacenter vaak al 20ms. Hoe sneller een auto een beslissing kan nemen hoe veiliger de situatie wordt. Stel dat er ineens een kind de weg oversteekt, dan wil je dat de auto supersnel reageert. 

<img src="/images/selfdriving/Data car.png" />

### Objectherkenning uit camera beelden
We weten dus dat de beelden van de camera’s in de auto verwerkt moeten worden. Maar hoe kan dat zonder dat de auto een supercomputer is. Hier komt een belangrijke techniek in de artificial intelligence wereld om de hoek kijken, namelijk: neural networks. Een neural network (neuraal netwerk) is een techniek die het menselijk brein simuleert. Het menselijk brein bestaat namelijk uit netwerk van miljoenen neuronen. Deze neuronen krijgen constant prikkels van andere neuronen en conditioneel geven ze het signaal door aan de neuronen die vastzitten aan het betreffende neuron. Over tijd heeft het neuron geleerd of een bepaalt input signaal doorgegeven moet worden aan een volgend neuron. Zo herkennen wij situaties, beelden en geluid. 

<img src="/images/selfdriving/neural networks.png" />

Bij artificial neural networks werkt het in feite hetzelfde. Het leren, wat bij een mens automatisch gaat, is echter een complex proces waar veel data voor nodig is. Dit leer proces bij neural networks heet backpropagation. Wat er gebeurt is dat het neural network een afbeelding wordt getoond met daarbij de oplossing. Backpropagation is een algoritme waarbij de connecties tussen de neuronen zodanig worden aangepast dat bij de volgende keer dat dezelfde afbeelding als input wordt gegeven aan het neural network, de kans hoger is dat het gegeven antwoord als output eruit komt. Bij dit proces is het belangrijk dat niet telkens dezelfde afbeelding als trainingsdata aan het neural network wordt gevoed. Een gevarieerde dataset levert altijd veel betere resultaten op. In het geval van zelfrijdende auto’s is het dus superbelangrijk om afbeeldingen van objecten (auto’s, fietsers, wandelaars, etc) te hebben in de sneeuw, regen, nacht en felle zon. Zodoende zal het neural network beter de juiste waarde tussen de connecties kunnen leggen om tot de juiste output te komen.

Je kunt je misschien voorstellen dat het herkennen van objecten nog lang niet genoeg is om een auto zelf te laten rijden. Stel je kunt auto’s, fietsers, voetgangers, brommers, vrachtwagens, etc detecteren dan nog is hun gedrag vrij moeilijk te voorspellen. Toch wordt hier dezelfde techniek voor gebruikt alleen dan in een ander neural network. Onze hersenen doen eigenlijk hetzelfde. De visuele cortex is het gedeelte van het brein dat de input van het netvlies omzet naar beelden, wat wij met die beelden doen is aan een ander gedeelte in het brein overgelaten. Zet het ons aan tot beweging, emotie of iets anders? Bij zelfrijdende auto’s werkt dat ook zo. De output van het ene neural network is de input voor het volgende. Als we een auto hebben herkend dan is dat de input voor het “gevaren” neural network. Die gaat het gedrag van de auto voorspellen om zodoende te bepalen of de auto nog op een veilige tour is. Dit neural network leert precies op dezelfde manier als het object herkennings neural network. Het systeem wordt gevoed met allerlei veilige en onveilige gedragingen van auto’s. Zo herkent het op de duur het veilige en onveilige gedrag van automobilisten en signaleert de juiste output voor het volgende neural network.

<img src="/images/selfdriving/tesla neural network.png" />

Om uiteindelijk van al die input bronnen tot een zelfrijdende auto te komen zijn er dus meerdere neurale netwerken nodig die in verbinding met elkaar staan. Tesla heeft op de Autonomy Day informatie gedeeld over hun neurale netwerken. Het is indrukwekkend om te zien wat voor landschap van neural networks en software er nodig is om een level 2-3 zelfrijdende auto te maken. Mijn verwachting is dat deze software nog factoren complexer gaat worden naarmate de auto richting level 4 en 5 self driving gaat. 
### Zelflerende software
Van artificial intelligence software wordt vaak geclaimd dat het zelflerend is. Dat het over tijd vanzelf beter wordt en dat dat soms een gevaar kan vormen voor de samenleving. Dat deze software niet vanzelf beter wordt werd wel duidelijk tijdens de presentaties op de Tesla Autonomy Day. Om de software telkens beter te maken en meer situaties te laten ondersteunen voert Tesla constant updates uit. Deze updates vinden over-the-air plaats. Dat wil zeggen dat Tesla op afstand updates kan doorvoeren om de zelfrijdende auto’s beter te maken. Andersom gebruiken ze de auto’s ook om data te verzamelen die nodig is om de neural networks te trainen met de juiste situaties. Dit proces noemt Tesla de data engine.

<img src="/images/selfdriving/dataengine.png" />

Het komt er kort op neer dat Tesla situaties identificeert die nog niet goed worden opgepakt door de software, inaccuracies genoemd. Denk bijvoorbeeld aan vuil op de weg, plastic zakken, banden, etc, of wat ik persoonlijk een mooi voorbeeld vind is een fiets achterop een fietsendrager van een auto. Je kunt je voorstellen dat de fiets geïdentificeerd wordt als verkeersdeelnemer. Het systeem kan op basis van deze foutieve herkenning hele rare beslissingen nemen. Het systeem heeft namelijk geleerd dat het voorzichtig om moet gaan met fietsers. Wat Tesla dan doet in zo’n geval is dat ze de fleet van auto’s vragen om vergelijkbare situaties op te sturen naar hun datacenters.

Alle auto’s van Tesla, met de full self driving setup, hebben een lokale opslag van data. Hierin worden momenten opgeslagen waarin de software geen goede beslissing kon nemen of wanneer de bestuurder ingreep. De gehele output van alle sensoren wordt opgeslagen samen met de output van de software, dit worden ook wel clips genoemd. Wanneer de ontwikkelaars bij Tesla een inaccuracy willen oplossen query-en ze de fleet naar vergelijkbare situaties, ook hier worden neural networks toegepast om vergelijkbare situaties ten opzichte van de inaccuracy situatie te vinden. Alle resultaten worden over-the-air naar de datacenters van Tesla gestuurd. Wat er dan gebeurt is dat mensen handmatig of semi geautomatiseerd de situaties gaan labelen. Ze gaan dus bij de camera streams aangegeven waar de fiets zich bevindt achterop de auto. Met deze gelabelde data gaan ze de juiste neural networks trainen met het eerdergenoemde backpropagation algoritme. Wat er dus gebeurt is dat de connecties tussen de neuronen zodanig worden aangepast dat een fietser niet als object herkend wordt wanneer de fiets achterop een auto is vastgemaakt.

Een belangrijk concept wat Tesla hanteert is shadow mode. Het verbeterde neural network wordt eerst in shadow mode gedraaid in de auto’s. Pas wanneer uit de analyses blijkt dat het nieuwe neural network beter presteert dan de voorgaande, dan pas gaan ze over op de nieuwe versie. Het kan dus zijn dat jouw Tesla terwijl je aan het rijden bent een test versie van een neural network naast je actieve neural network draait. Je merkt hier helemaal niets van.

<img src="/images/selfdriving/summary.png" />
 
Voor Tesla zijn er 3 factoren die het verschil maken om als eerste een zelfrijdende auto te leveren. Het is superbelangrijk dat er een grote gevarieerde data set opgebouwd wordt. In het geval van Tesla wordt deze dataset opgebouwd door data te verzamelen van alle auto’s die de volledige hardware setup hebben voor full self driving. Daarnaast is het belangrijk dat Tesla de fleet van auto’s kan vragen om data van vergelijkbare situaties op te leveren. Het is praktisch onmogelijk om alle data van de auto’s op te sturen naar de servers van Tesla. In plaats daarvan hebben ze een vindingrijke oplossing gevonden waarin ze de auto’s gebruiken als data buffer die ze ondemand kunnen bevragen. Als laatst is shadow mode een hele belangrijke feature. Dit is Tesla’s manier om te testen of de nieuwe software beter presteert dan de oude. Omdat de software een combinatie is van meerdere neurale netwerken is het moeilijk te testen met klassieke test routines. Uiteraard doen ze dat wel maar de praktijk moet leren of de nieuwe versie beter is dan de vorige.

## Hardware
Het verwerken van alle data in de neural networks vereist nogal wat van de hardware specificaties van de computer in de auto. Het evalueren van data in een neural network levert enorm veel mathematische berekeningen op. Het is namelijk zo dat op basis van het input signaal er calculaties moeten plaatsvinden om te evalueren welk opvolgend neuron een signaal moet krijgen. Op basis van de waardes die aan de connecties tussen de neuronen hangen wordt het volgende neuron namelijk gesignaleerd. Je kunt je voorstellen dat er miljoenen operaties per seconde uitgevoerd moeten worden om van een input signaal naar een output te komen.

Uit het Bitcoin tijdperk hebben we geleerd dat grafische videokaarten erg goed zijn in het uitvoeren van mathematische berekeningen. Vergelijkbare operaties dienen namelijk ook te gebeuren in games. Hierin bewegen objecten zich ook in de ruimte en interacteren met elkaar. Het is dan ook geen verassing dat in de Tesla Hardware 2.0 en 2.5 NVidia GPU’s worden gebruikt om deze berekeningen uit te voeren. Wat we echter in het Bitcoin tijdperk ook hebben geleerd is dat chips met een dedicated ontwerp nog sneller kunnen zijn in het verwerken van deze data. Dit soort chips heten ASIC chips (application specific integrated circuit).

<img src="/images/selfdriving/chips.png" />
 
We kunnen stellen dat hoe flexibeler de chip is, hoe minder efficiënt hij is. Een grafische kaart van NVidia kan gebruikt worden in veel situaties. Ze zijn wel beperkt tot het verwerken van grafische/mathematische berekeningen maar je zou ze net zo goed kunnen inzetten voor games. Wat Tesla heeft gedaan is dat ze een eigen chip hebben ontworpen die puur en alleen bedoeld is voor de zelfrijdende auto. De neural networks kunnen hierdoor super efficiënt worden geëvalueerd door de hardware waardoor het wel tot 2100 frames van video signaal per seconde kan verwerken, dat is zo’n 250fps per camera. 
## Toekomst
De toekomst van zelfrijdende auto’s komt razendsnel op ons af. Tesla heeft een dominante positie en lijkt die de komende tijd nog niet te verliezen. Ze hebben by-far de grootste fleet met auto’s die actief gebruikt worden om het systeem beter te maken.

Zelfrijdende auto’s beloven niet alleen veiliger te zijn maar brengen ook nieuwe mogelijkheden met zich mee. Zo heeft Tesla al een nieuw concept aangekondigd namelijk RoboTaxi. Met RoboTaxi kunnen auto eigenaren hun auto toevoegen aan een soort van Uber fleet van auto’s. Eigenlijk is je auto dan een zelfrijdende taxi wanneer je hem niet gebruikt. Dit klinkt natuurlijk erg mooi maar de praktijk moet uitwijzen of dit haalbaar is.

Daarnaast hebben bedrijven als Tesla ook nog een grote uitdaging aangaande wetgeving en verzekeringen. Het zal nog een hele tijd duren voordat de juridische puzzel opgelost wordt wanneer er geen bestuurder aanwezig is in de auto.

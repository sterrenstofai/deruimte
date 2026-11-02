# Fase 1: datacheck heelal

Peildatum 2 november 2026. Testset van twintig hemellichamen. Scripts en ruwe uitkomsten staan in `datacheck/`. Er zijn geen foto's of geluiden in de repo bewaard.

## Kort

- **Uitrekenen waar iets aan de hemel staat kan helemaal in de browser, en het klopt.** astronomy-engine (MIT, 47 kB gezipt) wijkt voor de zon, de maan, alle planeten, Pluto, Io en Europa minder dan 0,3 boogminuut af van JPL Horizons. Dat is een honderdste van de breedte van de volle maan. Op- en ondergang komen op de minuut na overeen met Skyfield, een derde bron.
- **Het ISS ook,** met satellite.js (MIT) en de baangegevens (TLE) van wheretheiss.at, die CORS open heeft. Overgangstijden wijken 2 à 3 seconden af van Skyfield. CelesTrak was vanaf deze machine niet bereikbaar.
- **Vanavond (2 november, Enschede) is er weinig te zien:** alleen Saturnus met het blote oog, de hele avond in het zuidoosten. De maan, Mars en Jupiter komen pas rond middernacht op. Het ISS komt vijf keer over, maar steeds in de schaduw van de aarde, dus onzichtbaar. Dat is een goede test: de site moet ook "vanavond zie je weinig" kunnen zeggen.
- **Wikidata heeft alle twintig, met een Nederlandse naam en een Nederlandse Wikipedia.** De getallen kloppen met de NASA Planetary Fact Sheet, maar er zitten fouten en valkuilen in: de zwaartekracht op Io staat er 100 keer te klein in, de "afstand tot de aarde" is soms de kleinste, soms de grootste, en de Poolster heet in Wikidata "Polaris". Elk getal dat op de site komt moet je kiezen en nakijken.
- **Foto's:** elk hemellichaam heeft een afbeelding in Wikidata, maar niet elke afbeelding is een foto. Bij Betelgeuze is het een kaartje van het sterrenbeeld, bij de Poolster een collage met tekening. Bij sterren is een echte foto sowieso weinig meer dan een puntje. Commons blokkeert deze machine (ook upload.wikimedia.org grotendeels), dus de licenties per foto moeten via een GitHub Action.
- **Geluid:** de University of Iowa heeft echte plasmageluiden van Jupiter, Saturnus, de aarde en de zon onder CC BY 4.0. Echte opnames met een microfoon zijn er alleen van Mars (Perseverance). Het bekende "geluid van Titan" van ESA is een **labreconstructie**, geen opname. Voor de maan, Mercurius, Venus, de dwergplaneten, kometen en sterren is er niets bruikbaars.
- **Sterrenbeelden:** lijnen voor alle 88 bij Stellarium (CC BY-SA) en d3-celestial (BSD). Nederlandse namen bij Wikidata (86 van de 88 gevonden met mijn vraag).

Mijn advies staat onderaan.

## De testset

| Sleutel | Naam op de site | Wikidata | Soort |
|---|---|---|---|
| zon | de zon | Q525 | ster |
| maan | de maan | Q405 | maan |
| mercurius … neptunus | de acht planeten | Q308, Q313, Q2, Q111, Q319, Q193, Q324, Q332 | planeet |
| pluto, ceres | Pluto, Ceres | Q339, Q596 | dwergplaneet |
| io, europa, titan | Io, Europa, Titan | Q3123, Q3143, Q2565 | maan |
| halley | de komeet Halley | Q23054 | komeet |
| poolster, sirius, betelgeuze | de Poolster, Sirius, Betelgeuze | Q12980, Q3409, Q12124 | ster |
| iss | het ISS | Q25271 | ruimtestation |

De plek voor de proeven: Enschede, Oude Markt (52,2196 N, 6,8952 O, 40 m).

De Q-nummers zijn gevonden op het Engelse label, en bij meerdere items met hetzelfde label het item met de meeste Wikipedia's. Alle twintig klopten.

## Wikidata

Eén SPARQL-vraag voor alles werkt. De gewone Wikidata-API gaf direct 429, net als bij de vorige twee projecten.

**Wat er is:**

- Alle twintig hebben een Nederlandse naam, een Nederlandse beschrijving en een artikel op nl.wikipedia.
- Planeten en grote manen: massa, straal, dichtheid, zwaartekracht, omlooptijd en meestal temperatuur. Sterren: helderheid, afstand, massa, straal, spectraalklasse, sterrenbeeld en RA/Dec (Hipparcos-waarden; die heb ik gebruikt voor de posities).
- Van de 356 waarden voor de gemeten eigenschappen (zonder afbeeldingen en zonder de lange lijsten "kind-hemellichaam") hebben er 266 een bron, driekwart. Bij de manen het minst: Io 7 van 15, Titan 5 van 11.

**Naast de NASA Planetary Fact Sheet** (de standaardtabel van NASA):

| | massa (10²⁴ kg) WD / NASA | diameter (km) WD / NASA | zwaartekracht (m/s²) WD / NASA | omlooptijd (dagen) WD / NASA |
|---|---|---|---|---|
| Mercurius | 0,33 / 0,330 | 4878 / 4879 | 3,73 / 3,7 | 88,0 / 88,0 |
| Venus | 4,87 / 4,87 | 12 104 / 12 104 | 8,9 / 8,9 | 224,7 / 224,7 |
| de aarde | 5,97 / 5,97 | 12 742 / 12 756 | 9,80 / 9,8 | 365,26 / 365,2 |
| de maan | 0,0735 / 0,073 | 3476 / 3475 | 1,62 / 1,6 | 27,32 / 27,3 |
| Mars | 0,642 / 0,642 | – / 6792 | 3,71 / 3,7 | 687,0 / 687,0 |
| Jupiter | 1898 / 1898 | 142 984 / 142 984 | 23,1 / 23,1 | 4333 / 4331 |
| Saturnus | 568 / 568 | 120 536 / 120 536 | 8,96 / 9,0 | 10 758 / 10 747 |
| Uranus | 86,8 / 86,8 | 51 118 / 51 118 | 8,7 / 8,7 | 30 689 / 30 589 |
| Neptunus | 102,4 / 102 | 49 528 / 49 528 | 11 / 11,0 | 60 193 / 59 800 |
| Pluto | 0,0131 / 0,0130 | 2376 / 2376 | 0,62 / 0,7 | 90 553 / 90 560 |

De verschillen zijn klein en te verklaren (gemiddelde of evenaarsdiameter; siderische of tropische omloop). Wel opgevallen:

- **Io: zwaartekracht "1,796 centimeter per seconde²"**, zonder bron. Moet 1,796 meter zijn. Een fout van een factor 100 die niemand ziet tot hij op de site staat.
- **Mars: "temperatuur 37 °C"** is het maximum (met kwalificatie). Wie de eerste waarde neemt, zet op de site dat het op Mars 37 graden is. Het gemiddelde is −63 °C.
- **"Afstand tot de aarde"** is bij de maan de kleinste afstand (perigeum, 356 565 km), bij Mars de grootste (401 miljoen km), bij de zon "1 astronomische eenheid", bij de aarde 0 km.
- **Eenheden wisselen:** yottagram, kilogram, zonsmassa, Jupitermassa, ronnagram; centimeter per seconde² bij sterren (dat is de gewone eenheid voor log g).
- **"Kind-hemellichaam" (P398) is geen aantal manen:** de aarde heeft er 91 (kunstmanen en ruimtesondes), Saturnus 171 (met ringen en klompjes). NASA zegt 95 voor Jupiter en 274 voor Saturnus, en dat getal verandert elk jaar. Op de site: "bekend in [jaar]: …", met bron.
- **Namen:** de Poolster heet in Wikidata "Polaris" (de Nederlandse Wikipedia ook). Komeet Halley heeft als Nederlandse beschrijving "astronomisch verschijnsel". "Maan" en "Aarde" staan met hoofdletter. Lidwoord en hoofdletters moeten in de handlaag.

**Conclusie:** Wikidata is goed als ruggengraat (namen, koppelingen, Q-nummers) en als controle. De getallen voor de site kies ik met de hand uit de NASA Fact Sheet en de pagina's van NASA/JPL, met een bron per getal, in `data/handwerk/`.

## Foto's

### Wikidata (P18)

| | Afbeelding in Wikidata | Foto? |
|---|---|---|
| de zon | The Sun in white light.jpg | foto (niet zelf bekeken) |
| de maan | FullMoon2010.jpg | foto, bekeken |
| Mercurius | Mercury in color – Prockter07 | MESSENGER, versterkte kleur: label nodig |
| Venus | PIA23791, Mariner 10, "real and enhanced contrast" | foto met versterkt contrast |
| de aarde | Meteosat-12, equinox 2025 | satellietbeeld, bekeken |
| Mars | Kevin M. Gill, Flickr | bewerkt door een amateur; licentie nakijken |
| Jupiter | Hubble OPAL 2024 | foto, bekeken |
| Saturnus | Cassini 2016 | foto (niet zelf bekeken) |
| Uranus, Neptunus | Voyager 2 "color calibrated" | foto, kleuren gecorrigeerd (de bekende diepblauwe Neptunus was versterkt); Neptunus bekeken |
| Pluto | Pluto in True Color | New Horizons, foto |
| Ceres | Dawn, Haulani-krater | foto |
| Io | Juno, december 2023 | foto |
| Europa | Europa-moon.jpg (Galileo) | foto, kleuren nakijken |
| Titan | Kevin M. Gill, "true color" | bewerkt door een amateur |
| de komeet Halley | 1986, Large Scale Phenomena Network | foto vanaf de aarde |
| de Poolster | Hubble, met tekening van het sterrenbeeld en labels | **collage met tekening**, bekeken |
| Sirius | Sirius.jpg | onbekend |
| Betelgeuze | "Location of … Betelgeuse in constellation Orion" | **kaartje, geen foto** |
| het ISS | foto vanuit Crew Dragon 5 | foto, bekeken |

Zeven van de twintig kon ik bekijken; daarna gaf upload.wikimedia.org ook 429. De licentie per bestand kon ik niet ophalen: Commons, en ook de Wikipedia-API's (en, nl) en Wikidata-API gaven 429 aan deze machine. Bij de sterrenbeelden: de afbeelding bij de Zwaan (Cygnus) is een foto van een Tsjechische berg. Precies de valkuil uit de briefing.

### NASA Image and Video Library

images-api.nasa.gov werkt vanuit de browser (CORS open) en vanaf deze machine. Per hemellichaam de eerste 100 treffers bekeken, met een grove woordentelling:

| | Treffers | Tekening/animatie in tekst | Valse/versterkte kleur | Maker van buiten NASA |
|---|---|---|---|---|
| de zon (SDO) | 517 | 8 | 2 | 0 |
| de maan | 20 242 | 5 | 2 | 0 |
| Mercurius | 2907 | 0 | 2 | 0 |
| Venus | 770 | 14 | 9 | 2 |
| Mars | 26 895 | 4 | 0 | 0 |
| Jupiter | 2639 | 6 | 6 | 10 |
| Saturnus | 4237 | 1 | 2 | 1 |
| Uranus | 112 | 4 | 10 | 4 |
| Neptunus | 265 | 11 | 4 | 5 |
| Pluto | 548 | 11 | 11 | 5 |
| Io | 101 | 15 | 8 | 10 |
| Europa | 386 | 11 | 0 | 1 |
| Titan | 259 | 7 | 3 | 2 |
| de komeet Halley | 5 | 2 | 0 | 2 |
| Poolster, Sirius, Betelgeuze | 19, 6, 3 | – | – | – |
| het ISS | 65 423 | 11 | 0 | 5 |

Wat dat zegt:

- Voor de planeten en grote manen is er ruim genoeg, maar zoeken geeft veel ruis: "Mars" geeft eerst vijf foto's van een feestje op het hoofdkantoor, "moon" plannen voor Artemis. **Met de hand kiezen**, op PIA- of NASA-nummer.
- 5 tot 15 procent noemt zichzelf tekening, animatie of illustratie. Dat staat soms alleen in de lange beschrijving. Een woordentelling is een begin, niet het eindoordeel: elke gekozen foto moet je bekijken en de beschrijving lezen.
- "Maker van buiten NASA" (ESA, ASI, MSSS, SwRI, amateurs zoals Kevin Gill of Gerald Eichstädt bij Juno) betekent: licentie per beeld nakijken.
- **Voor sterren heeft NASA bijna niets.** "polaris star" geeft foto's van het vliegtuig SOFIA. Sterren worden ESO (CC BY 4.0) en ESA/Hubble; zie de voorwaarden. Eerlijk is ook: een ster is op elke foto een puntje. De site kan beter laten zien hoe hij aan de hemel staat (sterrenkaart) en een tekening op schaal met label "tekening".

## Geluid

| Hemellichaam | Wat er is | Soort | Licentie |
|---|---|---|---|
| de zon | Iowa: radio-uitbarstingen (type III) | plasma | CC BY 4.0 |
| de aarde | Iowa: "chorus" uit de Van Allen-gordels | plasma | CC BY 4.0 |
| Mars | NASA: Perseverance-microfoons (wind, de helikopter Ingenuity) | **echte opname** | NASA |
| Jupiter | Iowa: Voyager 1 (1979), Juno Waves; Chandra: sonificatie 2026 | plasma; sonificatie | CC BY 3.0/4.0; Chandra |
| Saturnus | Iowa: Cassini (Saturn Kilometric Radiation); Chandra | plasma; sonificatie | CC BY 4.0; Chandra |
| Titan | ESA: Huygens-afdaling 2005 | **labreconstructie** en radarecho's als geluid | ESA |
| de rest | niets bruikbaars gevonden | | |

- De NASA-beeldbank met `media_type=audio` geeft vooral afleveringen van een podcast, geen sonificaties.
- De Hubble-sonificaties (25 stuks) gaan allemaal over nevels en sterrenstelsels.
- **Drie soorten "geluid" uit elkaar houden op de site:** opname (Mars: echte lucht, echte microfoon), plasma (elektrische golven die een antenne meet en die je als geluid kunt afspelen; Iowa zegt er zelf bij dat een mens ze in de ruimte niet hoort), sonificatie (metingen omgezet in muziek, met gekozen instrumenten; bij Chandra zelfs een cello). Elk met een eigen label.
- Iowa waarschuwt zelf: "there are a huge number of fake space sound videos on YouTube. The planets don't actually emit meditation music." Daar moet de site niet tussen belanden.

## Posities: waar staat het aan de hemel?

### Drie bronnen naast elkaar

Op 2 november 2026, 18, 20 en 22 uur Nederlandse tijd, vanaf de Oude Markt in Enschede. Azimut en hoogte zonder breking door de atmosfeer.

| | Hoe in de browser | Grootste verschil met JPL Horizons |
|---|---|---|
| de zon, de maan, de planeten, Pluto | astronomy-engine | 0,02′ tot 0,29′ |
| Io, Europa | astronomy-engine (`JupiterMoons`) | 0,05′ |
| Ceres | zelf: Kepler-baan uit de Small-Body Database | 0,24′ |
| Titan | niet in astronomy-engine; Saturnus genomen | 2,2′ (zo ver staat Titan van Saturnus) |
| de komeet Halley | zelf: Kepler-baan, elementen uit 1968 | 10′ (storingen door planeten ontbreken) |
| het ISS | satellite.js, TLE van wheretheiss.at | 0,09′ |
| de sterren | astronomy-engine (`DefineStar`), RA/Dec uit Wikidata | Horizons doet geen sterren; Skyfield: 0,001° |

(′ = boogminuut, 1/60 graad. De maan is ongeveer 30′ breed.)

- Voor "wat zie je vanavond" is alles ruim nauwkeurig genoeg. Titan en Halley zijn met het blote oog toch niet te zien (Halley is nu helderheid 25,6; hij komt pas in 2061 terug).
- Op- en ondergang: astronomy-engine en Skyfield verschillen 0,0 minuut bij de planeten en 2 minuten bij de zon en de maan. Dat komt doordat astronomy-engine de bovenrand neemt en Skyfield standaard het midden. De bovenrand is wat je ziet; die houden we.
- Het ISS: wheretheiss.at rekent zelf ook met dezelfde TLE, dus dat is geen onafhankelijke controle (verschil 0 km). Horizons en Skyfield wel: overgangen verschillen 2 à 3 seconden. Hoe goed het klopt hangt af van hoe oud de TLE is (hier 20 uur). Een TLE moet dus minstens dagelijks ververst worden.

### Proef: wat zie je vanavond in Enschede?

Alleen met astronomy-engine en satellite.js, zoals de browser het zou doen:

> Zon onder 17:01, schemering voorbij 17:37, echt donker 18:17.
>
> - **Saturnus**: de hele avond, eerst 12° hoog in het oosten, om 20:00 31° hoog in het zuidoosten. Helderheid 0,4: duidelijk te zien.
> - Uranus (5,6) en Neptunus (7,8): wel boven de horizon, niet met het blote oog.
> - De maan komt op om 00:21, 40% verlicht, afnemend. Nieuwe maan op 9 november, volle maan op 24 november.
> - Mars komt op om 23:39, Jupiter om 00:12. Mercurius en Venus staan overdag aan de hemel.
> - De Poolster gaat nooit onder (52° hoog, recht in het noorden). Betelgeuze komt op om 20:58, Sirius om 23:57.
> - Het ISS komt vijf keer over (22:29, 00:04, 01:40, 03:17, 04:54), maar elke keer in de schaduw van de aarde: **niet te zien**.

Klopt dat met een planetariumprogramma? Ik heb geen Stellarium kunnen openen (geen scherm). In plaats daarvan twee professionele bronnen: JPL Horizons (de efemeride die NASA zelf gebruikt) en Skyfield met JPL DE421. Die kloppen tot op de boogminuut en de minuut. **Een controle voor jou, in twee minuten:** open Stellarium Web (stellarium-web.org), zet de plek op Enschede en de tijd op 2 november 20:00: Saturnus moet dan 31° hoog staan in het zuidoosten (azimut 137°).

### Bewolking

Open-Meteo (CORS open, geen sleutel) geeft een uurverwachting voor bewolking. Twee keer achter elkaar opgevraagd voor vanavond 19:00 gaf 99% en daarna 81%; voor 18:00 0% en daarna 1%, en per uur springt het tussen 0 en 100. Dat bevestigt de briefing: de site weet niet of het bij jou bewolkt is. Hooguit: "volgens de weersverwachting waarschijnlijk bewolkt", met bron, en altijd "kijk even naar buiten". KNMI-data vraagt een API-sleutel (zie voorwaarden).

## Sterren en sterrenbeelden

| Bron | Wat | Licentie | Opmerking |
|---|---|---|---|
| Stellarium, sterrencultuur "western" | lijnen van alle 88 sterrenbeelden, Engelse en Latijnse namen, 85 tekeningen (Johan Meuris) | data CC BY-SA, tekeningen Free Art License | Nederlandse vertaling in die map: 1 regel. Namen dus uit Wikidata. |
| d3-celestial (Olaf Frohn) | lijnen (GeoJSON), 5044 sterren tot helderheid 6 | BSD-3 | klaar voor een sterrenkaart in de browser; 0,7 MB |
| Wikidata | Nederlandse namen: Grote Beer, Kleine Beer, Cassiopeia, Zwaan, Lier, Grote Hond … | CC0 | 86 van 88 met mijn vraag; P18 onbetrouwbaar (Zwaan = berg) |
| HYG / Yale Bright Star / Hipparcos | sterrencatalogus | zie voorwaarden | CDS (VizieR, SIMBAD) was vanaf deze machine niet bereikbaar |

Een sterrenkaart in de browser kan dus: d3-celestial of eigen code met de lijnen van Stellarium, en astronomy-engine voor de draaiing van de hemel.

## Wat werkt vanuit de browser (CORS)

| Bron | CORS | Vanaf deze machine | Gebruik |
|---|---|---|---|
| Wikidata SPARQL | open | werkt | bouwscript; live zoeken "niet nagekeken" |
| Wikidata-API, Wikipedia-API, Commons | open, maar 429 | geblokkeerd | via GitHub Action |
| upload.wikimedia.org (foto's) | – | 7 gelukt, daarna 429 | foto's in de repo zetten, niet hotlinken |
| NASA Image Library | open | werkt | bouwscript, of live zoeken |
| JPL Horizons, SBDB | **geen**, met opzet | werkt | alleen in een Action; insluiten in een website mag niet |
| api.le-systeme-solaire.net | open | **401: vraagt nu een sleutel** | niet gebruiken (geen datalicentie) |
| wheretheiss.at (positie en TLE) | open | werkt; 350 vragen per 5 minuten | TLE voor het ISS |
| CelesTrak | ? | niet bereikbaar | in een Action proberen |
| open-notify.org | open | wisselend; alleen http | niet gebruiken |
| Minor Planet Center | open | werkt | niet nodig voor de kern |
| Open-Meteo | open | werkt | bewolking, met voorbehoud |
| KNMI Data Platform | – | 401 zonder sleutel | niet nodig |
| astronomy-engine, satellite.js | – | npm | zelf hosten in `site/js/vendor/`; beide gewone ES-modules, geen bouwstap nodig |

## Voorwaarden en licenties

Volledig, met citaten en de gelezen pagina's: `datacheck/uitkomsten/voorwaarden.md`. Het belangrijkste:

| Bron | Mag het? | Let op |
|---|---|---|
| NASA, JPL, Chandra, Perseverance | ja, vrij met naamsvermelding | de credit kan een derde noemen (MSSS, University of Arizona, LANL/CNES bij de Mars-microfoon): dan per beeld of geluid nakijken. NASA-logo's niet. Sommige Perseverance-fragmenten zijn gesimuleerd. |
| ESA (esa.int) | alleen "educatief, redactioneel of informatief", met "©ESA" en eventuele andere namen | sinds 18 januari 2024 is CC BY-SA 3.0 IGO niet meer de standaard, alleen bij beelden die zo gemarkeerd zijn. Geldt voor beeld en video, niet voor geluid: de Huygens-geluiden linken, niet zelf hosten, of ESA vragen. |
| ESA/Hubble, ESA/Webb, ESO, IAU | CC BY 4.0 | de credit ongewijzigd en zichtbaar bij het beeld |
| Chandra-sonificaties | mp3/mp4 mogen we hosten, met de volledige credit van de pagina | het zijn sonificaties |
| University of Iowa (geluid) | CC BY 4.0 | vaste regel: "Original space audio recordings provided courtesy of NASA and The University of Iowa." |
| JPL Horizons, SBDB | **niet vanuit de website**: "You may not embed these APIs in your website (per NASA CORS policy)." | alleen in een Action, één vraag tegelijk, uitkomst bewaren |
| CelesTrak | ja, maar sinds 26 maart 2026 streng: één download per update (elke 2 uur), anders wordt je IP geblokkeerd | gedeelde IP's van GitHub Actions zijn een risico; wheretheiss.at als terugval |
| wheretheiss.at | geen sleutel, CORS open, ±1 vraag per seconde | |
| open-notify | alleen http | een https-site blokkeert het; niet gebruiken |
| api.le-systeme-solaire.net | sinds april 2025 een gratis sleutel nodig; "All rights reserved", geen datalicentie | niet gebruiken |
| Stellarium-sterrenbeelden, HYG | CC BY-SA (ShareAlike) | ons afgeleide JSON-bestand wordt ook CC BY-SA |
| d3-celestial | BSD-3 | de data zelf komt uit gemengde bronnen |
| Solar System Scope-texturen | CC BY 4.0 | gaten opgevuld met "fictional terrain", kleuren verzadigder dan echt: label "bewerkt" |
| Open-Meteo | CC BY 4.0, gratis voor niet-commercieel | vermelding "Weather data by Open-Meteo.com" |
| KNMI | CC BY 4.0, maar sleutel nodig; de anonieme sleutel gaf direct 429 | niet nodig |
| Oude sterrenatlassen | Commons: publiek domein (Flamsteed, Bayer, 111 bestanden Hevelius); Linda Hall Library: CC BY 4.0 | |
| astronomy-engine, satellite.js | MIT | |

De voorwaarden van CDS (VizieR, SIMBAD) konden niet gelezen worden: die servers waren vanaf deze machine onbereikbaar.

## Wat de site wel en niet kan, volgens deze check

| Onderdeel | Haalbaar? |
|---|---|
| Naam, soort, Wikipedia-link per hemellichaam | ja, Wikidata |
| Weetjes met getallen (groot, zwaar, ver) | ja, maar met de hand gekozen uit NASA, met bron |
| Echte foto van planeten en grote manen | ja, NASA (met de hand gekozen) en Commons via Action |
| Echte foto van een ster | nauwelijks; een puntje. Sterrenkaart en tekening op schaal |
| Geluid | voor zes van de twintig; drie soorten met eigen label |
| "Op schaal" | ja, uit de getallen |
| "Baan" als simulatie | ja, astronomy-engine en Kepler-banen |
| "Nu": waar staat hij vanavond | ja, in de browser, nauwkeurig |
| Het ISS zien overkomen | ja, met een dagelijks ververste TLE |
| Of het bewolkt is | nee, alleen een verwachting met voorbehoud |
| Sterrenbeelden op een kaart | ja |

## Advies

1. **Een vaste kern van 30 tot 50 hemellichamen, met de hand.** Wikidata voor namen en koppelingen, de getallen uit de NASA Fact Sheet en de JPL-pagina's, met een bron per getal in `data/handwerk/`. Lidwoorden ("de maan", "het ISS") in de handlaag.
2. **"Nu" en "Wat zie je vanavond" in de browser** met astronomy-engine en satellite.js, zelf gehost. Locatie alleen in het geheugen, of een plaats intikken. Ceres en kometen met Kepler-banen uit de Small-Body Database, maandelijks ververst door een Action.
3. **Een Action die elke dag de TLE van het ISS ophaalt** (CelesTrak, één keer per dag en stoppen bij een fout; wheretheiss.at als terugval) en in `site/data/` zet. De site zegt hoe oud de baangegevens zijn.
4. **Foto's met de hand kiezen** uit NASA (PIA-nummers), ESA/Hubble/Webb en ESO, en Commons via de foto-Action van Voggels. Elke foto bekijken; tekening en versterkte kleur krijgen een label. Voor sterren: een sterrenkaart en een tekening op schaal.
5. **Geluid alleen waar het echt bestaat,** met drie labels: opname, plasma, sonificatie (en "reconstructie" voor Titan). Iowa (CC BY) als basis. Bij de rest gewoon zeggen: "In de ruimte is geen geluid, en van dit hemellichaam is ook geen meting die we kunnen laten horen."
6. **Sterrenbeelden:** lijnen van Stellarium of d3-celestial, Nederlandse namen uit Wikidata, oude atlasplaten (Hevelius) als tekening.
7. **Bewolking:** niet beloven. Hooguit de verwachting van Open-Meteo, met bron en voorbehoud.

## Nog open, voor jou of voor fase 2

- De licentie per Commons-foto (alleen via een Action).
- CelesTrak vanuit een GitHub Action.
- Even zelf in Stellarium Web kijken of Saturnus om 20:00 op 31° in het zuidoosten staat.
- De open vragen uit de briefing: naam en domein, de repo, locatie vragen ja/nee, ruimtevaartuigen en astronauten ja/nee.

**Hier stop ik, zoals afgesproken. Ik wacht op je akkoord voor fase 2.**

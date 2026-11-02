# Fase 1 datacheck: gebruiksvoorwaarden en licenties

Gecontroleerd op 2 november 2026. Alle pagina's zijn die dag zelf opgehaald (curl of WebFetch), tenzij er "niet gelezen" staat. Uitgangspunt: statische, niet-commerciële Nederlandstalige site op Netlify, zonder cookies of tracking, met data die GitHub Actions ververst.

## Overzicht

| # | Bron | Licentie | Voorwaarden / naamsvermelding | Valkuil | URL gelezen |
|---|------|----------|-------------------------------|---------|-------------|
| 1 | NASA media + images.nasa.gov (incl. audio) | In de VS "generally not subject to copyright"; gebruik volgens NASA Media Usage Guidelines | "NASA should be acknowledged as the source". Credit uit de metadata overnemen (bv. "NASA/JPL-Caltech"). Geen suggestie van goedkeuring door NASA. | Logo's (meatball, worm, seal) zijn **niet** vrij. Materiaal met een derde als copyrighthouder is uitgezonderd. Herkenbare personen. images-api heeft geen key nodig en geeft CORS `*` | https://www.nasa.gov/nasa-brand-center/images-and-media/ |
| 2 | JPL / Photojournal | JPL Image Use Policy: "may be used for any purpose without prior permission" | Credit: "Courtesy NASA/JPL-Caltech", tenzij het bijschrift iets anders zegt. Geen endorsement. | Photojournal is verhuisd naar science.nasa.gov/photojournal. Credits als ".../MSSS", ".../University of Arizona" of ".../ASU" betekenen eigendom van een derde. JPL-logo alleen met toestemming. | https://www.jpl.nasa.gov/jpl-image-use-policy/ ; https://science.nasa.gov/photojournal/ |
| 3a | ESA (esa.int) | **Standaard geen CC meer.** Eigen voorwaarden: gratis voor "educational, editorial and/or informational purposes". Alleen "some" items zijn CC BY-SA 3.0 IGO. | "©ESA" altijd vermelden, plus de naam van illustrator/fotograaf (bv. "ESA/NASA - SOHO/LASCO"). Geen commercieel gebruik, geen endorsement. | Het oude "Copyright_Notice_Images" (CC BY-SA IGO als standaard) verwijst nu door naar nieuwe voorwaarden van 18-01-2024. CC BY-SA IGO geldt alleen als het bij het beeld staat. Beelden van derden vragen aparte toestemming. ESA-logo niet toegestaan. | https://www.esa.int/ESA_Multimedia/Terms_and_conditions_of_use_of_images_and_videos_available_on_the_esa_website |
| 3b | ESA/Hubble (esahubble.org) | CC BY 4.0 | Volledige credit onveranderd, zichtbaar en bij het beeld (bv. "ESA/Hubble & NASA, ..."). Links actief. | Logo niet. Muziek, papers en code zijn niet CC. Credit niet inkorten. | https://esahubble.org/copyright/ |
| 3c | ESA/Webb (esawebb.org) | CC BY 4.0 | Idem, credit per beeld uit het bijschrift. | Idem. Let op: dit geldt voor esawebb.org. Webb-beelden op nasa.gov/webbtelescope.org vallen onder NASA/STScI-regels. | https://esawebb.org/copyright/ |
| 4 | ESO | CC BY 4.0 ("Unless specifically noted") | Volledige credit, bv. "ESO/José Francisco (...)", zichtbaar en bij het beeld. Wijzigingen (ook met AI) vermelden. | Logo niet. Herkenbare personen niet commercieel. Pagina's onder eduoff/vt-2004 zijn uitgezonderd. Muziek alleen uit het Music Archive is CC BY. | https://www.eso.org/public/outreach/copyright/ |
| 5 | Chandra-sonificaties | "no claim to copyright is being asserted", gebruik volgens de NASA-richtlijnen | Credit per sonificatie, bv. "X-ray: NASA/CXC/SAO; ... Sonification: NASA/CXC/SAO/K.Arcand, SYSTEM Sounds (M. Russo, A. Santaguida)". | Multiwavelength-materiaal met niet-NASA-data kan copyright van derden hebben. Bij audio met narration of muziek mogelijk rechten van derden. mp3/mp4 zelf hosten mag volgens de tekst, met credit. | https://chandra.si.edu/photo/image_use.html ; https://chandra.si.edu/sound/ ; https://chandra.si.edu/photo/2020/sonify/ |
| 6 | Univ. of Iowa "space audio" (Voyager/Cassini/Juno, Gurnett) | CC BY 4.0 | "Original space audio recordings provided courtesy of NASA and The University of Iowa. https://space-audio.org/" (kort: "Original audio from space-audio.org") | De licentie vervalt als je zelf copyright claimt. Per clip details controleren. | https://space.physics.uiowa.edu/plasma-wave/space-audio/ ; .../space-audio/citation.html |
| 7a | Perseverance-geluiden (Mars) | NASA-richtlijnen (zie 1) | Credit per clip, bv. "NASA/JPL-Caltech/LANL/CNES/CNRS/ISAE-Supaero" (SuperCam-mic) of "NASA/JPL-Caltech" (EDL-mic). | SuperCam-audio heeft Franse partners in de credit: credit volledig overnemen. Clips op de "Sounds of Mars"-pagina zijn deels **gesimuleerd** ("as it would sound on Mars"), dus niet echt. | https://science.nasa.gov/mission/mars-2020-perseverance/sounds-of-mars/ ; https://science.nasa.gov/resource/first-acoustic-recording-of-laser-shots-on-mars/ |
| 7b | Huygens-afdaling Titan (ESA) | ESA-voorwaarden; die noemen alleen "images and videos", **audio niet** | Geen credit op de pagina; zelf "©ESA" gebruiken. | Bestand 1 is "a laboratory reconstruction", bestand 2 zijn radarecho's die naar geluid zijn omgezet. Geen echte opname dus. De algemene ESA-voorwaarden zijn strenger: "does not grant the right to ... redistribute". Bij twijfel ESA mailen of alleen linken. | https://www.esa.int/Science_Exploration/Space_Science/Cassini-Huygens/Sounds_of_an_alien_world ; https://www.esa.int/Services/Terms_and_conditions |
| 8 | Solar System Scope textures | CC BY 4.0 | Geen voorgeschreven tekst. Voorstel: "Textures: Solar System Scope (solarsystemscope.com), CC BY 4.0". | Ontbrekende stukken zijn aangevuld met "fictional terrain" en de kleuren zijn "slightly more saturated". Dus niet wetenschappelijk exact. | https://www.solarsystemscope.com/textures/ |
| 9 | NASA 3D Resources | NASA-richtlijnen; README: "free and without copyright" | NASA als bron vermelden. | Bijdragers zijn ook Ball Aerospace, DigitalSpace Corporation e.a., dus per model de herkomst checken. github.com zelf kon ik niet openen (403); de README heb ik via raw.githubusercontent gelezen. | https://science.nasa.gov/3d-resources/ ; https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/README.md |
| 10 | Stellarium sky cultures | Data (lijnen, namen): **CC BY-SA** (western in skycultures-repo, geen versie genoemd) en **CC BY-SA 4.0** ("modern" in de hoofdrepo). Illustraties: Free Art License. Repo-code: AGPL-3.0 | "Stellarium's team", licentie en link. | **ShareAlike**: een afgeleid JSON-bestand moet ook CC BY-SA zijn. In stellarium-skycultures heet het "western" (er is geen "modern"); "modern" staat in Stellarium/stellarium/skycultures/modern. Er is een `western/po/nl.po`, maar daarin is alleen de naam van de cultuur vertaald ("Westers"), geen sterrenbeelden (nagekeken 2 nov 2026). | raw: stellarium-skycultures/master/README.md, western/description.md ; stellarium/master/skycultures/modern/description.md |
| 11 | d3-celestial (Olaf Frohn) | BSD-3-Clause (repo, inclusief data/) | Copyright-notice "Copyright (c) 2015, Olaf Frohn" meeleveren. Naam niet gebruiken voor endorsement. | De data komen uit XHIP (CDS), het IAU, Wikipedia, SAC en Stellarium. BSD dekt Frohns werk, maar de herkomst is gemengd. Sterrennamen via Stellarium (CC BY-SA). | https://raw.githubusercontent.com/ofrohn/d3-celestial/master/LICENSE ; .../readme.md |
| 12a | HYG-database | CC BY-SA 4.0 (v4.x; oudere versies CC BY-SA 2.5) | Naamsvermelding "HYG Database (astronexus), CC BY-SA 4.0". | **ShareAlike** voor afgeleide data. Het GitHub-repo is een archief; actuele versie op codeberg.org/astronexus/hyg. | https://codeberg.org/astronexus/hyg (README, LICENSE) ; https://raw.githubusercontent.com/astronexus/HYG-Database/master/LICENSE |
| 12b | Yale BSC5 via CDS/VizieR | Volgens secundaire bron: "free of usage in a scientific context"; commercieel hangt af van de herkomst | Catalogus en VizieR citeren (DOI 10.26093/cds/vizier). | **CDS-pagina's niet gelezen**: cds.unistra.fr, cdsarc en vizier gaven connection reset of HTTP 503. Volg de ReadMe van catalogus V/50. | (niet gelezen) https://cds.unistra.fr/vizier-org/licences_vizier.html |
| 13 | IAU (WGSN-sterrennamen, sterrenbeelden) | iau.org: CC BY 4.0 voor beelden, video's en webteksten | Credit "IAU", onveranderd en zichtbaar. Het WGSN-bestand vraagt de officiële IAU-versie te citeren. | De oude URL's (/public/themes/naming_stars/, /constellations/) geven 404. De lijst wordt nu bijgehouden via exopla.net / IAU-CSN. IAU-logo en muziek zijn niet vrij. | https://www.iau.org/Iau/Copyright.aspx ; https://www.pas.rochester.edu/~emamajek/WGSN/IAU-CSN.txt |
| 14 | api.le-systeme-solaire.net | **Geen open licentie vermeld**: "Copyright © 2019- All rights reserved." | Sinds 2.0.0 (09-04-2025) een verplichte Bearer-token, gratis via e-mail en captcha. CORS `*`. | Een key in de statische frontend is publiek. Haal de data op in GitHub Actions met de key als secret. Datalicentie onduidelijk; bij twijfel de auteur mailen of data uit NASA/JPL halen. | https://api.le-systeme-solaire.net/en/ ; .../generatekey.html |
| 15a | wheretheiss.at | Geen licentie of ToS gevonden | Geen auth. "roughly 1 per second" (header: 350 per 5 min). CORS `*`. | Geen formele voorwaarden. Zuinig pollen (bv. elke 5-10 s per bezoeker). | https://wheretheiss.at/w/developer |
| 15b | open-notify.org | Geen licentie vermeld | Geen auth, CORS `*`. "keep polling to about once every 5 seconds". | **Alleen http**: https gaf een connection reset. Op een https-site (Netlify) blokkeert de browser dit als mixed content. Niet bruikbaar vanuit de browser. | http://open-notify.org/Open-Notify-API/ISS-Location-Now/ |
| 15c | CelesTrak GP/TLE | Geen licentie of attributie vermeld; "freely available to all users" | "only download data once per update"; GP-update elke 2 uur. Max. 50 HTTP-fouten per 2 uur. Na een niet-200-antwoord direct stoppen. | IP-blokkade bij herhaald downloaden. Vanaf 26-03-2026 geldt overal één download per update. GitHub Actions deelt IP's met anderen: maximaal elke 2 uur draaien en cachen. curl via de proxy faalde; gelezen via WebFetch. | https://celestrak.org/NORAD/documentation/gp-data-formats.php ; https://celestrak.org/usage-policy.php |
| 16 | JPL Horizons / SBDB API | JPL SSD Fair Use Policy | Eén request tegelijk, cachen, backoff. | **"You may not embed these APIs in your website (per NASA CORS policy)."** Geen CORS dus, en dat is bewust beleid. Alleen via GitHub Actions ophalen. | https://ssd-api.jpl.nasa.gov/ ; .../doc/horizons.html ; .../doc/sbdb.html |
| 17 | astronomy-engine, satellite.js | Beide MIT (npm: astronomy-engine 2.1.19, satellite.js 7.1.0) | MIT-notice meeleveren (bijvoorbeeld in een licentiebestand of de bundelcomment). | Geen. | raw LICENSE-bestanden op GitHub + registry.npmjs.org |
| 18a | KNMI Data Platform | Datasets CC BY 4.0 (gecontroleerd bij HARMONIE-AROME cy43 p1) | Bron "KNMI" plus licentielink. Een API-key is verplicht: anoniem (gedeeld, 50/min, 3000/uur, geldig tot 1 aug 2027) of geregistreerd (gratis, 1000/uur). | De anonieme key gaf bij mijn test direct **429 Rate Limit Exceeded** omdat hij gedeeld wordt. Bestanden zijn GRIB, te zwaar voor de browser. Alleen via Actions met een geregistreerde key. | https://developer.dataplatform.knmi.nl/open-data-api ; https://dataplatform.knmi.nl/dataset/harmonie-arome-cy43-p1-1-0 |
| 18b | Open-Meteo | Data CC BY 4.0; gratis API alleen voor niet-commercieel gebruik | "Weather data by Open-Meteo.com" plus link en licentielink. Limieten: 600/min, 5000/uur, 10.000/dag, 300.000/maand. CORS `*` (getest). KNMI-model beschikbaar. | Limieten gelden per IP. Ze waarschuwen dat Netlify- en Vercel-IP's eerder geknepen worden; voor GitHub Actions geldt waarschijnlijk hetzelfde. Bij aanroep vanuit de browser telt het IP van de bezoeker. Onderliggende KNMI-data: CC BY. | https://open-meteo.com/en/terms ; https://open-meteo.com/en/licence |
| 19 | Oude sterrenatlassen (Commons, Linda Hall) | Werken zelf zijn publiek domein. Linda Hall: PD-beelden "for any purpose" onder CC BY 4.0 | Linda Hall: "Courtesy of The Linda Hall: Science Library & Arboretum". | Commons-bestanden van Bayer 1661 en Flamsteed 1729 komen van raremaps.com (circa 10.000 × 7.000 px, gemarkeerd als PD). Hevelius: 111 bestanden, bron per bestand niet vermeld. USNO en Library of Congress **niet gecontroleerd**. Commons-API gaf snel "too many requests". | https://www.lindahall.org/research/using-the-library/document-delivery-and-image-reproduction/ ; Commons-categorieën (zie notities) |

---

## Notities per bron, met citaten

### 1. NASA media en NASA Image and Video Library
URL: https://www.nasa.gov/nasa-brand-center/images-and-media/ (de oude multimedia/guidelines-URL verwijst hierheen)

- "NASA content – images, audio, video, and media files used in the rendition of 3-dimensional models ... generally are not subject to copyright in the United States. You may use this material for educational or informational purposes, including ... Internet Web pages."
- "NASA content used in a factual manner that does not imply endorsement may be used without needing explicit permission. NASA should be acknowledged as the source of the material."
- "NASA occasionally uses copyright-protected material of third parties with permission on its website. Those images will be marked identified as copyright protected with the name of the copyright holder. NASA's use does not convey any rights to others to use the same material."
- "The NASA Insignia, Logotype, identifiers, and imagery are not in the public domain. The use of the Insignia, Logotype and NASA identifiers is protected by law".
- images-api.nasa.gov: bij een test zonder API-key kwam HTTP 200 terug met `access-control-allow-origin: *`. In de API-doc (PDF) heb ik geen key of rate limit gevonden. Audio staat er ook in (`media_type=audio`).
- Valkuil: "generally" geldt niet voor alles. Controleer per item de velden `photographer`, `secondary_creator` en de beschrijving op "Credit: ..." met een niet-NASA-partij, zoals een universiteit, ESA of een fotograaf.

### 2. JPL / Photojournal
URL: https://www.jpl.nasa.gov/jpl-image-use-policy/

- "Unless otherwise noted, images and video on JPL public web sites (public sites ending with a jpl.nasa.gov address) may be used for any purpose without prior permission".
- "Unless otherwise noted in the caption information for an image, the credit line should be "Courtesy NASA/JPL-Caltech.""
- "Some image and video materials on JPL public web sites are owned by organizations other than JPL or NASA. These owners have agreed to make their images and video available for journalistic, educational and personal uses, but restrictions are placed on commercial uses."
- "Prior written approval must be obtained to use the JPL logo".
- photojournal.jpl.nasa.gov verwijst nu door naar https://science.nasa.gov/photojournal/ ("Welcome to Photojournal's new web presence on Science@NASA"). Daar geldt de NASA-richtlijn. Het JPL-beleid is formeel alleen voor jpl.nasa.gov-sites.

### 3. ESA, ESA/Hubble, ESA/Webb
ESA, https://www.esa.int/ESA_Multimedia/Terms_and_conditions_of_use_of_images_and_videos_available_on_the_esa_website ("Last updated on 18 January 2024"):
- "provides to users an online access to space images and videos for education, editorial and/or information purposes only. All other uses (e.g. commercial ones) are excluded and require a specific licence."
- "(i) You must always credit the ESA copyright - ©ESA ... (Examples: Photo: ©ESA; Photo: ESA/Cluster; Image: ESA/NASA - SOHO/LASCO)"
- "(ii) ... not ESA copyrighted but belong to other copyright holders ... their separate written approval might be necessary."
- "(iv) Some images or videos available on the ESA Website are licensed under Creative Commons (CC BY-SA 3.0 IGO) licence."
- Dus: CC BY-SA 3.0 IGO is niet meer de standaard. Alleen beelden waar die licentie expliciet bij staat zijn CC BY-SA IGO. Een kinderwebsite zonder commercie valt onder "educational/informational", dus het mag met credit.

ESA/Hubble, https://esahubble.org/copyright/:
- "ESA/Hubble images, videos and web texts are released under the Creative Commons Attribution 4.0 International license and may on a non-exclusive basis be reproduced without fee provided they are clearly and visibly credited."
- "The full image or footage credit must be presented in a clear and readable manner to all users, with the wording unaltered".
- "music, scientific papers and code on this site are not released under the Creative Commons Attribution 4.0".

ESA/Webb, https://esawebb.org/copyright/:
- "ESA/Webb images, videos and web texts are released under the Creative Commons Attribution 4.0 International license". Verder dezelfde voorwaarden als Hubble, met per beeld "Each image or video has its own credit line that is required."

### 4. ESO
URL: https://www.eso.org/public/outreach/copyright/
- "Unless specifically noted, the images, videos, and music distributed on the public ESO website ... are licensed under a Creative Commons Attribution 4.0 International License".
- "The license allows to modify ESO material, provided that you indicate what those modifications are. In particular, you must clearly indicate if you have used AI to modify our content."
- "this general permission does not extend to the use of ESO's logo".

### 5. Chandra-sonificaties
URL: https://chandra.si.edu/photo/image_use.html
- "For Chandra content, no claim to copyright is being asserted and the material may be used in accordance with NASA guidelines. It is requested that use of this work by NASA/SAO be given all appropriate acknowledgement. Credits are provided with each image/video/sonification on its page."
- "The Chandra web site also contains material created and/or provided by individuals or institutions other than SAO, and those individuals or institutions may claim copyright. For example, multiwavelength images with non-NASA data."
- "Audio Recordings: Use of a portion or segment of an audio piece, such as narration, or music, may infringe a right of publicity or copyright".
- Voorbeeldcredit (https://chandra.si.edu/photo/2020/sonify/): "X-ray: NASA/CXC/SAO; Optical: NASA/STScI; IR: Spitzer NASA/JPL-Caltech; Sonification: NASA/CXC/SAO/K.Arcand, SYSTEM Sounds (M. Russo, A. Santaguida)".
- Conclusie: de mp3/mp4 zelf hosten mag, met de volledige credit van die pagina. Let op: dit zijn sonificaties (data omgezet in muziek), geen geluid uit de ruimte. Leg dat aan het kind uit.

### 6. Space audio University of Iowa
URL's: https://space.physics.uiowa.edu/plasma-wave/space-audio/ en .../citation.html (de oude URL www-pw.physics.uiowa.edu/space-audio/ verwijst hierheen; /plasma-wave/nasa/ geeft 404)
- "The audio files found at this site are available under a Creative Commons Attribution 4.0 International License."
- Voorkeurscitaat: "Original space audio recordings provided courtesy of NASA and The University of Iowa. https://space-audio.org/"
- "This license is recinded if you attempt to claim copyright to our material."

### 7. Perseverance en Huygens
Perseverance, https://science.nasa.gov/mission/mars-2020-perseverance/sounds-of-mars/:
- Clip "First Acoustic Recording of Laser Shots on Mars": "Credit | NASA/JPL-Caltech/LANL/CNES/CNRS/ISAE-Supaero". Er zijn wav- en mp3-downloads op assets.science.nasa.gov.
- Clip "Sounds of Perseverance Mars Rover Driving – Sol 16": "Credit | NASA/JPL-Caltech".
- Een deel van de pagina is gesimuleerd: "Voyager Greeting ... As it would sound on Earth, and Mars".

Huygens, https://www.esa.int/Science_Exploration/Space_Science/Cassini-Huygens/Sounds_of_an_alien_world:
- "This recording is a laboratory reconstruction of the sounds heard by Huygens' microphones."
- "This recording was produced by converting into audible sounds some of the radar echoes received by Huygens".
- De ESA-beeldvoorwaarden gaan alleen over "images and videos". De algemene voorwaarden (https://www.esa.int/Services/Terms_and_conditions) zeggen: "ESA does not grant the right to resell or redistribute any information, documents, images or material from its website". Advies: linken naar de ESA-mp3, of ESA om toestemming vragen voordat je zelf host.

### 8. Solar System Scope
URL: https://www.solarsystemscope.com/textures/
- "Distributed under Attribution 4.0 International license: You may use, adapt, and share these textures for any purpose, even commercially."
- "Some parts of the planets remain to be mapped. These "gaps" are filled with fictional terrain".

### 9. NASA 3D Resources
URL: https://science.nasa.gov/3d-resources/
- "All of these assets are free to download and use. They are also mirrored on GitHub. Refer to the NASA Images and Media Usage Guidelines."
- README (raw): "These assets are free and without copyright." De lijst van bijdragers bevat ook niet-NASA-partijen (Ball Aerospace, DigitalSpace Corporation).

### 10. Stellarium sky cultures
- stellarium-skycultures/README.md: "Each sky culture should explicitely specify the authors and license for all text, lines, images and illustrations. Ideally the license ... should be CC BY-SA".
- western/description.md: "Text and data: CC BY-SA" / "Illustrations: Free Art License" / Authors: "Stellarium's team. Illustrations by Johan Meuris."
- stellarium/skycultures/modern/description.md: "Text and data: CC BY-SA 4.0".
- Het repo heeft LICENSE-AGPL-3.0.txt (voor de scripts). Voor de data gelden de description.md-licenties.

### 11. d3-celestial
- LICENSE: "Copyright (c) 2015, Olaf Frohn. All rights reserved. Redistribution and use in source and binary forms, with or without modification, are permitted provided that ..." (BSD-3-Clause; npm: "BSD-3-Clause").
- readme.md, bronnen: "constellations.lines.json Constellation lines [3]" met "[3] IAU Constellation page, name positions and some line modifications by me". Sterren uit "XHIP ... VizieR V/137D". Vertalingen van namen uit "Stellarium skycultures data".

### 12. HYG en BSC5/CDS
- HYG (codeberg.org/astronexus/hyg README): "This work is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License." "Versions since v4.0 are licensed as above (CC-BY-SA 4.0). Earlier versions use the CC-BY-SA v2.5 license."
- GitHub-README: "The HYG database is now hosted at https://codeberg.org/astronexus/hyg ... No further updates to HYG will be posted here."
- CDS/VizieR: **niet gelezen.** cds.unistra.fr, cdsarc.cds.unistra.fr, vizier.cds.unistra.fr en de mirrors gaven connection reset of HTTP 503 (ook via WebFetch). Een zoekresultaat (secundair, niet zelf geverifieerd) citeert de CDS-regels: "Data retrieved with VizieR are free of usage in a scientific context, and original authors and publishers still need to be cited" en "The copyrights of a catalogue depend on the data origin. Please refer to the ReadMe file". Opnieuw controleren zodra CDS bereikbaar is.

### 13. IAU
- https://www.iau.org/Iau/Copyright.aspx: "The images, videos and web texts on iau.org are released under the Creative Commons Attribution 4.0 International license". "The full image, footage or web text credit must be presented ... with the wording unaltered (for example: "IAU"". "this general permission does not extend to use of the IAU's logo".
- WGSN-lijst (IAU-CSN.txt, "Last updated 2022-04-04"): "we encourage users to cite the official IAU version of the data ... All IAU-produced products (Images, Videos, Texts) are released under Creative Commons Attribution (i.e. free to use in all perpetuity, world-wide, as long as the source is mentioned)."
- De oude pagina's iau.org/public/themes/naming_stars/ en /constellations/ geven nu 404. Sterrenbeeldgrenzen komen in de praktijk uit Davenhall & Leggett 1989 (VizieR VI/49), en die pagina kon ik niet lezen.

### 14. api.le-systeme-solaire.net
- 401-antwoord: "Unauthorized (API key is missing. Ask your API key on https://api.le-systeme-solaire.net/generatekey.html ... `Authorization: Bearer <API_KEY_GUID>`)".
- Changelog: "09-04-2025 - 2.0.0 Authorization. Added a mandatory bearer token for calling API. Token and access keep free."
- generatekey.html: "Entrez votre adresse email pour recevoir une clé gratuite." (met captcha).
- Licentie: geen datalicentie gevonden. De footer zegt "Copyright © 2019- All rights reserved."

### 15. ISS en satellieten
- wheretheiss.at: "Currently there is no authentication required ... Currently requests are limited to roughly 1 per second." Headers: `X-Rate-Limit-Limit: 350`, `X-Rate-Limit-Interval: 5 minutes`, `Access-Control-Allow-Origin: *`.
- open-notify: "A single client should try and keep polling to about once every 5 seconds." Over http werkt het (met CORS `*`); https://api.open-notify.org gaf een connection reset.
- CelesTrak (gelezen via WebFetch): "CelesTrak only checks for new GP data once every 2 hours, so there is no need for you to check more often." "CelesTrak will now (as of 2026 Mar 26) simply enforce the one-download-per-update policy for all users". Usage policy: "Only download the data you need, when you are going to use it, and only download data once per update." "M2M (machine-to-machine) software should immediately stop querying when it receives any non-HTTP 200 responses". "Repeatedly ignoring them will end up sending your IP address to the firewall." Over licentie of attributie staat er niets.

### 16. JPL Horizons / SBDB
URL: https://ssd-api.jpl.nasa.gov/ (Fair Use-voorwaarden op de startpagina)
- "You agree to submit only one API request at a time (no simultaneous requests)."
- "Where practical, applications should cache and reuse results".
- "JPL may rate-limit, throttle, or block access that places an unreasonable load on the service".
- "You may not embed these APIs in your website (per NASA CORS policy)."
- Eigen test: geen Access-Control-Allow-Origin op sbdb.api, in lijn met jouw meting.

### 17. astronomy-engine en satellite.js
- astronomy-engine: "MIT License, Copyright (c) 2019-2025 Don Cross".
- satellite.js: "MIT License, Copyright (C) 2013 Shashwat Kandadai, UCSC Jack Baskin School of Engineering".

### 18. KNMI en Open-Meteo
KNMI, https://developer.dataplatform.knmi.nl/open-data-api:
- "All endpoints are protected and can be accessed using a valid API key".
- Tabel: "Registered open data API key 200 requests/second 1000 requests/hour" / "Anonymous open data API key 50 requests/minute (shared) 3000 requests/hour (shared)".
- "The following key is available till the 1st of August 2027".
- Datasetpagina HARMONIE-AROME (via WebFetch): licentie "Creative Commons Attribution 4.0", "No use limitations", formaat GRIB.

Open-Meteo, https://open-meteo.com/en/terms en /en/licence:
- "Less than 10'000 API calls per day, 5'000 per hour and 600 per minute."
- "You may only use the free API services for non-commercial purposes."
- "If you are using providers like Vercel, Netlify, Render, or Google Sheets you might be rate-limited earlier then expected."
- "API data are offered under Attribution 4.0 International (CC BY 4.0)". Voorbeeldtekst: "Weather data by Open-Meteo.com".
- Bronlijst: "Atmospheric forecasts from Royal Netherlands Meteorological Institute KNMI (CC-BY Licence)".

### 19. Oude sterrenatlassen
- Linda Hall, https://www.lindahall.org/research/using-the-library/document-delivery-and-image-reproduction/: "All digital images in the LHL collection that are in the public domain can be used for any purpose under the terms of this Creative Commons License [CC BY 4.0]. The library's preferred credit line for all uses is: "Courtesy of The Linda Hall: Science Library & Arboretum"". "There is no fee required for high-resolution images already digitized by the Library." De oude FAQ-URL (.../image-reproductions-faqs) geeft 404.
- Wikimedia Commons (API en WebFetch):
  - "Atlas Coelestis by John Flamsteed (1729)": bestanden zoals "... 001.jpg" van 10573 × 7346 px, LicenseShortName "Public domain", bron raremaps.com.
  - "Uranometria by Johann Bayer (1661)": circa 9980 × 7200 px, "Public domain", bron raremaps.com. Er is ook een categorie "1603 celestial charts by Johann Bayer" en een BEIC-scan van de 1603-druk.
  - "Firmamentum Sobiescianum, sive uranographia": 111 bestanden, waaronder de subcategorie "Uranographia (colored)" (40). De categoriepagina noemt e-rara (ETH Zürich) en Linda Hall als vindplaatsen voor het complete werk.
- Niet gecontroleerd: US Naval Observatory Library en Library of Congress. Ook resoluties per Hevelius-bestand heb ik niet gecontroleerd, omdat de Commons-API met "too many requests" blokkeerde.
- Valkuil: Commons markeert PD-scans als "Public domain". In de EU (art. 14 DSM-richtlijn) is een getrouwe reproductie van een PD-werk ook vrij. Neem toch de bron (instelling of raremaps) en de Commons-link op.

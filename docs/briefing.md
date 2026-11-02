# Nieuw project: het heelal (werktitel)

Briefing om een nieuwe Claude Code-sessie mee te starten. Geschreven na het bouwen van twee sites voor ouders en kinderen:

- **Voggels** (voggels.nl): vogels in Twente. Code: `sterrenstofai/vogels`.
- **ikhooreengeluidje.nl**: nummers uit elkaar gehaald. Code: `sterrenstofai/ikhooreengeluidje`.

Alles wat daar werkte staat hieronder, met de valkuilen. Geef de nieuwe sessie toegang tot beide repo's, zodat hij code kan overnemen in plaats van opnieuw te schrijven.

## Het idee

Mijn zoon (4 jaar, heet Fos) is gefascineerd door de ruimte. De site laat de hemellichamen zien: de zon, de planeten, de maan, manen van andere planeten, dwergplaneten, kometen, sterren, sterrenbeelden, misschien ook ruimtevaartuigen.

- **Per hemellichaam één scherm:** groot beeld, weetjes, hoe groot en hoe ver, hoe het eruitziet en klinkt.
- **Wat zie je vanavond?** Wat staat er aan de hemel boven jouw huis: welke planeten, de maan, het ISS? Uitgerekend in de browser.
- **Een kinderversie:** groot beeld, één knop, een stem die de naam zegt.
- **Onderzoekjes met Fos:** elke week samen op onderzoek. Eerst op de site, dan naar buiten (of naar het raam) om echt te kijken.

De naam en het domein kies ik zelf.

## Harde regels (overgenomen van Voggels en ikhooreengeluidje)

- **Eerlijk over wat de site niet weet.** Wat geschat of nagemaakt is, staat zo op de site, met een label.
  - "simulatie" is een mint label.
  - "nagekeken" betekent: met de hand gecontroleerd, met een bron per feit.
  - Er komt een pagina "Hoe dit werkt / wat de site niet kan".
- **Kunstenaarsimpressies zijn geen foto's.** Een tekening van een exoplaneet of van de Kuipergordel krijgt het label "tekening" of "kunstenaarsimpressie". Een foto met valse kleuren ook: zeg welke kleuren echt zijn.
- **Geen cookies en geen tracking.** Wat je zelf bijhoudt (onderzoekjes, gespotte planeten) blijft in de browser van je eigen apparaat (localStorage of IndexedDB).
- **Browser-first.**
  - Ik werk zonder lokale ontwikkelomgeving.
  - Statische site (HTML, CSS, losse ES-modules, geen framework, geen build-stap), live via Netlify, data ververst door GitHub Actions.
  - Strikte CSP.
- **Communicatie en sitetekst in het Nederlands,** direct en zonder marketingtoon. Let op "de" en "het" als je namen in zinnen zet: "de maan", "het ISS", "de Grote Beer".
- **Geen AI-beelden.** Echte foto's (NASA, ESA, ESO) en tekeningen uit open collecties. Van elke foto de maker en de licentie bij het beeld.
- **Licenties per bron nakijken voordat iets in de repo komt.** NASA is meestal publiek domein, maar niet altijd. ESA en ESO hebben eigen voorwaarden.
- **Eerst een datacheck, dan stoppen** (fase 1, zie onderaan). Pas bouwen na mijn akkoord.

## Opbouw en uiterlijk: zoals Voggels en ikhooreengeluidje

Neem dit over uit de code, en schrijf het niet opnieuw.

**Eén scherm per hemellichaam**
- In het midden een groot podium met tabjes.
- Titel en weetjes (`<dl class="weetjes">`) linksonder.
- Onderaan een strook met verwante items: de manen van een planeet, of de planeten op volgorde.
- Rechtsonder een klein kaartje.
- Op de telefoon eerst de titel, dan de tabjes, dan de strook.
- Bijvoorbeeld deze tabjes:
  - **Foto:** echt beeld, met maker en licentie.
  - **Op schaal:** hoe groot ten opzichte van de aarde, of hoe ver.
  - **Baan:** een simulatie in de browser.
  - **Geluid:** sonificaties, en eerlijk zeggen dat geluid niet door de ruimte gaat.
  - **Nu:** waar staat hij vanavond aan de hemel.

**Index en zoeken**
- Index van alle hemellichamen met filterchips en zoeken.
- Zoeken dat ook verder kan dan de vaste lijst, met het label "niet nagekeken".

**Kop**
- Logo, zoekveld, een mint knop "Ontdek een …" en icoontjes voor onderzoekjes, kinderen, "Mijn …" (met teller) en de index.
- Op smalle telefoons (≤ 420 px) kleinere knoppen; onder 380 px zonder logo-icoontje.
- Tussen 1000 en 1600 px alleen icoontjes, anders raakt het zoekveld klem.
- Tussen 1000 en 1200 px de knop "Zoeken" weg.

**Voet:** vier kolommen (Data, Beeld, Geluid, Privacy) en groot het woordmerk.

**Typografie en kleur** (naar aspensearch.com)
- Letters: Geist en Geist Mono (OFL), zelf gehost. Kopieer `site/fonts/` uit een van de twee repo's.
- Koppen dun (gewicht 300) en strak gespatieerd (−0,035em). Nergens cursief: `em, i { font-style: normal }`.
- Kleine labels (`.etiket`) in Geist Mono, hoofdletters, met een zwart blokje ervoor.
- Kleuren: wit `#FFFFFF`, inkt `#232323`, grijs `#F4F4F4`, `#D9D9D9` en `#6E6E6E`, mint `#A1FFCB`.
- Kleur zit in vlakken, niet in letters. Een accentwoord in een kop krijgt een mint vlak (`.accent`).
- Altijd een licht thema, ook als het toestel op donker staat: `color-scheme: only light`.
  - Voor een ruimtesite is een donkere sterrenhemel verleidelijk. Voggels gebruikte daar een donker paneel binnen een licht thema voor (de simulatiekaart, `--nacht: #1A1A1A`). Doe dat ook: donker alleen in het podium of een sterrenkaart, de rest licht.

**Kinderversie** (`/kinderen`, kopieer `site/js/kinderen.js` uit ikhooreengeluidje)
- Een grote foto en een grote mint knop.
- Een stem die de naam zegt als je op de foto tikt (Web Speech, Nederlandse stem van het toestel, `rate 0.8`, `pitch 1.1`).
- De eerste keer wijst een kloppend handje aan waar je kunt tikken (onthouden in localStorage).
- Vegen of de pijlen gaan naar het volgende. Onderaan een strook om er een te kiezen.
- Rechtsboven klein de maker en licentie van foto en geluid.

**Onderzoekjes met Fos** (`/onderzoekjes`, kopieer `site/js/onderzoekjes.js` uit ikhooreengeluidje)
- Zes opdrachten, elk met "Wat heb je nodig", "Zo doe je het", een interactief stuk en een mint blok "En dan naar buiten".
- Een voortgangsbalk met zes vakjes, een logboek per opdracht en een stempel "Gedaan".
- Een certificaat met naam als A4-PNG (3508 × 2480), in de browser getekend op een canvas, met een echte foto erop.
- "Opnieuw beginnen" met een bevestiging; de naam blijft bewaard.
- Alles in localStorage.

**"Mijn …"** (kopieer `site/js/mijn.js` uit ikhooreengeluidje)
- Een plusje (aan/uit) bij elk item en op elk kaartje, een teller in de kop en een eigen pagina met de datum.
- Een melding met "Ongedaan".
- Voor de ruimte: "Mijn hemel": wat je zelf echt hebt gezien, met datum.

## Techniek: wat werkte

**Opbouw van de repo** (zoals ikhooreengeluidje)
```
site/            alles wat live gaat (Netlify publiceert deze map)
  index.html     één pagina; JS-router met history.pushState en <a data-link>
  hoe-dit-werkt.html
  css/stijl.css  één bestand
  js/            ES-modules, per onderdeel een bestand, zwaar spul met dynamic import()
  data/          JSON die de site leest (gebouwd door scripts)
  fotos/  klanken/  fonts/
data/            ruwe data, met de hand gemaakte laag (handwerk/), bronlijsten
scripts/         Python (alleen standaardbibliotheek waar het kan): ophalen, bouwen, testserver
tests/schermen.js  Playwright: schermafbeeldingen en controles
docs/            briefing, rapporten
.github/workflows/ maandelijks verversen, foto's ophalen
netlify.toml     publish = "site", redirects voor SPA-paden, headers met CSP
CLAUDE.md        de harde regels
```

**Data in lagen**
- Automatisch uit open bronnen: `data/ruw/`.
- Met de hand, met een bron per feit: `data/handwerk/<slug>.json`.
- Een bouwscript voegt ze samen tot `site/data/*.json`.
- Een item met een handlaag krijgt het label "nagekeken".
- Een kleine vaste kern van 30 tot 50 met de hand gekozen items (betrouwbaar), plus live zoeken voor de rest (met het label "niet nagekeken").

**Geluid**
- Op iOS moet afspelen direct in de tik van de gebruiker gebeuren, zonder `await` ervoor.
- Gebruik mp3 of m4a en een gewoon `<audio>`-element, dus één speler voor de hele site. Kopieer `site/js/geluid.js`.
- Reken het spectrogram los uit: fetch, dan `decodeAudioData` op 22 kHz, dan een FFT.
- Voor klanken die de browser zelf maakt (Web Audio): maak de `AudioContext` in de tik en roep `ctx.resume()` aan.

**Quiz-modus:** speel geheim af. Dan tonen de spelerbalk en het vergrendelscherm geen naam en geen beeld (`navigator.mediaSession`).

**Beelden van Wikimedia Commons**
- Commons blokkeert gewone machines (429). Ophalen via een GitHub Action; kopieer `scripts/fotos_ophalen.py` en `.github/workflows/fotos.yml`.
- Neem alleen vrije licenties, zet de maker en de licentie erbij, en bekijk elke foto daarna zelf.
- De afbeelding die Wikidata bij een item geeft (P18) is lang niet altijd een goede foto. Er kwam eens een foto van een persoon uit in plaats van een draaitafel.
- Als de maker niet te lezen is ("No machine-readable author provided"), schrijf dan "maker: zie de bestandspagina" met een link.

**Wikidata**
- Losse API-vragen gaven 429. Eén SPARQL-vraag voor alles tegelijk werkte wel (`query.wikidata.org`).
- Zoek op het Engelse label. Bij meerdere items met hetzelfde label: neem het item met de meeste Wikipedia's.

**Live bronnen in de browser**
- Controleer eerst of de bron CORS toestaat (`Access-Control-Allow-Origin`).
- Houd je aan rate limits met een wachtrij, en bewaar antwoorden in sessionStorage.
- Geef bij een fout (503/429) een eerlijke melding, niet "niets gevonden".

**Netlify**
- Een project kan Claude aanmaken met de Netlify-koppeling.
- **Het koppelen van de GitHub-repo moet jij doen,** in Netlify: Project configuration → Build & deploy → Link repository.
- Daarna gaat elke push naar `main` vanzelf live.
- Zet `.netlify/` in `.gitignore`.

**CSP**
- Strikt: `default-src 'self'`, met per externe bron een uitzondering in `connect-src`, `img-src` en `media-src`.
- Voor WebAssembly: `'wasm-unsafe-eval'` in `script-src`.
- Laat de lokale testserver dezelfde CSP uit `netlify.toml` meesturen (zoals `scripts/server.py` in ikhooreengeluidje), anders zie je blokkades pas live.

**Code**
- `[hidden] { display: none !important }`.
- View transitions tussen pagina's.
- Lettertypen met `preload`.
- `referrerpolicy="no-referrer"` bij externe beelden.

**Testen**
- Playwright met schermafbeeldingen op 360, 390, 768, 1024, 1366 en 1920 px.
- Controleer automatisch op horizontaal scrollen en op fouten in de console (`tests/schermen.js`).
- Klik de interactieve onderdelen door met een testscript: quiz, afspelen, stempel, opslaan.
- Bekijk de schermafbeeldingen zelf: zoekveld dat wegvalt, knoppen over elkaar.

## Valkuilen waar we in liepen

- **CSS overnemen uit een ander project:** knip niet midden in een `@media`-blok. Een open blok zette alle regels erna alleen voor 1000–1500 px aan.
  - Na elke grote CSS-wijziging: tel `{` en `}` (zonder commentaar).
- **`pkill -f` met een woord dat in je eigen opdracht staat, doodt je eigen shell.** Stop een proces via zijn pid, of start servers als achtergrondtaak en stop ze met TaskStop.
- **Wachten met `until pgrep -f …` matcht zichzelf.** Wacht op een pid met `kill -0`.
- **Een lange knoptekst met `white-space: nowrap`** gaf horizontaal scrollen op de telefoon ("Volgend onderzoekje: …").
- **Een spectrogram met lineaire frequentie-as** is onleesbaar. Gebruik een logaritmische as met labels op de juiste hoogte.
- **De automatische keuze uit zoekresultaten is vaak mis.**
  - Bij klanken van Commons kwamen uitspraakbestanden (LL-…) en MIDI boven.
  - Bij iTunes en MusicBrainz kwamen covers en compilaties boven.
  - Filter, en kies de belangrijke dingen met de hand.
- **Zoeken naar een specifiek item:** zoek met een dienst die goed raadt wat je bedoelt (iTunes, of hier misschien Wikipedia of Wikidata), en haal de gegevens daarna met een exacte vraag op.
- **Kun je iets niet zelf zien of horen, zeg dat dan en meet het op een andere manier.** Een spectrogram liet zien dat een klankje maar één noot had in plaats van drie. Een vergelijking met een referentie liet zien hoe goed sporen gescheiden waren.
- **Een bibliotheek kan stilletjes anders doen dan het origineel.** Controleer de uitkomst met een tweede bron voordat je iets belooft.

## Mogelijke bronnen voor het heelal (eerst controleren in fase 1)

**Gegevens over hemellichamen**
- **Wikidata:** massa, straal, afstand, ontdekking, Nederlandse namen, en foto's (P18). CC0.
- **NASA/JPL:**
  - Horizons API (banen en posities)
  - Small-Body Database (kometen, planetoïden)
  - Planetary Fact Sheets
  - Voorwaarden en CORS nakijken.
- **api.le-systeme-solaire.net:** open data over het zonnestelsel, met CORS. Licentie en bijhouden nakijken.
- **Minor Planet Center:** kometen en planetoïden.

**Wat staat er vanavond aan de hemel**
- **Rekenen in de browser:** astronomy-engine (MIT, zonder server) voor zon, maan, planeten, opkomst en ondergang en maanfasen. Locatie alleen in het geheugen, zoals bij Voggels.
- **ISS:** positie via een open API (wheretheiss.at of open-notify), of zelf rekenen uit de baangegevens (TLE van CelesTrak) met satellite.js (MIT). CORS en voorwaarden nakijken.
- **Sterren en sterrenbeelden:**
  - Yale Bright Star Catalog of de Hipparcos-catalogus
  - de lijnen van sterrenbeelden uit Stellarium (GPL voor de software; de data apart nakijken)
  - de IAU-namen
- **Bewolking:** KNMI open data (licentie nakijken). Eerlijk zeggen dat de site niet weet of het bij jou bewolkt is.

**Beeld**
- **NASA Image and Video Library** (images.nasa.gov): meestal publiek domein, maar niet altijd. Per beeld de "credit" nakijken. NASA-logo's mag je niet gebruiken.
- **ESA:** vaak CC BY-SA 3.0 IGO, soms andere voorwaarden. Per beeld nakijken.
- **ESO:** CC BY 4.0.
- **Wikimedia Commons:** via een GitHub Action.
- **Echte foto's** (Voyager, Cassini, Juno, Hubble, JWST, de maanlandingen) **gescheiden houden van kunstenaarsimpressies.** NASA zet die vaak door elkaar.
- **Platen uit oude sterrenatlassen** (Hevelius, Bayer, Flamsteed): publiek domein, net zo mooi als de oude vogelplaten bij Voggels.

**Geluid**
- **NASA-sonificaties** (Chandra, "Sounds of Space") en Voyager-plasmageluiden. Licentie per bestand nakijken.
- **Eerlijk:** in de ruimte is geen geluid. Sonificaties zijn metingen die in geluid zijn omgezet.

**3D**
- **NASA 3D Resources** (glTF-modellen van planeten en ruimtevaartuigen): voorwaarden nakijken.
- Of zelf bollen tekenen met textuurkaarten (Solar System Scope-texturen zijn CC BY 4.0, nakijken). Voggels had een 3D-schets van vogels uit gemeten maten.

## Ideeën voor Onderzoekjes met Fos (4 jaar)

1. **Wat zie je vanavond?** De site zegt welke planeet of de maan je kunt zien en waar (wijzen met de telefoon kan later). Dan samen naar buiten of naar het raam.
2. **De maan houdt een dagboek.** Een week lang elke avond de maan tekenen. De site laat de maanfase van die dag zien.
3. **Hoe groot is de zon?** Het zonnestelsel op schaal in de gang of de tuin: een knikker is de aarde, een strandbal de zon. De site rekent uit hoe ver alles uit elkaar moet.
4. **Welke planeet is dit?** Een foto, drie namen, één is goed. Of: hoor een sonificatie, raad de planeet.
5. **Zwaar en licht.** Hoe zwaar is een knuffel op de maan of op Jupiter? Wegen op de keukenweegschaal, de site rekent het om.
6. **Sterrenbeeld leggen.** De Grote Beer of Cassiopeia met knopen, steentjes of glow-in-the-dark-stickers nabouwen, en dan buiten zoeken.

## Fase 1: eerst een datacheck, dan stoppen

Net als bij Voggels en ikhooreengeluidje: eerst kijken wat er echt aan data is, voordat er iets gebouwd wordt.

- **Een testset van ongeveer 15 hemellichamen:**
  - de zon en de maan
  - alle planeten
  - Pluto en Ceres
  - een paar manen (Io, Europa, Titan)
  - komeet Halley
  - een paar sterren (Poolster, Sirius, Betelgeuze)
  - het ISS
- **Per hemellichaam meten:**
  - Welke gegevens staan in Wikidata, met een Nederlandse naam?
  - Is er een echte foto met een vrije licentie? Van wie, en onder welke licentie? Is het een foto of een impressie?
  - Is er een sonificatie of ander geluid met een licentie die ons gebruik toestaat?
  - Kan de browser uitrekenen waar hij nu aan de hemel staat (astronomy-engine)? Vergelijk één moment met een tweede bron.
  - Werken de API's vanuit de browser (CORS)?
- **Een korte proef:** "wat zie je vanavond" voor één adres in Nederland, voor vanavond. Klopt het met een planetariumprogramma?
- **Rapport in het Nederlands,** in `docs/fase1-datacheck.md`. Scripts en ruwe uitkomsten in `datacheck/`.
- **Daarna stoppen en wachten op mijn akkoord.**

## Open vragen voor mij

- De naam en het domein.
- Een eigen repo: maak ik aan op GitHub. Daarna koppel ik hem zelf aan Netlify.
- Mag de site om je locatie vragen (voor "wat zie je vanavond")? Bij Voggels: alleen in het geheugen, nooit bewaard, ook een adres intikken kan.
- Ook ruimtevaartuigen en astronauten (ISS, Voyager, Apollo), of alleen hemellichamen?
- Een kinderversie met de planeten: ja, neem ik aan.

# Heelal (werktitel): werkafspraken

De volledige achtergrond staat in `docs/briefing.md`. Dit zijn de regels die altijd gelden.

- **Fase 1 is een datacheck.** Niet bouwen voordat Thijs akkoord geeft.
- **Eerlijk over wat de site niet weet.** Geschat of nagemaakt krijgt een label: "simulatie" (mint), "nagekeken" alleen met een bron per feit. Een pagina "Hoe dit werkt / wat de site niet kan".
- **Tekening is geen foto.** Kunstenaarsimpressies krijgen het label "tekening"; bij valse of versterkte kleuren zeggen welke kleuren echt zijn. Een reconstructie of sonificatie is geen opname.
- **Geen cookies en geen tracking.** Wat iemand bijhoudt blijft in localStorage/IndexedDB. Locatie alleen in het geheugen.
- **Browser-first:** statische site (HTML, CSS, losse ES-modules, geen framework, geen build-stap), live via Netlify, data ververst door GitHub Actions. Strikte CSP. `[hidden] { display: none !important }`.
- **Nederlands**, direct en zonder marketingtoon. Let op "de" en "het": de maan, het ISS, de Grote Beer.
- **Geen AI-beelden.** Echte foto's (NASA, ESA, ESO) en tekeningen uit open collecties, met maker en licentie bij elk beeld. Licentie per bron nakijken voordat iets in de repo komt.
- **Wikimedia (Commons, Wikipedia-API) blokkeert gewone machines.** Ophalen via een GitHub Action; Wikidata via één SPARQL-vraag.
- **Code overnemen** uit `sterrenstofai/vogels` en `sterrenstofai/ikhooreengeluidje` in plaats van opnieuw schrijven.
- **Geluid op iOS:** afspelen direct in de tik, zonder `await` ervoor. Gewoon `<audio>`-element.
- **Testen:** Playwright met schermafbeeldingen op 360, 390, 768, 1024, 1366 en 1920 px.

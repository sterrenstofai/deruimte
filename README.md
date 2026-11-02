# De Ruimte (werktitel)

De zon, de maan, de planeten, manen, kometen en sterren, voor ouders en kinderen. Met echte foto's, en uitgerekend in de browser: wat zie je vanavond aan de hemel?

Statische site (HTML, CSS, losse ES-modules, geen framework, geen bouwstap). Netlify publiceert `site/`. Data ververst door GitHub Actions.

## Opbouw

```
site/                 alles wat live gaat
  index.html          één pagina; router in js/app.js
  hoe-dit-werkt.html
  css/stijl.css       één bestand (overgenomen van ikhooreengeluidje)
  js/                 app (router, scherm per hemellichaam), hemel (rekenen), kaart (sterrenkaart), baan (simulatie),
                      hemelkaart (de hemel op het hele scherm), hemel3d (om je heen: stereografisch, Melkweg, landschap),
                      vanavond, plek (locatie, alleen in het geheugen), wikidata (zoeken buiten de lijst),
                      kinderen, onderzoekjes, mijn, geluid; vendor/ astronomy-engine en satellite.js (MIT)
  data/               hemel.json, fotos.json, geluid.json, iss.json, sterren.json, sterrenbeelden.json, melkweg.json (gebouwd)
  fotos/ klanken/ fonts/
data/
  kern.json           de vaste kern van 41 (hemellichamen, ruimtevaartuigen, astronauten), met de hand gekozen
  handwerk/<slug>     weetjes met bron en controlezin, kleur van de foto, zin voor de kinderversie
  foto_keuze.json     welke foto (NASA-id), met de hand gekozen en bekeken
  geluid_keuze.json   welk geluid, en wat voor soort (opname, plasma, sonificatie, reconstructie)
  nagekeken.json      uitkomst van scripts/nakijken.py
  ruw/                automatisch opgehaald
scripts/              ruw_ophalen, sondes_ophalen (JPL Horizons), nakijken, bouw_site_data, fotos_nasa, geluid_ophalen, tle_ophalen, server
tests/                schermen.js (zes breedtes), klikken.js (interactie), rekenen.mjs (tegen JPL Horizons)
datacheck/            fase 1
docs/                 briefing, fase1-datacheck
```

## Lokaal

```bash
python3 scripts/server.py 8765
```

Testen (Playwright staat al op de machine):

```bash
node tests/schermen.js http://localhost:8765 schermen
node tests/klikken.js http://localhost:8765
node tests/rekenen.mjs
```

Data opnieuw bouwen:

```bash
python3 scripts/ruw_ophalen.py && python3 scripts/nakijken.py && python3 scripts/bouw_site_data.py
```

## Een hemellichaam toevoegen

1. Zet het in `data/kern.json` (met lidwoord in `naam`).
2. Schrijf `data/handwerk/<slug>.json`: weetjes met `bron` en een letterlijke `controle`-zin van die bronpagina.
3. Kies een foto in `data/foto_keuze.json`, bekijk hem, en zet in de handlaag of de kleur echt, benaderd, versterkt of vals is.
4. `scripts/ruw_ophalen.py`, `scripts/nakijken.py`, `scripts/fotos_nasa.py`, `scripts/bouw_site_data.py`.

# Datacheck: kaarten voor de draaiende bollen (2 november 2026)

Per hemellichaam: is er een kaart (equirectangulair, 2:1) van echte foto's, van wie, met welke licentie, en is de kleur echt?
Alle download-adressen gaven op 2 november 2026 status 200. De gekozen kaarten staan in `data/bollen_keuze.json`; `scripts/bollen_ophalen.py` haalt ze op en verkleint ze tot 1024 × 512.

Licenties:
- **NASA SVS**: "All of our content is in the public domain (unless otherwise noted)" (svs.gsfc.nasa.gov/help, zelf nagekeken).
- **USGS Astropedia**: per kaart "Access Constraints: public domain" of "None", vaak met "Please cite authors" (Mars zelf nagekeken).
- **NASA (Photojournal, Earth Observatory)**: NASA Images and Media Usage Guidelines; texture maps "generally are not subject to copyright in the United States". Blue Marble vraagt de vermelding "NASA Earth Observatory".

| Hemellichaam | Kaart | Kleur | Gaten | Keuze |
|---|---|---|---|---|
| Maan | NASA SVS CGI Moon Kit (LRO) | ongeveer echt | boven 70° zwart-wit bijgevuld | ja |
| Aarde | Blue Marble Next Generation, dec. 2004 | echt, zonder wolken | diepe oceaan één kleur | ja |
| Mars | Viking, gekleurd (NASA Ames/USGS) | benaderd (groen nagemaakt) | geen | ja |
| Jupiter | Cassini PIA07782 | benaderd, 2 filters | polen wazig; wolken van dec. 2000 | ja |
| Mercurius | MESSENGER MDIS 250m | zwart-wit (kleurkaarten zijn vals/versterkt) | klein | ja |
| Ceres | Dawn FC (DLR) | zwart-wit | klein | ja |
| Pluto | New Horizons 2017 | zwart-wit | zuid van ~30°Z zwart; Charon-kant wazig | ja, met uitleg |
| Charon | New Horizons 2017 | zwart-wit | zuid van ~30°Z zwart | ja, met uitleg |
| Io | Galileo/Voyager kleur | versterkt | Jupiter-kant wazig | ja |
| Europa | Voyager/Galileo 500m | zwart-wit | veel wazig, zuidpool ontbreekt | ja |
| Ganymedes | Voyager/Galileo kleur | vals (rood = infrarood) | naden, zuidpool | ja |
| Callisto | Galileo/Voyager | zwart-wit | zuidpool | ja |
| Enceladus | Cassini (Schenk 2024) | zwart-wit | bijna compleet | ja |
| Triton | Voyager 2 (Schenk) | benaderd/versterkt | noorden zwart (38%) | ja, met uitleg |
| Venus | Magellan | radar van de bodem, geen licht | — | nee: lijkt niet op wat je ziet |
| Titan | Cassini ISS 938 nm | infrarood door de nevel | — | nee: idem |
| Saturnus | geen kaart gevonden (Hubble OPAL niet bereikbaar) | — | — | nee; ringen kunnen later uit Cassini-data (PIA08389, PIA06175, RSS-diepte) |
| Uranus, Neptunus | geen kaart | — | — | nee |
| Zon | verandert elke dag; SDO-kaarten zijn ultraviolet | — | — | nee |
| Eris | nooit van dichtbij gezien | — | — | nee |

// Controleert de rekenmodule van de site (site/js/hemel.js) tegen JPL Horizons (datacheck/uitkomsten/horizons.json)
// en de sterrenkaart-projectie tegen astronomy-engine zelf. Gebruik: node tests/rekenen.mjs
import { readFileSync } from "node:fs";
import { positie, vanavond, avond, A, waarnemer } from "../site/js/hemel.js";
const hemel = JSON.parse(readFileSync(new URL("../site/data/hemel.json", import.meta.url)));
const D = { hemel, perSlug: Object.fromEntries(hemel.map((h) => [h.slug, h])), iss: null };
const hz = JSON.parse(readFileSync(new URL("../datacheck/uitkomsten/horizons.json", import.meta.url)));
const plek = { lat: hz.plek.lat, lon: hz.plek.lon, hoogte: hz.plek.hoogte_m };
const hoek = (a1, h1, a2, h2) => { const r = Math.PI / 180; return Math.acos(Math.min(1, Math.sin(h1 * r) * Math.sin(h2 * r) + Math.cos(h1 * r) * Math.cos(h2 * r) * Math.cos((a1 - a2) * r))) / r * 60; };
// Horizons is zonder breking; positie() rekent met breking. Vergelijk daarom alleen boven 10° hoogte, met een ruime marge voor breking (< 6').
let fout = 0;
for (const [slug, rijen] of Object.entries(hz.uitkomsten)) {
  const h = D.perSlug[slug]; if (!h || slug === "iss") continue;
  hz.momenten_utc.forEach((m, i) => {
    const r = rijen[i]; if (!r || r.fout) return;
    const hh = +r["Elevation_(a-app)"]; if (hh < 10) return;
    const p = positie(h, new Date(m.replace(" ", "T") + ":00Z"), plek, D);
    const v = hoek(p.az, p.hoogte, +r["Azimuth_(a-app)"], hh);
    const max = slug === "titan" ? 8 : 6;
    if (v > max) { fout++; console.log(`TE GROOT ${slug} ${m}: ${v.toFixed(2)}'`); }
    else console.log(`ok ${slug.padEnd(10)} ${m} ${v.toFixed(2)}'`);
  });
}
// de projectie van de sterrenkaart (zelfde formule als in kaart.js) tegen HorizonFromVector
const t = A.MakeTime(new Date("2026-11-02T20:00:00Z")), obs = waarnemer(plek), rot = A.Rotation_EQJ_HOR(t, obs).rot, rad = Math.PI / 180;
for (const [ra, dec] of [[37.95, 89.26], [101.29, -16.72], [279.23, 38.78]]) {
  const cd = Math.cos(dec * rad), x = cd * Math.cos(ra * rad), y = cd * Math.sin(ra * rad), z = Math.sin(dec * rad);
  const hx = rot[0][0] * x + rot[1][0] * y + rot[2][0] * z, hy = rot[0][1] * x + rot[1][1] * y + rot[2][1] * z, hzz = rot[0][2] * x + rot[1][2] * y + rot[2][2] * z;
  const mijn = { az: ((Math.atan2(-hy, hx) / rad) + 360) % 360, h: Math.asin(hzz) / rad };
  const ref = A.HorizonFromVector(A.RotateVector(A.Rotation_EQJ_HOR(t, obs), new A.Vector(x, y, z, t)), null);
  const v = hoek(mijn.az, mijn.h, ref.lon, ref.lat);
  if (v > 0.01) { fout++; console.log("projectie wijkt af", ra, dec, v); } else console.log(`ok projectie ${ra},${dec}`);
}
const av = avond(new Date("2026-11-02T20:00:00Z"), plek);
console.log("zon onder", av.zonOnder.toISOString(), "(Skyfield: 15:59 UTC midden, bovenrand ±2 min later)");
const v = vanavond(D, plek, new Date("2026-11-02T20:00:00Z"));
console.log("vanavond tot middernacht:", v.lijst.map((x) => x.item.slug).join(", "));
console.log(fout ? `${fout} fouten` : "alles binnen de marge");
process.exit(fout ? 1 : 0);

// Rekent met astronomy-engine (MIT, draait ook in de browser) waar elk hemellichaam uit de
// testset staat, gezien vanaf PLEK, op dezelfde momenten als horizons.py, en legt het naast
// JPL Horizons. Wat astronomy-engine niet kent, rekenen we zelf:
//  - Io en Europa: JupiterMoons() (zit wel in astronomy-engine)
//  - Titan: niet in astronomy-engine; we nemen Saturnus en meten hoe ver Titan daarvan staat
//  - Ceres en Halley: Kepler-baan uit de JPL Small-Body Database (zonder storingen door planeten)
//  - sterren: DefineStar() met RA/Dec J2000 uit Wikidata (Hipparcos)
//  - ISS: satellite.js (SGP4) met de TLE van wheretheiss.at
// Schrijft uitkomsten/posities.json. Draaien: node posities.mjs
import * as A from "astronomy-engine";
import * as sat from "satellite.js";
import { readFileSync, writeFileSync } from "node:fs";

const U = new URL("./uitkomsten/", import.meta.url);
const hz = JSON.parse(readFileSync(new URL("horizons.json", U)));
const sb = JSON.parse(readFileSync(new URL("sbdb.json", U)));
const P = hz.plek;
const obs = new A.Observer(P.lat, P.lon, P.hoogte_m);
const momenten = hz.momenten_utc.map((m) => new Date(m.replace(" ", "T") + ":00Z"));

const PLANEET = { zon: "Sun", maan: "Moon", mercurius: "Mercury", venus: "Venus", mars: "Mars", jupiter: "Jupiter",
  saturnus: "Saturn", uranus: "Uranus", neptunus: "Neptune", pluto: "Pluto", titan: "Saturn" };
const STER = { poolster: [37.95456067, 89.26410897, 7.54], sirius: [101.287155333, -16.716115861, 379.21], betelgeuze: [88.792938991, 7.407063995, 6.55] };

function horVanVector(vEqj, t) { // topocentrische vector (EQJ, AE) -> azimut/hoogte, zonder breking
  const rot = A.Rotation_EQJ_HOR(t, obs);
  const h = A.RotateVector(rot, vEqj);
  const s = A.HorizonFromVector(h, null);
  return { az: s.lon, hoogte: s.lat };
}
function kepler(el, t) { // heliocentrische positie (EQJ, AE) uit oskulerende elementen
  const g = (n) => parseFloat(el.orbit.elements.find((e) => e.name === n).value);
  const e = g("e"), a = g("a"), i = g("i") * Math.PI / 180, om = g("om") * Math.PI / 180, w = g("w") * Math.PI / 180;
  const n = g("n") * Math.PI / 180, tp = g("tp"); // n in graden/dag, tp in JD (TDB)
  const jd = t.tt + 2451545.0;
  let M = n * (jd - tp);
  M = ((M % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
  let E = e < 0.8 ? M : Math.PI * Math.sign(M) || M;
  for (let k = 0; k < 200; k++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  const x = a * (Math.cos(E) - e), y = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const cO = Math.cos(om), sO = Math.sin(om), cw = Math.cos(w), sw = Math.sin(w), ci = Math.cos(i), si = Math.sin(i);
  const X = (cO * cw - sO * sw * ci) * x + (-cO * sw - sO * cw * ci) * y;
  const Y = (sO * cw + cO * sw * ci) * x + (-sO * sw + cO * cw * ci) * y;
  const Z = (sw * si) * x + (cw * si) * y;
  return A.RotateVector(A.Rotation_ECL_EQJ(), new A.Vector(X, Y, Z, t));
}
function verschilGraden(a1, h1, a2, h2) { // hoek tussen twee richtingen aan de hemel
  const r = Math.PI / 180;
  const c = Math.sin(h1 * r) * Math.sin(h2 * r) + Math.cos(h1 * r) * Math.cos(h2 * r) * Math.cos((a1 - a2) * r);
  return Math.acos(Math.min(1, Math.max(-1, c))) / r;
}
const tle = JSON.parse(readFileSync(new URL("iss_tle.json", U)));
const satrec = sat.twoline2satrec(tle.line1, tle.line2);

function bereken(key, datum) {
  const t = A.MakeTime(datum);
  if (STER[key]) {
    const [ra, dec, par] = STER[key];
    A.DefineStar(A.Body.Star1, ra / 15, dec, 3.2616 / (par / 1000));
    const eq = A.Equator(A.Body.Star1, t, obs, true, true);
    const h = A.Horizon(t, obs, eq.ra, eq.dec, null);
    return { az: h.azimuth, hoogte: h.altitude };
  }
  if (PLANEET[key]) {
    const eq = A.Equator(A.Body[PLANEET[key]], t, obs, true, true);
    const h = A.Horizon(t, obs, eq.ra, eq.dec, null);
    return { az: h.azimuth, hoogte: h.altitude };
  }
  const obsv = A.ObserverVector(t, obs, false);
  if (key === "io" || key === "europa") {
    const jv = A.GeoVector(A.Body.Jupiter, t, true);
    const lt = jv.Length() / A.C_AUDAY; // maanpositie op het moment dat het licht vertrok
    const m = A.JupiterMoons(t.AddDays(-lt))[key];
    return horVanVector(new A.Vector(jv.x + m.x - obsv.x, jv.y + m.y - obsv.y, jv.z + m.z - obsv.z, t), t);
  }
  if (key === "ceres" || key === "halley") {
    const el = sb[key === "ceres" ? "1" : "1P"];
    const aarde = A.HelioVector(A.Body.Earth, t);
    let v = kepler(el, t), lt = 0;
    for (let k = 0; k < 3; k++) { // lichttijd
      const g = new A.Vector(v.x - aarde.x, v.y - aarde.y, v.z - aarde.z, t);
      lt = g.Length() / A.C_AUDAY;
      v = kepler(el, t.AddDays(-lt));
    }
    return horVanVector(new A.Vector(v.x - aarde.x - obsv.x, v.y - aarde.y - obsv.y, v.z - aarde.z - obsv.z, t), t);
  }
  if (key === "iss") {
    const pv = sat.propagate(satrec, datum);
    const gmst = sat.gstime(datum);
    const ecf = sat.eciToEcf(pv.position, gmst);
    const la = sat.ecfToLookAngles({ longitude: sat.degreesToRadians(P.lon), latitude: sat.degreesToRadians(P.lat), height: P.hoogte_m / 1000 }, ecf);
    return { az: sat.radiansToDegrees(la.azimuth), hoogte: sat.radiansToDegrees(la.elevation) };
  }
  return null;
}

const uit = {};
let rij = [];
for (const [key, rijen] of Object.entries(hz.uitkomsten)) {
  uit[key] = [];
  momenten.forEach((d, i) => {
    const r = rijen[i];
    if (!r || r.fout) return;
    const h = { az: parseFloat(r["Azimuth_(a-app)"]), hoogte: parseFloat(r["Elevation_(a-app)"]) };
    const a = bereken(key, d);
    if (!a) return;
    const v = verschilGraden(a.az, a.hoogte, h.az, h.hoogte);
    uit[key].push({ utc: d.toISOString(), horizons: h, astronomy_engine: a, verschil_boogminuten: +(v * 60).toFixed(3) });
  });
  const vs = uit[key].map((x) => x.verschil_boogminuten);
  const m = uit[key][1];
  console.log(`${key.padEnd(10)} hoogte ${m.horizons.hoogte.toFixed(2).padStart(7)}° az ${m.horizons.az.toFixed(1).padStart(6)}°  | verschil met Horizons: max ${Math.max(...vs).toFixed(2)}' (boogminuten)`);
}
writeFileSync(new URL("posities.json", U), JSON.stringify({ plek: P, tle, uit }, null, 1));

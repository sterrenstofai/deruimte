// Proef "Wat zie je vanavond?" voor PLEK, voor de avond van 2 november 2026, alleen met
// astronomy-engine en satellite.js (allebei MIT, allebei bruikbaar in de browser zonder server).
// Legt de uitkomst naast Skyfield (uitkomsten/skyfield.json). Schrijft uitkomsten/vanavond.json.
import * as A from "astronomy-engine";
import * as sat from "satellite.js";
import { readFileSync, writeFileSync } from "node:fs";
const U = new URL("./uitkomsten/", import.meta.url);
const hz = JSON.parse(readFileSync(new URL("horizons.json", U)));
const sf = JSON.parse(readFileSync(new URL("skyfield.json", U)));
const tle = JSON.parse(readFileSync(new URL("iss_tle.json", U)));
const P = hz.plek, obs = new A.Observer(P.lat, P.lon, P.hoogte_m);
const NL = (d) => d.toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam", hour: "2-digit", minute: "2-digit" });
const RICHTING = ["noord", "noordoost", "oost", "zuidoost", "zuid", "zuidwest", "west", "noordwest"];
const richting = (az) => RICHTING[Math.round(az / 45) % 8];
const NAAM = { Moon: "de maan", Mercury: "Mercurius", Venus: "Venus", Mars: "Mars", Jupiter: "Jupiter", Saturn: "Saturnus", Uranus: "Uranus", Neptune: "Neptunus" };

const start = A.MakeTime(new Date("2026-11-02T12:00:00Z"));
const zonOnder = A.SearchRiseSet(A.Body.Sun, obs, -1, start, 1).date;
const schemer = A.SearchAltitude(A.Body.Sun, obs, -1, start, 1, -6).date;   // burgerlijke schemering voorbij
const donker = A.SearchAltitude(A.Body.Sun, obs, -1, start, 1, -12).date;   // nautische schemering voorbij
const uit = { plek: P, zon_onder: zonOnder, schemering_voorbij: schemer, donker: donker, hemel: [], maan: {}, iss: [], sterren: [], vergelijking: {} };

// planeten en maan: om het half uur van de schemering tot middernacht, hoogte > 5 graden?
const eind = new Date("2026-11-02T23:00:00Z");
for (const b of Object.keys(NAAM)) {
  let zichtbaar = [];
  for (let d = new Date(schemer); d <= eind; d = new Date(+d + 30 * 60e3)) {
    const t = A.MakeTime(d), eq = A.Equator(A.Body[b], t, obs, true, true), h = A.Horizon(t, obs, eq.ra, eq.dec, "normal");
    if (h.altitude > 5) zichtbaar.push({ tijd: NL(d), hoogte: Math.round(h.altitude), richting: richting(h.azimuth) });
  }
  const mag = A.Illumination(A.Body[b], A.MakeTime(new Date("2026-11-02T19:00:00Z"))).mag;
  const op = A.SearchRiseSet(A.Body[b], obs, +1, start, 1), onder = A.SearchRiseSet(A.Body[b], obs, -1, start, 1);
  uit.hemel.push({ naam: NAAM[b], helderheid: +mag.toFixed(1), met_blote_oog: mag < 5.5, op: op && op.date, onder: onder && onder.date, zichtbaar });
}
const fase = A.MoonPhase(A.MakeTime(new Date("2026-11-02T19:00:00Z")));
const ill = A.Illumination(A.Body.Moon, A.MakeTime(new Date("2026-11-02T19:00:00Z")));
uit.maan = { fasehoek: +fase.toFixed(1), verlicht_procent: +(ill.phase_fraction * 100).toFixed(1),
  volgende_fasen: [0, 1, 2, 3].map((q) => { const f = A.SearchMoonQuarter(start); return null; }) };
let mq = A.SearchMoonQuarter(start); uit.maan.volgende_fasen = [];
for (let i = 0; i < 4; i++) { uit.maan.volgende_fasen.push({ fase: ["nieuwe maan", "eerste kwartier", "volle maan", "laatste kwartier"][mq.quarter], datum: mq.time.date }); mq = A.NextMoonQuarter(mq); }

// sterren
const STER = { poolster: [37.95456067, 89.26410897, 7.54], sirius: [101.287155333, -16.716115861, 379.21], betelgeuze: [88.792938991, 7.407063995, 6.55] };
for (const [k, [ra, dec, par]] of Object.entries(STER)) {
  A.DefineStar(A.Body.Star1, ra / 15, dec, 3.2616 / (par / 1000));
  const verschillen = hz.momenten_utc.map((m, i) => {
    const t = A.MakeTime(new Date(m.replace(" ", "T") + ":00Z"));
    const eq = A.Equator(A.Body.Star1, t, obs, true, true), h = A.Horizon(t, obs, eq.ra, eq.dec, null);
    const s = sf.sterren[k][i];
    return { utc: m, az: +h.azimuth.toFixed(3), hoogte: +h.altitude.toFixed(3), skyfield_az: +s.az.toFixed(3), skyfield_hoogte: +s.hoogte.toFixed(3) };
  });
  const op = A.SearchRiseSet(A.Body.Star1, obs, +1, start, 1);
  uit.sterren.push({ ster: k, op: op ? op.date : "gaat niet onder", posities: verschillen });
}

// ISS: elke 10 seconden, overgangen boven 10 graden; zichtbaar als het ISS in de zon staat en het bij jou donker is
const satrec = sat.twoline2satrec(tle.line1, tle.line2);
let bezig = null;
for (let d = new Date("2026-11-02T15:00:00Z"); d < new Date("2026-11-03T06:00:00Z"); d = new Date(+d + 10e3)) {
  const pv = sat.propagate(satrec, d), gm = sat.gstime(d);
  const la = sat.ecfToLookAngles({ longitude: P.lon * Math.PI / 180, latitude: P.lat * Math.PI / 180, height: P.hoogte_m / 1000 }, sat.eciToEcf(pv.position, gm));
  const hoog = la.elevation * 180 / Math.PI;
  if (hoog > 10) {
    if (!bezig) bezig = { op: d, max: 0 };
    if (hoog > bezig.max) { bezig.max = hoog; bezig.top = d; bezig.az = la.azimuth * 180 / Math.PI;
      // ISS in de zon? Schaduwtest met de aarde als bol (cilinder-schaduw)
      const t = A.MakeTime(d), zon = A.GeoVector(A.Body.Sun, t, false);
      const zl = zon.Length(), s = [zon.x / zl, zon.y / zl, zon.z / zl];
      // satelliet ECI (km, TEME ~ van datum) -> AE in dezelfde richting als J2000 is hier goed genoeg voor een schaduwtest
      const r = pv.position, rk = [r.x, r.y, r.z], dot = rk[0] * s[0] + rk[1] * s[1] + rk[2] * s[2];
      const perp = Math.hypot(rk[0] - dot * s[0], rk[1] - dot * s[1], rk[2] - dot * s[2]);
      bezig.in_zon = dot > 0 || perp > 6371;
      const zt = A.Equator(A.Body.Sun, t, obs, true, true); bezig.zon_hoogte = A.Horizon(t, obs, zt.ra, zt.dec, null).altitude;
    }
  } else if (bezig) {
    uit.iss.push({ op: bezig.op, top: bezig.top, onder: d, max_hoogte: +bezig.max.toFixed(1), richting_top: richting(bezig.az),
      iss_in_zon: bezig.in_zon, zon_hoogte: +bezig.zon_hoogte.toFixed(1), zichtbaar: bezig.in_zon && bezig.zon_hoogte < -6 });
    bezig = null;
  }
}

// vergelijken met Skyfield
const minuten = (a, b) => +((new Date(a) - new Date(b)) / 60e3).toFixed(2);
const sfOp = (k, wat) => (sf.op_onder[k] || []).find((x) => x.wat === wat && new Date(x.utc) > new Date("2026-11-02T12:00:00Z"));
const kaart = { Moon: "maan", Mercury: "mercurius", Venus: "venus", Mars: "mars", Jupiter: "jupiter", Saturn: "saturnus" };
uit.vergelijking.op_onder_minuten = { zon_onder: minuten(zonOnder, sfOp("zon", "onder").utc) };
for (const h of uit.hemel) {
  const k = Object.entries(NAAM).find(([, n]) => n === h.naam)[0];
  if (!kaart[k]) continue;
  const a = sfOp(kaart[k], "op"), o = sfOp(kaart[k], "onder");
  uit.vergelijking.op_onder_minuten[kaart[k]] = { op: a && h.op ? minuten(h.op, a.utc) : null, onder: o && h.onder ? minuten(h.onder, o.utc) : null };
}
uit.vergelijking.iss_top_seconden = uit.iss.map((p) => {
  const s = sf.iss.filter((x) => x.wat === "hoogste punt").map((x) => (new Date(p.top) - new Date(x.utc)) / 1e3);
  return s.reduce((a, b) => (Math.abs(b) < Math.abs(a) ? b : a), 1e9);
});
writeFileSync(new URL("vanavond.json", U), JSON.stringify(uit, null, 1));

// uitdraai in gewone taal
console.log(`Vanavond in ${P.naam}, maandag 2 november 2026`);
console.log(`Zon onder ${NL(zonOnder)}, schemering voorbij ${NL(schemer)}, echt donker ${NL(donker)}.`);
for (const h of uit.hemel) {
  if (!h.zichtbaar.length) { console.log(`- ${h.naam}: niet te zien tussen ${NL(schemer)} en 00:00 (${h.op ? "komt op " + NL(h.op) : ""}).`); continue; }
  const z = h.zichtbaar;
  console.log(`- ${h.naam}: van ${z[0].tijd} tot ${z.at(-1).tijd}, eerst ${z[0].hoogte}° hoog in het ${z[0].richting}, helderheid ${h.helderheid}${h.met_blote_oog ? "" : " (niet met het blote oog)"}.`);
}
console.log(`Maan: ${uit.maan.verlicht_procent}% verlicht, fasehoek ${uit.maan.fasehoek}° (afnemend). Volgende: ${uit.maan.volgende_fasen.map((f) => f.fase + " " + new Date(f.datum).toISOString().slice(0, 10)).join(", ")}`);
for (const s of uit.sterren) console.log(`- ${s.ster}: komt op ${typeof s.op === "string" ? s.op : NL(s.op)}; 20:00 hoogte ${s.posities[1].hoogte}° (Skyfield ${s.posities[1].skyfield_hoogte}°)`);
for (const p of uit.iss) console.log(`- ISS ${NL(p.op)}–${NL(p.onder)}, max ${p.max_hoogte}° in het ${p.richting_top}, in de zon: ${p.iss_in_zon}, zon ${p.zon_hoogte}° → ${p.zichtbaar ? "ZICHTBAAR" : "niet zichtbaar"}`);
console.log("Verschil met Skyfield (minuten):", JSON.stringify(uit.vergelijking.op_onder_minuten));
console.log("ISS hoogste punt, verschil met Skyfield (s):", uit.vergelijking.iss_top_seconden.join(", "));

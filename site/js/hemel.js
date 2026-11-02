// Rekenen aan de hemel, helemaal in de browser. Getest in fase 1 tegen JPL Horizons en Skyfield:
// zon, maan, planeten en Pluto binnen 0,3 boogminuut; op- en ondergang op de minuut; ISS op seconden.
// - astronomy-engine (MIT, Don Cross): zon, maan, planeten, manen van Jupiter, sterren
// - satellite.js (MIT): het ISS uit de baangegevens (TLE), elke dag ververst door een GitHub Action
// - Ceres, Eris en kometen: een Kepler-baan uit de JPL Small-Body Database (zonder storingen door planeten)
import * as A from "./vendor/astronomy.js";
import { twoline2satrec } from "./vendor/satellite/io.js";
import { propagate, gstime } from "./vendor/satellite/propagation.js";
import { eciToEcf, ecfToLookAngles, eciToGeodetic } from "./vendor/satellite/transforms.js";

export { A };
// Als je nog geen plek hebt gekozen: het midden van Nederland. Tussen Groningen en Maastricht scheelt dat hooguit een paar minuten.
export const MIDDEN = { naam: "het midden van Nederland (De Bilt)", lat: 52.101, lon: 5.178, standaard: true };

const RICHTING = ["noorden", "noordoosten", "oosten", "zuidoosten", "zuiden", "zuidwesten", "westen", "noordwesten"];
export const richting = (az) => RICHTING[Math.round(((az % 360) + 360) % 360 / 45) % 8];
export const richtingKort = (az) => ["N", "NO", "O", "ZO", "Z", "ZW", "W", "NW"][Math.round(((az % 360) + 360) % 360 / 45) % 8];
export const klok = (d) => d ? new Date(d).toLocaleTimeString("nl-NL", { timeZone: "Europe/Amsterdam", hour: "2-digit", minute: "2-digit" }) : "";
export const dag = (d) => new Date(d).toLocaleDateString("nl-NL", { timeZone: "Europe/Amsterdam", weekday: "long", day: "numeric", month: "long" });
const MANEN_JUPITER = { io: "io", europa: "europa", ganymedes: "ganymede", callisto: "callisto" };
const waarnemer = (p) => new A.Observer(p.lat, p.lon, p.hoogte || 0);

function horVanVector(v, t, obs) {
  const h = A.RotateVector(A.Rotation_EQJ_HOR(t, obs), v);
  const s = A.HorizonFromVector(h, "normal");
  return { az: s.lon, hoogte: s.lat };
}

function kepler(k, t) { // heliocentrische positie (EQJ, AE) uit oskulerende elementen
  const r = Math.PI / 180, e = k.e, a = k.a, i = k.i * r, om = k.om * r, w = k.w * r, n = k.n * r;
  let M = n * (t.tt + 2451545.0 - k.tp);
  M = ((M % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
  let E = e < 0.8 ? M : Math.PI * (Math.sign(M) || 1);
  for (let j = 0; j < 100; j++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  const x = a * (Math.cos(E) - e), y = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const cO = Math.cos(om), sO = Math.sin(om), cw = Math.cos(w), sw = Math.sin(w), ci = Math.cos(i), si = Math.sin(i);
  const v = new A.Vector((cO * cw - sO * sw * ci) * x + (-cO * sw - sO * cw * ci) * y,
    (sO * cw + cO * sw * ci) * x + (-sO * sw + cO * cw * ci) * y, sw * si * x + cw * si * y, t);
  return A.RotateVector(A.Rotation_ECL_EQJ(), v);
}

// Heliocentrische positie in AE (EQJ) voor de baan-tekening
export function helio(item, datum) {
  const t = A.MakeTime(datum);
  if (item.ae && item.ae !== "Moon" && item.ae !== "Sun") return A.HelioVector(A.Body[item.ae], t);
  if (item.slug === "aarde") return A.HelioVector(A.Body.Earth, t);
  if (item.baan?.kepler) return kepler(item.baan.kepler, t);
  return null;
}

let satCache = null;
function satrec(tle) {
  if (!satCache || satCache.l1 !== tle.line1) satCache = { l1: tle.line1, rec: twoline2satrec(tle.line1, tle.line2) };
  return satCache.rec;
}
export function issNu(tle, datum = new Date()) {
  const pv = propagate(satrec(tle), datum);
  if (!pv?.position) return null;
  const g = eciToGeodetic(pv.position, gstime(datum));
  return { lat: g.latitude * 180 / Math.PI, lon: g.longitude * 180 / Math.PI, hoogte_km: g.height };
}

// Ruimtesondes: hun plek komt van JPL Horizons (een Action haalt die elke maand op, per dag voor de komende twee maanden).
// Hier alleen tussen twee dagen in schatten. Geeft { ra, dec, km } of null als de gegevens te oud zijn.
const MAANDEN = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
export function sondeNu(D, slug, datum = new Date()) {
  const rijen = D?.sondes?.[slug]?.nu;
  if (!rijen) return null;
  const t = (r) => { const [j, m, d] = r[0].split("-"); return Date.UTC(+j, MAANDEN[m], +d); };
  for (let i = 0; i < rijen.length - 1; i++) {
    const a = t(rijen[i]), b = t(rijen[i + 1]);
    if (+datum >= a && +datum <= b) {
      const f = (+datum - a) / (b - a), r0 = rijen[i], r1 = rijen[i + 1];
      return { ra: r0[1] + (r1[1] - r0[1]) * f, dec: r0[2] + (r1[2] - r0[2]) * f, km: r0[3] + (r1[3] - r0[3]) * f };
    }
  }
  return null;
}
function sondeAlsSter(D, item, datum) {
  const s = sondeNu(D, item.sonde, datum);
  if (!s) return null;
  // voor op- en ondergang: als een (zeer verre) ster; astronomy-engine wil minstens 1 lichtjaar
  A.DefineStar(A.Body.Star2, s.ra / 15, s.dec, Math.max(1, s.km / 9.4607e12));
  return { body: A.Body.Star2, ...s };
}

// Waar staat het? { az, hoogte, mag, bij } of null (de aarde; of geen gegevens)
// bij: als het te klein is om los te zien, het hemellichaam waar het vlak naast staat
export function positie(item, datum, plek, D) {
  const obs = waarnemer(plek), t = A.MakeTime(datum);
  if (item.slug === "aarde") return null;
  if (item.ae) {
    const eq = A.Equator(A.Body[item.ae], t, obs, true, true);
    const h = A.Horizon(t, obs, eq.ra, eq.dec, "normal");
    let mag = null;
    try { mag = A.Illumination(A.Body[item.ae], t).mag; } catch {}
    return { az: h.azimuth, hoogte: h.altitude, mag, afstand_ae: eq.dist };
  }
  if (item.baan?.ster) {
    const s = item.baan.ster;
    A.DefineStar(A.Body.Star1, s.ra / 15, s.dec, 3.26156 / (s.parallax_mas / 1000));
    const eq = A.Equator(A.Body.Star1, t, obs, true, true);
    const h = A.Horizon(t, obs, eq.ra, eq.dec, "normal");
    return { az: h.azimuth, hoogte: h.altitude };
  }
  if (MANEN_JUPITER[item.slug]) {
    const jv = A.GeoVector(A.Body.Jupiter, t, true), lt = jv.Length() / A.C_AUDAY;
    const m = A.JupiterMoons(t.AddDays(-lt))[MANEN_JUPITER[item.slug]];
    const o = A.ObserverVector(t, obs, false);
    const p = horVanVector(new A.Vector(jv.x + m.x - o.x, jv.y + m.y - o.y, jv.z + m.z - o.z, t), t, obs);
    return { ...p, bij: "jupiter" };
  }
  if (item.baan?.kepler) {
    const aarde = A.HelioVector(A.Body.Earth, t), o = A.ObserverVector(t, obs, false);
    let v = kepler(item.baan.kepler, t);
    for (let k = 0; k < 3; k++) {
      const lt = Math.hypot(v.x - aarde.x, v.y - aarde.y, v.z - aarde.z) / A.C_AUDAY;
      v = kepler(item.baan.kepler, t.AddDays(-lt));
    }
    return { ...horVanVector(new A.Vector(v.x - aarde.x - o.x, v.y - aarde.y - o.y, v.z - aarde.z - o.z, t), t, obs), afstand_ae: Math.hypot(v.x - aarde.x, v.y - aarde.y, v.z - aarde.z) };
  }
  if (item.sonde && sondeNu(D, item.sonde, datum)) {
    const z = sondeNu(D, item.sonde, datum);
    // vector vanuit het middelpunt van de aarde (AE, J2000), min de plek van de waarnemer: dat telt voor de Webb-telescoop
    const r = Math.PI / 180, ae = z.km / 149597870.7, cd = Math.cos(z.dec * r), o = A.ObserverVector(t, obs, false);
    const p = horVanVector(new A.Vector(ae * cd * Math.cos(z.ra * r) - o.x, ae * cd * Math.sin(z.ra * r) - o.y, ae * Math.sin(z.dec * r) - o.z, t), t, obs);
    return { ...p, afstand_km: z.km, ...(item.ouder ? { bij: item.ouder } : {}) };
  }
  if (item.plek && D) {
    const ouder = D.perSlug[item.plek];
    const p = ouder && positie(ouder, datum, plek, D);
    return p ? { az: p.az, hoogte: p.hoogte, bij: item.plek } : null;
  }
  if (item.slug === "iss") {
    const tle = D?.iss;
    if (!tle) return null;
    const pv = propagate(satrec(tle), datum);
    if (!pv?.position) return null;
    const la = ecfToLookAngles({ longitude: plek.lon * Math.PI / 180, latitude: plek.lat * Math.PI / 180, height: (plek.hoogte || 0) / 1000 }, eciToEcf(pv.position, gstime(datum)));
    return { az: la.azimuth * 180 / Math.PI, hoogte: la.elevation * 180 / Math.PI, afstand_km: la.rangeSat };
  }
  if (item.ouder && D) { // kleine manen: vlak bij hun planeet
    const ouder = D.perSlug[item.ouder];
    const p = ouder && positie(ouder, datum, plek, D);
    return p ? { az: p.az, hoogte: p.hoogte, bij: item.ouder } : null;
  }
  return null;
}

// Op en onder in de komende 24 uur. Voor manen: die van hun planeet. Voor het ISS: niet (zie issOvergangen).
export function opOnder(item, datum, plek, D) {
  const obs = waarnemer(plek), t = A.MakeTime(datum);
  let body = null;
  if (item.ae) body = A.Body[item.ae];
  else if (item.baan?.ster) { const s = item.baan.ster; A.DefineStar(A.Body.Star1, s.ra / 15, s.dec, 3.26156 / (s.parallax_mas / 1000)); body = A.Body.Star1; }
  else if (MANEN_JUPITER[item.slug]) body = A.Body.Jupiter;
  else if (item.sonde && sondeNu(D, item.sonde, datum)) body = sondeAlsSter(D, item, datum)?.body;
  else if (item.sonde && D?.perSlug[item.ouder]?.ae) body = A.Body[D.perSlug[item.ouder].ae];
  else if (item.plek && D?.perSlug[item.plek]?.ae) body = A.Body[D.perSlug[item.plek].ae];
  else if (item.ouder && D?.perSlug[item.ouder]?.ae) body = A.Body[D.perSlug[item.ouder].ae];
  if (!body) return null;
  const op = A.SearchRiseSet(body, obs, +1, t, 1), onder = A.SearchRiseSet(body, obs, -1, t, 1);
  const hoog = A.SearchHourAngle(body, obs, 0, t, +1);
  return { op: op?.date || null, onder: onder?.date || null, hoogst: hoog?.time.date || null, hoogsteHoogte: hoog?.hor.altitude };
}

// Uur en minuut in Nederland, ook als de browser in een andere tijdzone staat
function nlTijd(d) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Amsterdam", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(d).map((x) => [x.type, x.value]));
  return { u: +p.hour, m: +p.minute };
}
// 12 uur 's middags (Nederlandse tijd) van de avond waar het om gaat. Na middernacht tot 6 uur 's ochtends: nog de avond ervoor.
function middagVan(datum) {
  const { u, m } = nlTijd(datum);
  const terug = (u < 6 ? u + 12 : u - 12) * 60 + m;
  return new Date(+datum - terug * 60e3);
}
export function middernachtNa(d) { const { u, m } = nlTijd(d); return new Date(+d + ((24 - u) * 60 - m) * 60e3); }

// De avond van een datum: zon onder, schemering voorbij (zon 6° onder de horizon), echt donker (12°), en de ochtend
export function avond(datum, plek) {
  const obs = waarnemer(plek);
  const middag = middagVan(datum);
  const t = A.MakeTime(middag);
  const s = (dir, h) => A.SearchAltitude(A.Body.Sun, obs, dir, t, 1, h)?.date || null;
  return { zonOnder: A.SearchRiseSet(A.Body.Sun, obs, -1, t, 1)?.date, schemering: s(-1, -6), donker: s(-1, -12),
    ochtend: s(+1, -6), zonOp: A.SearchRiseSet(A.Body.Sun, obs, +1, t, 1)?.date };
}

const FASEN = [[0, "nieuwe maan"], [22.5, "wassende sikkel"], [67.5, "eerste kwartier"], [112.5, "wassende maan"], [157.5, "volle maan"], [202.5, "afnemende maan"], [247.5, "laatste kwartier"], [292.5, "afnemende sikkel"], [337.5, "nieuwe maan"]];
export function maanfase(datum) {
  const t = A.MakeTime(datum);
  const hoek = A.MoonPhase(t), ill = A.Illumination(A.Body.Moon, t);
  const naam = [...FASEN].reverse().find(([h]) => hoek >= h)[1];
  const kwartieren = [];
  let q = A.SearchMoonQuarter(t);
  for (let i = 0; i < 4; i++) { kwartieren.push({ naam: ["nieuwe maan", "eerste kwartier", "volle maan", "laatste kwartier"][q.quarter], datum: q.time.date }); q = A.NextMoonQuarter(q); }
  return { hoek, verlicht: ill.phase_fraction, naam, kwartieren };
}

// Wat zie je vanavond? Van het eind van de schemering tot middernacht (of tot de ochtend, als je wilt).
// Per hemellichaam: wanneer het het hoogst staat, hoe hoog en in welke richting, en of je het met het blote oog ziet.
export function vanavond(D, plek, datum = new Date(), { tot = "middernacht" } = {}) {
  const av = avond(datum, plek);
  const start = av.schemering || av.zonOnder;
  const eind = tot === "ochtend" ? av.ochtend : middernachtNa(start);
  const kandidaten = D.hemel.filter((h) => h.ae && h.ae !== "Sun" || h.baan?.ster || ["ceres", "halley", "tsjoerjoemov", "eris"].includes(h.slug));
  const uit = [];
  for (const h of kandidaten) {
    let best = null, eerste = null, laatste = null;
    for (let tt = +start; tt <= +eind; tt += 10 * 60e3) {
      const p = positie(h, new Date(tt), plek, D);
      if (!p) break;
      if (p.hoogte > 8) { eerste ??= tt; laatste = tt; if (!best || p.hoogte > best.hoogte) best = { ...p, tijd: tt }; }
    }
    if (!best) continue;
    const mag = best.mag ?? (h.baan?.ster ? sterMag(h) : null);
    uit.push({ item: h, ...best, van: eerste, tot: laatste, mag, blootOog: mag != null && mag < 5.5 });
  }
  uit.sort((a, b) => (a.mag ?? 99) - (b.mag ?? 99));
  return { ...av, start, eind, lijst: uit };
}
function sterMag(h) {
  const c = h.cijfers.find((c) => c.naam === "Helderheid");
  return c ? parseFloat(c.tekst.replace(",", ".")) : null;
}

// ISS-overgangen boven 10°, met de vraag of je hem ziet: het ISS moet in de zon staan en het bij jou donker zijn.
export function issOvergangen(tle, plek, van, uren = 36) {
  if (!tle) return [];
  const rec = satrec(tle), obs = waarnemer(plek), uit = [];
  let bezig = null;
  for (let d = +van; d < +van + uren * 3600e3; d += 10e3) {
    const datum = new Date(d), pv = propagate(rec, datum);
    if (!pv?.position) continue;
    const la = ecfToLookAngles({ longitude: plek.lon * Math.PI / 180, latitude: plek.lat * Math.PI / 180, height: 0 }, eciToEcf(pv.position, gstime(datum)));
    const h = la.elevation * 180 / Math.PI;
    if (h > 10) {
      if (!bezig) bezig = { op: d, max: -90, azOp: la.azimuth * 180 / Math.PI };
      bezig.azOnder = la.azimuth * 180 / Math.PI;
      if (h > bezig.max) {
        const t = A.MakeTime(datum), zon = A.GeoVector(A.Body.Sun, t, false), zl = zon.Length();
        const s = [zon.x / zl, zon.y / zl, zon.z / zl], r = pv.position, dot = r.x * s[0] + r.y * s[1] + r.z * s[2];
        const loodrecht = Math.hypot(r.x - dot * s[0], r.y - dot * s[1], r.z - dot * s[2]);
        const zq = A.Equator(A.Body.Sun, t, obs, true, true);
        Object.assign(bezig, { max: h, top: d, azTop: la.azimuth * 180 / Math.PI, inZon: dot > 0 || loodrecht > 6371,
          zonHoogte: A.Horizon(t, obs, zq.ra, zq.dec, null).altitude });
      }
    } else if (bezig) {
      uit.push({ ...bezig, onder: d, zichtbaar: bezig.inZon && bezig.zonHoogte < -6 });
      bezig = null;
    }
  }
  return uit;
}

// Hoe oud zijn de baangegevens van het ISS? In uren.
export const tleLeeftijd = (tle) => tle ? (Date.now() / 1000 - tle.epoch) / 3600 : null;

// Hemelkaart: azimut en hoogte van een punt RA/Dec (J2000, graden) voor de sterrenkaart
export function sterHor(ra, dec, t, obs) {
  const r = Math.PI / 180, cd = Math.cos(dec * r);
  const v = new A.Vector(cd * Math.cos(ra * r), cd * Math.sin(ra * r), Math.sin(dec * r), t);
  const h = A.RotateVector(A.Rotation_EQJ_HOR(t, obs), v);
  const s = A.HorizonFromVector(h, null);
  return { az: s.lon, hoogte: s.lat };
}
export { waarnemer };

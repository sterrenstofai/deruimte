// ISS nu: satellite.js (met de TLE van wheretheiss.at) naast de live positie van wheretheiss.at.
// Schrijft uitkomsten/iss_nu.json.
import * as sat from "satellite.js";
import { writeFileSync } from "node:fs";
const tle = await (await fetch("https://api.wheretheiss.at/v1/satellites/25544/tles")).json();
const live = await (await fetch("https://api.wheretheiss.at/v1/satellites/25544")).json();
const d = new Date(live.timestamp * 1000);
const rec = sat.twoline2satrec(tle.line1, tle.line2);
const g = sat.eciToGeodetic(sat.propagate(rec, d).position, sat.gstime(d));
const lat = sat.degreesLat(g.latitude), lon = sat.degreesLong(g.longitude);
const r = Math.PI / 180, km = 6371 * Math.acos(Math.sin(lat * r) * Math.sin(live.latitude * r) + Math.cos(lat * r) * Math.cos(live.latitude * r) * Math.cos((lon - live.longitude) * r));
const uit = { moment: d.toISOString(), tle_leeftijd_uur: +((live.timestamp - tle.tle_timestamp) / 3600).toFixed(1), live: { lat: live.latitude, lon: live.longitude, hoogte_km: live.altitude },
  satellitejs: { lat, lon, hoogte_km: g.height }, verschil_km: +km.toFixed(2) };
console.log(uit);
writeFileSync(new URL("./uitkomsten/iss_nu.json", import.meta.url), JSON.stringify(uit, null, 1));

// De sterrenkaart: de hele hemel boven je hoofd op één ronde kaart, zoals je hem ziet als je op je rug
// in het gras ligt met je hoofd naar het noorden. Noord boven, oost links, zuid onder, west rechts.
// De rand is de horizon, het midden recht boven je. Donker paneel binnen het lichte thema (zoals Voggels).
// Sterren tot helderheid 5 en lijnen van sterrenbeelden: d3-celestial (Olaf Frohn, BSD-3-Clause).
import { A, positie, waarnemer, richting } from "./hemel.js";

let sterren = null, beelden = null;
export async function laadSterren() {
  if (!sterren) [sterren, beelden] = await Promise.all(["/data/sterren.json", "/data/sterrenbeelden.json"].map((u) => fetch(u).then((r) => r.json())));
  return { sterren, beelden };
}

const NACHT = "#1A1A1A", MINT = "#A1FFCB", WIT = "#FFFFFF", ZACHT = "rgba(255,255,255,.55)";

// opties: { markeer: slug, beeldNamen: true, lijnen: true, planeten: true, klein: false, uitgelicht: [afkortingen] }
export async function teken(doek, D, plek, datum, opt = {}) {
  await laadSterren();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = doek.clientWidth || 320, h = doek.clientHeight || w;
  doek.width = Math.round(w * dpr); doek.height = Math.round(h * dpr);
  const c = doek.getContext("2d");
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const R = Math.min(w, h) / 2 - (opt.klein ? 6 : 26), cx = w / 2, cy = h / 2;
  const t = A.MakeTime(datum), obs = waarnemer(plek), rot = A.Rotation_EQJ_HOR(t, obs).rot;
  const rad = Math.PI / 180;
  // RA/Dec (J2000) -> horizon -> punt op de kaart (azimutaal, gelijke afstanden)
  const hor = (ra, dec) => {
    const cd = Math.cos(dec * rad), x = cd * Math.cos(ra * rad), y = cd * Math.sin(ra * rad), z = Math.sin(dec * rad);
    const hx = rot[0][0] * x + rot[1][0] * y + rot[2][0] * z, hy = rot[0][1] * x + rot[1][1] * y + rot[2][1] * z, hz = rot[0][2] * x + rot[1][2] * y + rot[2][2] * z;
    return { az: Math.atan2(-hy, hx) / rad, hoogte: Math.asin(Math.max(-1, Math.min(1, hz))) / rad };
  };
  const punt = (az, hoogte) => {
    const r = ((90 - hoogte) / 90) * R;
    return [cx - r * Math.sin(az * rad), cy - r * Math.cos(az * rad)];
  };
  c.clearRect(0, 0, w, h);
  c.fillStyle = NACHT; c.fillRect(0, 0, w, h);
  // hemel: een iets lichtere cirkel, met hoogtecirkels op 30 en 60 graden
  c.fillStyle = "#222428"; c.beginPath(); c.arc(cx, cy, R, 0, 2 * Math.PI); c.fill();
  c.strokeStyle = "rgba(255,255,255,.08)"; c.lineWidth = 1;
  for (const hh of [30, 60]) { c.beginPath(); c.arc(cx, cy, ((90 - hh) / 90) * R, 0, 2 * Math.PI); c.stroke(); }
  c.save(); c.beginPath(); c.arc(cx, cy, R, 0, 2 * Math.PI); c.clip();
  // lijnen van sterrenbeelden
  if (opt.lijnen !== false) {
    for (const [afk, b] of Object.entries(beelden)) {
      const uit = opt.uitgelicht?.includes(afk);
      c.strokeStyle = uit ? MINT : "rgba(161,255,203,.28)"; c.lineWidth = uit ? 2 : 0.8;
      let midden = null, n = 0;
      for (const lijn of b.lijnen) {
        c.beginPath(); let eerst = true;
        for (const [ra, dec] of lijn) {
          const p = hor(ra, dec);
          if (p.hoogte < -5) { eerst = true; continue; }
          const [x, y] = punt(p.az, p.hoogte);
          if (eerst) { c.moveTo(x, y); eerst = false; } else c.lineTo(x, y);
          if (p.hoogte > 0) { midden = midden ? [midden[0] + x, midden[1] + y] : [x, y]; n++; }
        }
        c.stroke();
      }
      if ((opt.beeldNamen || uit) && n > 2 && !opt.klein) {
        c.fillStyle = uit ? MINT : "rgba(161,255,203,.55)"; c.font = `${uit ? 600 : 500} ${uit ? 13 : 10.5}px Geist, sans-serif`; c.textAlign = "center";
        c.fillText(b.nl, midden[0] / n, midden[1] / n);
      }
    }
  }
  // sterren: grootte naar helderheid
  for (const [ra, dec, mag, , naam] of sterren) {
    if (opt.klein && mag > 4) continue;
    const p = hor(ra, dec);
    if (p.hoogte < 0) continue;
    const [x, y] = punt(p.az, p.hoogte);
    const r = Math.max(0.5, (opt.klein ? 2.2 : 3.2) - mag * 0.55);
    c.fillStyle = mag < 3 ? WIT : "rgba(255,255,255,.75)";
    c.beginPath(); c.arc(x, y, r, 0, 2 * Math.PI); c.fill();
    if (opt.sterNamen && naam && mag < 1.6 && !opt.klein) { c.fillStyle = ZACHT; c.font = "500 10px Geist, sans-serif"; c.textAlign = "left"; c.fillText(naam, x + 5, y - 4); }
  }
  // zon, maan, planeten (en het gemarkeerde hemellichaam)
  const plekken = [];
  if (opt.planeten !== false) {
    for (const it of D.hemel.filter((x) => (x.ae && x.ae !== "Pluto") || x.slug === opt.markeer || x.baan?.ster && opt.markeer === x.slug)) {
      const p = positie(it, datum, plek, D);
      if (!p || p.hoogte < -2) continue;
      const [x, y] = punt(p.az, Math.max(0, p.hoogte));
      const hier = it.slug === opt.markeer;
      const r = it.ae === "Sun" ? 9 : it.ae === "Moon" ? 8 : hier ? 5 : 4;
      c.fillStyle = it.ae === "Sun" ? "#FFD27A" : it.ae === "Moon" ? "#EDEDED" : MINT;
      c.beginPath(); c.arc(x, y, r, 0, 2 * Math.PI); c.fill();
      if (hier) { c.strokeStyle = MINT; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r + 7, 0, 2 * Math.PI); c.stroke(); }
      if (!opt.klein || hier) {
        c.fillStyle = hier ? MINT : WIT; c.font = `${hier ? 600 : 500} ${hier ? 14 : 12}px Geist, sans-serif`; c.textAlign = "left";
        c.fillText(it.titel, x + r + 4, y + 4);
      }
      plekken.push({ slug: it.slug, x, y, r: r + 10 });
    }
  }
  c.restore();
  // horizon en windrichtingen
  c.strokeStyle = "rgba(255,255,255,.35)"; c.lineWidth = 1.2; c.beginPath(); c.arc(cx, cy, R, 0, 2 * Math.PI); c.stroke();
  if (!opt.klein) {
    c.fillStyle = WIT; c.font = "600 13px Geist, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
    for (const [az, l] of [[0, "N"], [90, "O"], [180, "Z"], [270, "W"]]) { const [x, y] = punt(az, -14); c.fillText(l, x, y); }
    c.textBaseline = "alphabetic";
  }
  doek.dataset.plekken = JSON.stringify(plekken);
  return plekken;
}

// Een tik op de kaart: welk hemellichaam?
export function welke(doek, e) {
  const r = doek.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
  const lijst = JSON.parse(doek.dataset.plekken || "[]");
  return lijst.find((p) => Math.hypot(p.x - x, p.y - y) < p.r)?.slug || null;
}

// Kort zinnetje: "Hoog in het zuidoosten (40°)"
export function waarZin(p) {
  if (!p) return "";
  if (p.hoogte < 0) return `Onder de horizon (${Math.round(-p.hoogte)}° eronder), in het ${richting(p.az)}`;
  const hoe = p.hoogte < 10 ? "Laag" : p.hoogte < 35 ? "Halfhoog" : p.hoogte < 70 ? "Hoog" : "Bijna recht boven je";
  return `${hoe} in het ${richting(p.az)} (${Math.round(p.hoogte)}° boven de horizon)`;
}

// Tab "Baan": een simulatie in de browser, op een donker paneel. Label "simulatie".
// - Om de zon: de banen van bovenaf, met de plek van vandaag (astronomy-engine of een Kepler-baan), en de tijd versneld.
// - Een maan: om zijn planeet, met de echte omlooptijd (versneld).
// - Een ster: geen baan om de zon; je ziet hoe hij in één nacht rond de Poolster lijkt te draaien (dat is de aarde die draait).
// - Het ISS: om de aarde, op schaal.
import { helio } from "./hemel.js";

const MINT = "#A1FFCB", WIT = "#FFFFFF", ZACHT = "rgba(255,255,255,.45)", NACHT = "#1A1A1A";
const PLANETEN = ["mercurius", "venus", "aarde", "mars", "jupiter", "saturnus", "uranus", "neptunus"];

function baanGewoon(vak, item, D) {
  vak.innerHTML = `<div class="baan">
    <canvas class="baan-doek" aria-label="Simulatie van de baan van ${item.naam}"></canvas>
    <div class="baan-onder">
      <span class="label">simulatie</span>
      <label class="baan-snel"><span>Sneller</span><input type="range" min="0" max="4" step="1" value="2" aria-label="Snelheid van de simulatie"></label>
      <span class="baan-datum mono"></span>
    </div>
    <p class="noot baan-noot"></p>
  </div>`;
  const doek = vak.querySelector("canvas"), noot = vak.querySelector(".baan-noot"), datumVak = vak.querySelector(".baan-datum");
  const schuif = vak.querySelector("input");
  let t0 = Date.now(), sim = Date.now(), vorige = performance.now(), frame = 0, loopt = true;
  const zon = item.soort !== "maan" && item.soort !== "ster" && item.slug !== "iss" && item.slug !== "hubble" && item.slug !== "zon";
  // dagen per seconde, per stand van de schuif
  const SNEL = zon ? (item.baan?.periode_d > 20000 ? [30, 365, 3650, 18250, 73000] : item.baan?.periode_d > 2000 ? [5, 30, 180, 730, 3650] : [0.5, 3, 15, 60, 240])
    : item.slug === "iss" || item.slug === "hubble" ? [1 / 1440, 1 / 288, 1 / 60, 1 / 24, 1 / 6] : item.soort === "ster" ? [1 / 96, 1 / 24, 1 / 8, 1 / 3, 1] : [0.05, 0.3, 1.5, 6, 24];
  noot.textContent = zon ? "De banen van bovenaf gezien, op schaal. De bolletjes zijn veel te groot getekend: op deze schaal zou zelfs de zon kleiner zijn dan een stipje. Het begint vandaag, op de plek waar alles nu echt staat."
    : item.slug === "zon" ? "De zon staat in het midden; de planeten draaien eromheen. Op schaal, alleen de bolletjes zijn te groot getekend."
    : item.soort === "ster" ? "Een ster draait niet om de zon. Maar omdat de aarde draait, lijkt elke ster in een nacht een stukje van een cirkel te draaien om de Poolster. Hier zie je dat versneld; de kaart is naar het noorden gericht."
    : item.slug === "iss" || item.slug === "hubble" ? `De aarde en de baan van ${item.naam} op schaal. ${item.slug === "iss" ? "Het ISS" : "Hubble"} vliegt zo laag dat de baan bijna de aarde raakt.`
    : `${item.titel} om ${D.perSlug[item.ouder]?.naam || "zijn planeet"}, met de echte omlooptijd, versneld. Afstand op schaal; de bolletjes zijn te groot getekend.`;

  function maat() {
    const dpr = Math.min(2, window.devicePixelRatio || 1), w = doek.clientWidth || 320, h = doek.clientHeight || 320;
    doek.width = Math.round(w * dpr); doek.height = Math.round(h * dpr);
    doek.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }
  let { w, h } = maat();
  const ro = new ResizeObserver(() => ({ w, h } = maat()));
  ro.observe(doek);

  function stip(c, x, y, r, kleur, label, sterk) {
    c.fillStyle = kleur; c.beginPath(); c.arc(x, y, r, 0, 2 * Math.PI); c.fill();
    if (label) { c.fillStyle = sterk ? MINT : ZACHT; c.font = `${sterk ? 600 : 500} ${sterk ? 13 : 11}px Geist, sans-serif`; c.textAlign = "left"; c.fillText(label, x + r + 4, y + 4); }
  }

  function tekenZon(c, datum) {
    const cx = w / 2, cy = h / 2;
    const binnen = item.slug === "zon" ? false : (item.baan?.a_km || 0) < 6e8 && !(item.baan?.e > 0.5);
    const lijst = PLANETEN.filter((s) => !binnen || ["mercurius", "venus", "aarde", "mars", "jupiter"].includes(s)).map((s) => D.perSlug[s]);
    let maxAE = binnen ? 5.6 : 31;
    if (item.baan?.kepler) maxAE = Math.max(maxAE, item.baan.kepler.a * (1 + item.baan.kepler.e) * 1.03);
    if (item.slug === "pluto") maxAE = 50;
    const s = (Math.min(w, h) / 2 - 18) / maxAE;
    c.fillStyle = "#FFD27A"; c.beginPath(); c.arc(cx, cy, 6, 0, 2 * Math.PI); c.fill();
    const teken = (it, sterk, zonderNaam = false) => {
      // de baan: het pad van de komende omloop
      const P = it.baan.periode_d, n = 160;
      c.strokeStyle = sterk ? "rgba(161,255,203,.6)" : "rgba(255,255,255,.14)"; c.lineWidth = sterk ? 1.5 : 1; c.beginPath();
      for (let k = 0; k <= n; k++) { const v = helio(it, new Date(+datum + (k / n) * P * 864e5)); if (!v) return; const x = cx + v.x * s, y = cy - v.y * s; k ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.stroke();
      const v = helio(it, datum);
      stip(c, cx + v.x * s, cy - v.y * s, sterk ? 5.5 : zonderNaam ? 2 : 3.5, sterk ? MINT : WIT, zonderNaam ? "" : it.titel, sterk);
    };
    for (const p of lijst) if (p.slug !== item.slug) teken(p, false, maxAE > 20 && p.baan.a_km < 3e8);
    if (item.slug !== "zon") teken(item, true);
    c.fillStyle = ZACHT; c.font = "500 11px Geist Mono, monospace"; c.textAlign = "left";
    const ae = maxAE > 20 ? 10 : 1;
    c.fillRect(14, h - 22, ae * s, 2); c.fillText(`${ae} keer de afstand aarde–zon`, 14, h - 30);
  }

  function tekenMaan(c, datum) {
    const cx = w / 2, cy = h / 2, ouder = D.perSlug[item.ouder];
    const zussen = D.hemel.filter((x) => x.ouder === item.ouder && x.soort === "maan" && x.baan?.a_km);
    const maxA = Math.max(...zussen.map((x) => x.baan.a_km));
    const s = (Math.min(w, h) / 2 - 22) / maxA;
    const rOuder = Math.max(5, (ouder?.schaal?.diameter_km || 0) / 2 * s);
    c.fillStyle = "#D9D9D9"; c.beginPath(); c.arc(cx, cy, rOuder, 0, 2 * Math.PI); c.fill();
    c.fillStyle = ZACHT; c.font = "500 11px Geist, sans-serif"; c.textAlign = "center"; c.fillText(ouder?.titel || "", cx, cy + rOuder + 14);
    const dagen = (+datum - t0) / 864e5;
    for (const m of zussen) {
      const sterk = m.slug === item.slug, r = m.baan.a_km * s;
      c.strokeStyle = sterk ? "rgba(161,255,203,.6)" : "rgba(255,255,255,.14)"; c.lineWidth = 1; c.beginPath(); c.arc(cx, cy, r, 0, 2 * Math.PI); c.stroke();
      const hoek = (m.slug === "triton" ? -1 : 1) * 2 * Math.PI * dagen / m.baan.periode_d + m.slug.length;
      stip(c, cx + r * Math.cos(hoek), cy - r * Math.sin(hoek), sterk ? 5 : 3, sterk ? MINT : WIT, m.titel, sterk);
    }
  }

  function tekenIss(c, datum) {
    const hoog = item.baan?.a_km ? item.baan.a_km - 6371 : 415, naam = item.slug === "hubble" ? "Hubble" : "ISS";
    const cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 30, s = R / (6371 + hoog + 5);
    c.fillStyle = "#3D6FB0"; c.beginPath(); c.arc(cx, cy, 6371 * s, 0, 2 * Math.PI); c.fill();
    c.fillStyle = WIT; c.font = "500 12px Geist, sans-serif"; c.textAlign = "center"; c.fillText("de aarde", cx, cy + 4);
    c.strokeStyle = "rgba(161,255,203,.6)"; c.beginPath(); c.arc(cx, cy, (6371 + hoog) * s, 0, 2 * Math.PI); c.stroke();
    const hoek = 2 * Math.PI * ((+datum - t0) / 60000) / (item.baan?.periode_d ? item.baan.periode_d * 1440 : 92.9);
    stip(c, cx + (6371 + hoog) * s * Math.cos(hoek), cy - (6371 + hoog) * s * Math.sin(hoek), 5, MINT, naam, true);
  }

  function tekenSter(c, datum) {
    const cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 22;
    const pool = D.perSlug.poolster;
    const dec = item.baan?.ster?.dec ?? 89;
    const r = ((90 - dec) / 50) * R; // tot 50 graden van de pool past op de kaart
    stip(c, cx, cy - 2, 3.5, WIT, item.slug === "poolster" ? "" : "Poolster");
    const uren = (+datum - t0) / 3600e3, hoek = (uren / 23.934) * 2 * Math.PI;
    c.strokeStyle = "rgba(161,255,203,.25)"; c.lineWidth = 1.2; c.beginPath(); c.arc(cx, cy, Math.min(r, R), 0, 2 * Math.PI); c.stroke();
    c.strokeStyle = "rgba(161,255,203,.8)"; c.lineWidth = 2.5; c.beginPath(); c.arc(cx, cy, Math.min(r, R), -Math.PI / 2 - Math.min(hoek, 2 * Math.PI), -Math.PI / 2, false); c.stroke();
    const a = -Math.PI / 2 - hoek;
    stip(c, cx + Math.min(r, R) * Math.cos(a), cy + Math.min(r, R) * Math.sin(a), 5, MINT, item.titel, true);
    if (r > R) { c.fillStyle = ZACHT; c.font = "500 11px Geist, sans-serif"; c.textAlign = "center"; c.fillText(`${item.titel} staat verder van de Poolster dan deze kaart laat zien`, cx, h - 12); }
    c.fillStyle = ZACHT; c.font = "500 11px Geist Mono, monospace"; c.textAlign = "left"; c.fillText("NOORD", 12, 18);
  }

  function stap(nu) {
    if (!loopt || !doek.isConnected) return;
    const dt = Math.min(0.1, (nu - vorige) / 1000); vorige = nu;
    sim += dt * SNEL[+schuif.value] * 864e5;
    const c = doek.getContext("2d");
    c.fillStyle = NACHT; c.fillRect(0, 0, w, h);
    const datum = new Date(sim);
    if (item.soort === "maan" && item.ouder !== "aarde" || item.slug === "maan") tekenMaan(c, datum);
    else if (item.slug === "iss" || item.slug === "hubble") tekenIss(c, datum);
    else if (item.soort === "ster" && item.slug !== "zon") tekenSter(c, datum);
    else tekenZon(c, datum);
    if (++frame % 10 === 1) datumVak.textContent = item.soort === "ster" || item.slug === "iss" || item.slug === "hubble" ? `+${Math.floor((sim - t0) / 3600e3)} uur ${Math.floor(((sim - t0) / 60e3) % 60)} min`
      : datum.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
    requestAnimationFrame(stap);
  }
  // wie niet van beweging houdt: stilstaand beeld van vandaag
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) schuif.value = 0;
  requestAnimationFrame(stap);
  return () => { loopt = false; ro.disconnect(); };
}

// Ruimtesondes: de echte route van de lancering tot nu, van JPL Horizons (elke 30 dagen een punt),
// met de banen van de planeten erbij. Een stip volgt de route versneld; daarna blijft hij staan waar hij nu is.
function stip(c, x, y, r, kleur, label, sterk) {
  c.fillStyle = kleur; c.beginPath(); c.arc(x, y, r, 0, 2 * Math.PI); c.fill();
  if (label) { c.fillStyle = sterk ? MINT : ZACHT; c.font = `${sterk ? 600 : 500} ${sterk ? 13 : 11}px Geist, sans-serif`; c.textAlign = "left"; c.fillText(label, x + r + 4, y + 4); }
}
function route(vak, item, D) {
  const r = D.sondes?.[item.sonde]?.route;
  if (!r) return baanGewoon(vak, item, D);
  vak.innerHTML = `<div class="baan">
    <canvas class="baan-doek" aria-label="De route van ${item.naam}"></canvas>
    <div class="baan-onder"><span class="label">simulatie</span><button class="knop-pil" type="button" data-opnieuw>Nog een keer</button><span class="baan-datum mono"></span></div>
    <p class="noot baan-noot">De echte route van ${item.naam}, van bovenaf gezien, met de banen van de planeten. De posities komen van JPL Horizons (NASA), één punt per maand. De stip vliegt de route versneld na: ${r.length} maanden in tien seconden.</p>
  </div>`;
  const doek = vak.querySelector("canvas"), datumVak = vak.querySelector(".baan-datum");
  let w = 320, h = 320, start = performance.now(), loopt = true;
  const maat = () => { const dpr = Math.min(2, window.devicePixelRatio || 1); w = doek.clientWidth || 320; h = doek.clientHeight || 320; doek.width = Math.round(w * dpr); doek.height = Math.round(h * dpr); doek.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0); };
  maat();
  const ro = new ResizeObserver(maat); ro.observe(doek);
  const maxAE = Math.max(...r.map((p) => Math.hypot(p[1], p[2]))) * 1.05;
  const planeten = PLANETEN.map((s) => D.perSlug[s]).filter((p) => p.baan.a_km / 149.6e6 < maxAE * 1.2);
  vak.querySelector("[data-opnieuw]").addEventListener("click", () => { start = performance.now(); });
  function stap(nu) {
    if (!loopt || !doek.isConnected) return;
    const c = doek.getContext("2d"), cx = w / 2, cy = h / 2, s = (Math.min(w, h) / 2 - 20) / maxAE;
    c.fillStyle = NACHT; c.fillRect(0, 0, w, h);
    c.fillStyle = "#FFD27A"; c.beginPath(); c.arc(cx, cy, 5, 0, 2 * Math.PI); c.fill();
    for (const p of planeten) {
      const a = p.baan.a_km / 149.6e6 * s;
      c.strokeStyle = "rgba(255,255,255,.14)"; c.lineWidth = 1; c.beginPath(); c.arc(cx, cy, a, 0, 2 * Math.PI); c.stroke();
      if (a > 30) { c.fillStyle = ZACHT; c.font = "500 10px Geist, sans-serif"; c.textAlign = "left"; c.fillText(p.titel, cx + a * 0.71 + 3, cy - a * 0.71); }
    }
    const f = Math.min(1, (nu - start) / 10000), n = Math.max(1, Math.round(f * (r.length - 1)));
    c.strokeStyle = "rgba(161,255,203,.75)"; c.lineWidth = 1.8; c.beginPath();
    for (let i = 0; i <= n; i++) { const x = cx + r[i][1] * s, y = cy - r[i][2] * s; i ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.stroke();
    const p = r[n];
    stip(c, cx + p[1] * s, cy - p[2] * s, 5, MINT, item.titel, true);
    datumVak.textContent = p[0].replace(/-(\w{3})-/, (m, mnd) => ` ${{ Jan: "jan", Feb: "feb", Mar: "mrt", Apr: "apr", May: "mei", Jun: "jun", Jul: "jul", Aug: "aug", Sep: "sep", Oct: "okt", Nov: "nov", Dec: "dec" }[mnd]} `).split(" ").slice(0, 2).reverse().join(" ");
    requestAnimationFrame(stap);
  }
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) start = -1e9;
  requestAnimationFrame(stap);
  return () => { loopt = false; ro.disconnect(); };
}

export function baan(vak, item, D) {
  if (item.sonde) return route(vak, item, D);
  if (item.plek) {  // Perseverance op Mars, Apollo 11 op de maan: de baan van waar ze zijn
    const stop = baanGewoon(vak, D.perSlug[item.plek], D);
    vak.querySelector(".baan-noot").textContent = `${item.naam} ${item.plek === "mars" ? "staat op Mars" : "landde op de maan"}. Hier zie je de baan van ${D.perSlug[item.plek].naam}. ` + vak.querySelector(".baan-noot").textContent;
    return stop;
  }
  return baanGewoon(vak, item, D);
}

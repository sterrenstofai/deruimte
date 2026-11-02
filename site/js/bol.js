// Een draaiende bol uit een platte kaart (equirectangulair, 2:1), zonder WebGL of bibliotheek.
// Per beeldpunt rekenen we één keer uit welke breedte en lengte erbij hoort; draaien is daarna alleen een
// verschuiving in lengte. Licht van linksboven, zodat de bol rond oogt. Alleen kaarten van echte foto's.
const kaarten = new Map();

export function laadKaart(url) {
  if (!kaarten.has(url)) kaarten.set(url, new Promise((klaar, fout) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const g = c.getContext("2d", { willReadFrequently: true });
      g.drawImage(img, 0, 0);
      klaar({ w: c.width, h: c.height, data: g.getImageData(0, 0, c.width, c.height).data });
    };
    img.onerror = fout;
    img.src = url;
  }));
  return kaarten.get(url);
}

// tabel per maat en kanteling: voor elk beeldpunt de rij in de kaart, de lengte ten opzichte van het midden, en het licht
const tabellen = new Map();
function tabel(n, kanteling) {
  const sleutel = `${n}|${kanteling}`;
  if (tabellen.has(sleutel)) return tabellen.get(sleutel);
  const rij = new Float32Array(n * n), lengte = new Float32Array(n * n), licht = new Float32Array(n * n).fill(-1);
  const kc = Math.cos(kanteling), ks = Math.sin(kanteling);
  const L = [-0.45, 0.4, 0.8], lm = Math.hypot(...L);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const x = ((i + 0.5) / n) * 2 - 1, y = 1 - ((j + 0.5) / n) * 2, r2 = x * x + y * y;
    if (r2 > 1) continue;
    const z = Math.sqrt(1 - r2), k = j * n + i;
    // kantel om de kijkas: de poolas staat een beetje scheef
    const xb = x * kc + y * ks, yb = -x * ks + y * kc;
    rij[k] = 0.5 - Math.asin(Math.max(-1, Math.min(1, yb))) / Math.PI; // 0 = noordpool, 1 = zuidpool
    lengte[k] = Math.atan2(xb, z) / (2 * Math.PI); // -0.25 .. 0.25 van de kaart
    const d = (x * L[0] + y * L[1] + z * L[2]) / lm;
    licht[k] = Math.min(1.08, 0.18 + 0.95 * Math.max(0, d) ** 0.8) * (0.82 + 0.18 * z);
  }
  const t = { rij, lengte, licht };
  tabellen.set(sleutel, t);
  return t;
}

// teken de bol op een canvas; draai: 0..1 (een hele omwenteling), kanteling in radialen
export function tekenBol(doek, kaart, draai, { kanteling = 0 } = {}) {
  const n = doek.width, g = doek.getContext("2d");
  if (!doek._beeld || doek._beeld.width !== n) doek._beeld = g.createImageData(n, n);
  const uit = doek._beeld.data, { rij, lengte, licht } = tabel(n, kanteling);
  const { w, h, data } = kaart;
  for (let k = 0, m = n * n; k < m; k++) {
    const o = k * 4, s = licht[k];
    if (s < 0) { uit[o + 3] = 0; continue; }
    let u = lengte[k] + draai; u -= Math.floor(u);
    const px = Math.min(w - 1, (u * w) | 0), py = Math.min(h - 1, (rij[k] * h) | 0), q = (py * w + px) * 4;
    uit[o] = data[q] * s; uit[o + 1] = data[q + 1] * s; uit[o + 2] = data[q + 2] * s; uit[o + 3] = 255;
  }
  g.putImageData(doek._beeld, 0, 0);
}

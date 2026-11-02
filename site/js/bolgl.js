// De grote draaiende bol op de pagina van een hemellichaam: WebGL, zonder bibliotheek.
// Eén vlak over het hele canvas; per beeldpunt rekent de grafische kaart uit waar je op de bol kijkt
// en welk punt van de kaart (van echte foto's) daarbij hoort. Licht van linksboven, zoals in het overzicht.
// Sleep om te draaien en te kantelen. Zonder WebGL tekenen we hem met bol.js.
import { laadKaart, tekenBol } from "./bol.js";

const VS = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;
const FS = `precision highp float;
uniform sampler2D kaart; uniform vec2 maat; uniform float straal, lengte, kantel, helling;
void main() {
  vec2 q = (gl_FragCoord.xy - maat * 0.5) / straal;
  float r = length(q);
  if (r > 1.0) { gl_FragColor = vec4(0.0); return; }
  float rand = 1.0 - smoothstep(1.0 - 1.5 / straal, 1.0, r);
  vec3 n = vec3(q, sqrt(max(0.0, 1.0 - r * r)));
  vec3 L = normalize(vec3(-0.45, 0.4, 0.8));
  float licht = min(1.08, 0.16 + 0.95 * pow(max(dot(n, L), 0.0), 0.8)) * (0.82 + 0.18 * n.z);
  float c = cos(kantel), s = sin(kantel);
  vec3 a = vec3(c * n.x + s * n.y, -s * n.x + c * n.y, n.z);
  float ch = cos(helling), sh = sin(helling);
  vec3 b = vec3(a.x, ch * a.y - sh * a.z, sh * a.y + ch * a.z);
  float u = fract(atan(b.x, b.z) / 6.2831853 + lengte);
  float v = 0.5 - asin(clamp(b.y, -1.0, 1.0)) / 3.1415927;
  vec3 kleur = texture2D(kaart, vec2(u, v)).rgb * licht;
  gl_FragColor = vec4(kleur * rand, rand);
}`;

// doek: canvas; b: regel uit bollen.json. Geeft een functie terug die alles stopt.
export function groteBol(doek, b, { stil = false } = {}) {
  const stand = { lengte: b.begin ?? 0.5, helling: 0, vaart: 0, laatsteSleep: -1e9 };
  const kantel = ((b.kanteling || 0) * Math.PI) / 180;
  let teken = null, anim = 0, weg = false, vorige = 0, wijzer = null;
  const gl = doek.getContext("webgl", { premultipliedAlpha: true, antialias: true, alpha: true });

  if (gl) {
    const maak = (soort, bron) => { const s = gl.createShader(soort); gl.shaderSource(s, bron); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, maak(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, maak(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return terugval();
    gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n) => gl.getUniformLocation(prog, n);
    const U = { maat: u("maat"), straal: u("straal"), lengte: u("lengte"), kantel: u("kantel"), helling: u("helling") };
    const tex = gl.createTexture();
    const img = new Image();
    img.onload = () => {
      if (weg) return;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      teken = () => {
        gl.viewport(0, 0, doek.width, doek.height);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(U.maat, doek.width, doek.height);
        gl.uniform1f(U.straal, Math.min(doek.width, doek.height) * 0.47);
        gl.uniform1f(U.lengte, stand.lengte); gl.uniform1f(U.kantel, kantel); gl.uniform1f(U.helling, stand.helling);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };
      doek.classList.add("klaar");
      start();
    };
    img.src = b.groot || b.pad;
  } else return terugval();

  // zonder WebGL: dezelfde bol met bol.js, kleiner opgelost
  function terugval() {
    const vervang = doek.cloneNode(); doek.replaceWith(vervang); doek = vervang;
    laadKaart(b.pad).then((k) => {
      if (weg) return;
      teken = () => {
        const n = Math.min(doek.width, doek.height, 700);
        const tmp = doek._tmp || (doek._tmp = document.createElement("canvas"));
        tmp.width = tmp.height = n;
        tekenBol(tmp, k, stand.lengte, { kanteling: kantel });
        const g = doek.getContext("2d"), d = Math.min(doek.width, doek.height) * 0.94;
        g.clearRect(0, 0, doek.width, doek.height);
        g.drawImage(tmp, (doek.width - d) / 2, (doek.height - d) / 2, d, d);
      };
      doek.classList.add("klaar");
      start();
    });
    koppel();
    return stop;
  }

  function maat() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(doek.clientWidth * dpr), h = Math.round(doek.clientHeight * dpr);
    if (doek.width !== w || doek.height !== h) { doek.width = w; doek.height = h; }
  }
  function stap(nu) {
    anim = 0;
    if (weg || !doek.isConnected) return;
    const dt = Math.min(50, nu - (vorige || nu)); vorige = nu;
    if (!document.hidden) {
      const zelf = nu - stand.laatsteSleep < 2500 || wijzer;
      if (!zelf && !stil) stand.lengte -= dt / 30000; // een omwenteling in een halve minuut, van west naar oost
      else if (!wijzer) { stand.lengte -= stand.vaart; stand.vaart *= 0.94; }
      maat(); teken?.();
    }
    anim = requestAnimationFrame(stap);
  }
  function start() { if (!anim && !weg) anim = requestAnimationFrame(stap); }

  // slepen: links-rechts draait, op-neer kantelt
  function koppel() {
    doek.addEventListener("pointerdown", (e) => { doek.setPointerCapture(e.pointerId); wijzer = { x: e.clientX, y: e.clientY }; stand.vaart = 0; });
    doek.addEventListener("pointermove", (e) => {
      if (!wijzer) return;
      const r = Math.min(doek.clientWidth, doek.clientHeight) * 0.47;
      const dx = e.clientX - wijzer.x, dy = e.clientY - wijzer.y;
      stand.vaart = -dx / (2 * Math.PI * r);
      stand.lengte += stand.vaart;
      stand.helling = Math.max(-1.1, Math.min(1.1, stand.helling + dy / r));
      wijzer = { x: e.clientX, y: e.clientY };
      stand.laatsteSleep = performance.now();
    });
    const los = () => { wijzer = null; stand.laatsteSleep = performance.now(); };
    doek.addEventListener("pointerup", los); doek.addEventListener("pointercancel", los);
  }
  if (gl) koppel();
  function stop() { weg = true; cancelAnimationFrame(anim); }
  return stop;
}

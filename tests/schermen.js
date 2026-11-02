// Schermafbeeldingen op zes breedtes, met controle op horizontaal scrollen en fouten in de console.
// Overgenomen van ikhooreengeluidje. Gebruik: node tests/schermen.js [basis-url] [uitmap] [breedtes, komma's]
const { chromium } = require("playwright");
const BASIS = process.argv[2] || "http://localhost:8765";
const UIT = process.argv[3] || "schermen";
const BREEDTES = (process.argv[4] || "360,390,768,1024,1366,1920").split(",").map(Number);
const PAGINAS = [
  ["home", "/"],
  ["index", "/hemellichamen"],
  ["jupiter", "/hemel/jupiter"],
  ["jupiter-schaal", "/hemel/jupiter?tab=schaal"],
  ["saturnus-baan", "/hemel/saturnus?tab=baan"],
  ["mars-geluid", "/hemel/mars?tab=geluid"],
  ["maan-nu", "/hemel/maan?tab=nu"],
  ["sirius", "/hemel/sirius"],
  ["iss-nu", "/hemel/iss?tab=nu"],
  ["io-baan", "/hemel/io?tab=baan"],
  ["vanavond", "/vanavond"],
  ["voyager", "/hemel/voyager-1?tab=nu"],
  ["voyager-baan", "/hemel/voyager-1?tab=baan"],
  ["perseverance", "/hemel/perseverance"],
  ["kuipers", "/hemel/kuipers"],
  ["apollo-schaal", "/hemel/apollo-11?tab=schaal"],
  ["index-ruimtevaart", "/hemellichamen"],
  ["kinderen", "/kinderen"],
  ["onderzoekjes", "/onderzoekjes"],
  ["oz-vanavond", "/onderzoekjes/wat-zie-je-vanavond"],
  ["oz-maan", "/onderzoekjes/maan-dagboek"],
  ["oz-groot", "/onderzoekjes/hoe-groot-is-de-zon"],
  ["oz-planeet", "/onderzoekjes/welke-planeet"],
  ["oz-zwaar", "/onderzoekjes/zwaar-en-licht"],
  ["oz-sterren", "/onderzoekjes/sterrenbeeld-leggen"],
  ["mijn", "/mijn"],
  ["hoe", "/hoe-dit-werkt"],
];
(async () => {
  require("fs").mkdirSync(UIT, { recursive: true });
  const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: "localhost,127.0.0.1" } : undefined });
  let problemen = 0;
  for (const b of BREEDTES) {
    const page = await browser.newPage({ viewport: { width: b, height: b < 800 ? 780 : 900 }, ignoreHTTPSErrors: true });
    const fouten = [];
    page.on("pageerror", (e) => fouten.push(e.message));
    page.on("console", (m) => { if (m.type() === "error") fouten.push(m.text()); });
    for (const [naam, pad] of PAGINAS) {
      await page.goto(BASIS + pad, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);
      const breed = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (breed > 0) { problemen++; console.log(`  ${b}px ${naam}: ${breed}px horizontaal scrollen`); }
      await page.screenshot({ path: `${UIT}/${naam}-${b}.png`, fullPage: false });
    }
    for (const f of new Set(fouten)) { problemen++; console.log(`  ${b}px fout: ${f.slice(0, 220)}`); }
    await page.close();
  }
  await browser.close();
  console.log(problemen ? `${problemen} problemen` : "geen problemen");
})();

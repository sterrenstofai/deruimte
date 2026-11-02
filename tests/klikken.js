// Klikt de interactieve onderdelen door: tabjes, geluid afspelen, het plusje, quiz, stempel, certificaat,
// woonplaats zoeken (PDOK), zoeken buiten de lijst (Wikidata) en de kinderversie.
// Gebruik: node tests/klikken.js [basis-url]
const { chromium } = require("playwright");
const BASIS = process.argv[2] || "http://localhost:8765";
let fouten = 0;
const ok = (v, wat) => { console.log(`${v ? "ok  " : "FOUT"} ${wat}`); if (!v) fouten++; };
(async () => {
  const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: "localhost,127.0.0.1" } : undefined });
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, ignoreHTTPSErrors: true, acceptDownloads: true, timezoneId: "Europe/Amsterdam", locale: "nl-NL" });
  const page = await ctx.newPage();
  const consoleFout = [];
  page.on("pageerror", (e) => consoleFout.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") consoleFout.push(m.text()); });

  // tabjes en geluid
  await page.goto(BASIS + "/hemel/mars", { waitUntil: "networkidle" });
  for (const t of ["Op schaal", "Baan", "Geluid", "Nu", "Foto"]) { await page.getByRole("tab", { name: t }).click(); await page.waitForTimeout(400); ok(await page.locator(`[role=tabpanel]:not([hidden])`).count() === 1, `tab ${t}`); }
  await page.getByRole("tab", { name: "Geluid" }).click();
  await page.locator("[data-speel]").first().click();
  await page.waitForTimeout(2500);
  ok(await page.evaluate(() => !document.getElementById("speler").hidden), "speler verschijnt bij afspelen");
  ok(await page.locator(".speler-knop.speelt").count() === 1, "geluid speelt");
  await page.locator(".speler-sluit").click();

  // het plusje: Mijn hemel
  await page.locator(".scherm-titel [data-mijn]").click();
  ok((await page.locator(".nav-mijn-n").textContent()) === "1", "teller in de kop na plusje");
  await page.locator(".gespot-melding button").click();
  ok(await page.locator(".nav-mijn-n").isHidden(), "ongedaan maken werkt");
  await page.locator(".scherm-titel [data-mijn]").click();
  await page.goto(BASIS + "/mijn", { waitUntil: "networkidle" });
  ok((await page.locator(".hemel-titel").first().textContent()) === "Mars", "Mars staat in Mijn hemel, na herladen");

  // woonplaats zoeken bij PDOK
  await page.goto(BASIS + "/vanavond", { waitUntil: "networkidle" });
  await page.fill("#plek-veld", "Enschede");
  await page.waitForSelector("#plek-lijst li[data-i]", { timeout: 15000 }).catch(() => {});
  if (await page.locator("#plek-lijst li[data-i]").count()) {
    await page.locator("#plek-lijst li[data-i]").first().click();
    await page.waitForTimeout(1500);
    ok((await page.locator("[data-plek-naam]").textContent()).includes("Enschede"), "woonplaats gekozen via PDOK");
  } else ok(false, "PDOK gaf geen woonplaatsen");
  await page.locator(".vv-tijd input").fill("8");
  ok((await page.locator("[data-tijd]").textContent()).length > 3, "tijdschuif verandert de tijd");

  // onderzoekje: quiz, stempel
  await page.goto(BASIS + "/onderzoekjes/welke-planeet", { waitUntil: "networkidle" });
  for (let i = 0; i < 5; i++) { await page.locator("[data-keuze]").first().click(); await page.locator("[data-verder]").click(); }
  ok(await page.locator(".oz-score").count() === 1, "quiz geeft een score na vijf foto's");
  await page.locator("[data-klaar]").click();
  ok(await page.locator(".oz-stempel").count() === 1, "stempel Gedaan");
  await page.fill(".oz-logboek textarea", "Saturnus heeft ringen");
  await page.reload({ waitUntil: "networkidle" });
  ok((await page.locator(".oz-logboek textarea").inputValue()) === "Saturnus heeft ringen", "logboek bewaard na herladen");
  // alle zes klaar, dan het certificaat
  await page.evaluate(() => { const lb = JSON.parse(localStorage.getItem("heelal-onderzoekjes") || "{}"); for (const s of ["wat-zie-je-vanavond", "maan-dagboek", "hoe-groot-is-de-zon", "welke-planeet", "zwaar-en-licht", "sterrenbeeld-leggen"]) lb[s] = { ...(lb[s] || {}), klaar: "2 november 2026" }; localStorage.setItem("heelal-onderzoekjes", JSON.stringify(lb)); });
  await page.goto(BASIS + "/onderzoekjes", { waitUntil: "networkidle" });
  await page.fill(".oz-certificaat input", "Fos");
  const [dl] = await Promise.all([page.waitForEvent("download"), page.locator("[data-certificaat]").click()]);
  const pad = await dl.path();
  const { size } = require("fs").statSync(pad);
  const dims = await page.evaluate(async (u) => new Promise((r) => { const i = new Image(); i.onload = () => r([i.naturalWidth, i.naturalHeight]); i.src = u; }), "data:image/png;base64," + require("fs").readFileSync(pad).toString("base64"));
  ok(dims[0] === 3508 && dims[1] === 2480, `certificaat ${dims.join("×")}, ${Math.round(size / 1024)} kB`);
  require("fs").copyFileSync(pad, "/tmp/claude-0/certificaat.png");
  await page.locator("[data-opnieuw-vraag]").click();
  await page.locator("[data-opnieuw-ja]").click();
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem("heelal-onderzoekjes"))._naam === "Fos"), "opnieuw beginnen: naam blijft bewaard");

  // onderzoekjes met invoer
  await page.goto(BASIS + "/onderzoekjes/zwaar-en-licht", { waitUntil: "networkidle" });
  await page.fill("[data-gram]", "600");
  ok((await page.locator(".oz-weeg li", { hasText: "Maan" }).textContent()).includes("98 gram"), "600 gram op aarde is 98 gram op de maan (1,6 / 9,8 m/s²)");
  await page.goto(BASIS + "/onderzoekjes/hoe-groot-is-de-zon", { waitUntil: "networkidle" });
  ok((await page.locator(".oz-tabel tbody tr").nth(2).textContent()).includes("4,6 mm"), "aarde is 4,6 mm bij een strandbal als zon");

  // zoeken buiten de lijst
  await page.goto(BASIS + "/zoek?q=Deimos", { waitUntil: "networkidle" });
  await page.waitForTimeout(4000);
  const wd = await page.locator("[data-resultaten]").textContent();
  ok(/Deimos|druk|geen antwoord/.test(wd), `Wikidata-zoeken geeft een resultaat of een eerlijke melding: "${wd.trim().slice(0, 80)}"`);

  // kinderversie: vegen en de knop
  await page.goto(BASIS + "/kinderen", { waitUntil: "networkidle" });
  const voor = await page.locator(".kids-plaat img").getAttribute("src");
  await page.locator(".kids-volgende").click();
  ok(voor !== (await page.locator(".kids-plaat img").getAttribute("src")), "kinderversie: pijl gaat naar de volgende");
  // de eerste keer wijst een kloppend handje; een tik daarop doet hetzelfde als een tik op de foto
  if (await page.locator(".kids-tip").isVisible()) await page.locator(".kids-tip").click(); else await page.locator(".kids-plaat").click();
  ok(await page.locator(".kids-ballon.zichtbaar").count() === 1, "kinderversie: tik op de foto toont de naam");

  for (const f of new Set(consoleFout)) { console.log("console:", f.slice(0, 200)); }
  await browser.close();
  console.log(fouten ? `${fouten} fouten` : "alles werkt");
  process.exit(fouten ? 1 : 0);
})();

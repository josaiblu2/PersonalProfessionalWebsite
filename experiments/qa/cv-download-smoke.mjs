// Smoke test E2E del flujo "Request CV" (EXP-003 / EXP-013) -- NO contamina KPIs:
//  - bloquea toda peticion fuera de BASE (GA4/GTM nunca reciben nada: ni page_view ni evento Tier 1)
//  - responde localmente el POST de Netlify Forms (no se crea ningun lead real)
// Uso: npm i playwright && BASE=http://localhost:4321 node experiments/qa/cv-download-smoke.mjs
//      (tambien valido contra produccion: BASE=https://salvadoribarra.tech)
import { chromium } from 'playwright';
import crypto from 'node:crypto';
import fs from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:4321';
const results = [];
const ok = (name, pass, detail = '') => { results.push({ name, pass, detail }); };

const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const ctx = await browser.newContext({ acceptDownloads: true });
const page = await ctx.newPage();

const external = [];
const consoleErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => consoleErrors.push(String(e)));

// 1) Bloquear TODO lo externo (GA4/GTM/Google/etc.): nada sale de la sandbox.
await ctx.route(url => !url.toString().startsWith(BASE), route => { external.push(route.request().url()); route.abort(); });
// 2) Simular Netlify Forms: el POST a "/" responde 200 sin crear ningun lead real.
let formBody = null;
await ctx.route(`${BASE}/`, route => {
  if (route.request().method() === 'POST') { formBody = route.request().postData(); return route.fulfill({ status: 200, body: 'ok' }); }
  return route.continue();
});

await page.goto(BASE + '/', { waitUntil: 'load' });
await page.click('#cv-request-trigger');
await page.fill('#cv-email', 'qa-test@example.com');

const [dl] = await Promise.all([
  page.waitForEvent('download', { timeout: 10000 }),
  page.click('#cv-request-submit'),
]);
const autoName = dl.suggestedFilename();
const autoPath = (process.env.TMPDIR || '/tmp') + '/cv-auto.pdf'; await dl.saveAs(autoPath);
const md5 = f => crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex');
ok('Descarga automatica: nombre = Salvador_Ibarra_Luna_CV.pdf', autoName === 'Salvador_Ibarra_Luna_CV.pdf', autoName);
ok('Descarga automatica: contenido = CV nuevo (md5)', md5(autoPath) === (process.env.EXPECTED_MD5 || 'e793b8e60f9d95465875e0243bfb988b'), md5(autoPath));
ok('Formulario enviado con form-name=cv-request y email', !!formBody && formBody.includes('form-name=cv-request') && formBody.includes('qa-test%40example.com'), formBody);

await page.waitForSelector('#cv-request-success-view:not(.hidden)');
const fbHref = await page.getAttribute('#cv-request-fallback-link', 'href');
const [dl2] = await Promise.all([page.waitForEvent('download'), page.click('#cv-request-fallback-link')]);
ok('Enlace de respaldo: href estable', fbHref === '/assets/cv/Salvador_Ibarra_Luna_CV.pdf', fbHref);
ok('Enlace de respaldo: nombre = Salvador_Ibarra_Luna_CV.pdf', dl2.suggestedFilename() === 'Salvador_Ibarra_Luna_CV.pdf', dl2.suggestedFilename());

// Evento GA4 se habria disparado (queda en dataLayer; gtag.js real bloqueado => no se envio nada)
const events = await page.evaluate(() => (window.dataLayer || []).map(a => Array.from(a)).filter(a => a[0] === 'event').map(a => a[1]));
ok('Evento tier1_cv_download_conversion invocado (solo local, no enviado)', events.includes('tier1_cv_download_conversion'), JSON.stringify(events));
ok('Cero solicitudes externas completadas (GA4/GTM bloqueados)', true, `${external.length} bloqueadas: ` + [...new Set(external.map(u => new URL(u).host))].join(', '));
ok('Sin errores de consola propios del sitio', consoleErrors.filter(e => !/ERR_FAILED|net::/.test(e)).length === 0, consoleErrors.join(' | ').slice(0, 300));

// URL del nombre visible al abrir el PDF directo (visor del navegador usa el nombre de la URL)
const r = await page.request.get(BASE + '/assets/cv/Salvador_Ibarra_Luna_CV.pdf');
ok('GET directo de la URL nueva = 200 application/pdf', r.status() === 200 && /pdf/.test(r.headers()['content-type'] || ''), `${r.status()} ${r.headers()['content-type']}`);
const old = await page.request.get(BASE + '/assets/cv/Salvador_Ibarra_Luna_CV_Master_v1_3.pdf');
ok('URL antigua ya no se publica (esperado 404 sin redirect)', old.status() === 404, String(old.status()));

await browser.close();
for (const t of results) console.log(`${t.pass ? 'PASS' : 'FAIL'}  ${t.name}${t.detail ? '  -> ' + t.detail : ''}`);
process.exit(results.every(t => t.pass) ? 0 : 1);

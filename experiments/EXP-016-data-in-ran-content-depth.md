# EXP-016 -- Ampliar `data-in-ran` con foco en "RAN monitoring" (profundidad de contenido)

## Experiment ID
EXP-016 (origen: BL-011; seguimiento del par RAN de EXP-011)

## Observation
Tras 4 semanas de EXP-011 (PR #7, 2026-09-24; ventana cumplida 2026-10-22), el par RAN no consolido: en "ran monitoring" `data-in-ran` sigue sin aparecer y la query la conserva `ai-ran-where-adds-value`. Se cumple el criterio de Decision de EXP-011 para evaluar BL-011 (Work Project Instructions v1.25).

## Evidence
Checkpoint semanal 2026-10-23 (Search Console, datos hasta 2026-10-21; detalle en EXP-011):
- "ran monitoring": solo `ai-ran-where-adds-value/` 36 impr., pos. 83.4 (2026-09-25 a 10-21); `data-in-ran` no aparece (baseline 3 meses: 154 impr., pos. 84.4).
- "ran analytics": `data-in-ran/` 20 impr., pos. 71.1 vs. `ai-ran-where-adds-value/` 13 impr., pos. 56.3 (acumulado); ultima semana `data-in-ran/` 8 impr., pos. 73.0 vs. 3 impr., pos. 89.0 (n=11, insuficiente).
- Contenido: `data-in-ran` tenia 422 palabras (`wc -w`), sin H2/H3 y con titulo que no menciona "monitoring" (BL-011, BL-010).

## Hypothesis
Si `data-in-ran` cubre el tema de RAN monitoring en profundidad (~1,050 palabras de cuerpo con H2/H3 sobre monitoreo vs. observabilidad vs. analitica, pilares PM/CM/FM, modos de falla, calidad de datos, IA y SMO) y su titulo/descripcion declaran "RAN monitoring" de forma explicita, Google la tratara como mejor respuesta que `ai-ran-where-adds-value` para "ran monitoring" y reforzara su posicion en "ran analytics", sin canibalizar al otro post (que conserva el angulo de valor de la IA y recibe un enlace interno).

## Target KPI
Search Console (`dimensions=["query","page"]`), 4 semanas post-deploy: (1) `data-in-ran/` aparece con impresiones para "ran monitoring" y, en direccion, pasa a ser la pagina con mas impresiones o mejor posicion para esa query; (2) en "ran analytics", `data-in-ran/` mantiene o mejora su liderazgo semanal. Contexto (Tier 3): impresiones y posicion de `data-in-ran/` a nivel pagina. Tier 1 (contacto / descarga de CV) se reporta siempre, sin esperar que este cambio solo lo mueva (ver BL-012).

## Guardrail KPI
- `ai-ran-where-adds-value/` no pierde posicion de forma clara en sus queries propias.
- URL sin cambios (`/insights/data-in-ran/`), canonical propio, sin redirecciones; `linkedinUrl`, `pubDate` e imagen sin cambios.
- Build sin errores, 0 enlaces internos rotos, flujo de contacto intacto.

## Baseline
Ver Evidence (checkpoint 2026-10-23). A nivel pagina (todas las queries), 2026-09-25 a 10-21: `data-in-ran/` 29 impr., pos. 53.5; `ai-ran-where-adds-value/` 66 impr., pos. 72.8. Ultima semana (10-15 a 10-21): `data-in-ran/` 9 impr., pos. 73.8.

## Proposed change (rama `content/bl-011-data-in-ran`)
1. `src/content/insights/data-in-ran/index.md`: nuevo `title` ("RAN Monitoring Starts with Data: Building Observability That Operations Can Trust") y `description` orientados a "RAN monitoring"; cuerpo reescrito (422 -> ~1,050 palabras) con 8 H2 y 8 H3, a partir del borrador aprobado por Salvador el 2026-10-23 ("BL-011 – Borrador ampliado data-in-ran").
2. Ajustes al borrador hechos al compararlo con el original (para no perder ideas de Salvador): nueva seccion "More data is not better data" con la tesis del post original (frases de Salvador), un punto equivalente en Key takeaways, se conservan los hashtags del original (sin #BigData).
3. Enlaces internos: a `/insights/ai-ran-where-adds-value/` (titulo real "AI in RAN: Where It Actually Adds Value"; el borrador decia "Really") y al formulario de contacto (`/#contact`).
- **No se toca:** URL, `pubDate`, `coverImage`, `linkedinUrl`, `ai-ran-where-adds-value` (su enlace hacia este post conserva el anchor del titulo anterior), codigo, analitica.

## Quality Gate (2026-10-23, clon limpio en la nube)
Clon de GitHub (`origin/main` e61f72c) + los 7 commits locales aplicados como parches (`git format-patch`; el bundle del repo completo excede el limite de tiempo del puente). `npm ci` + `npm run build`: **150 paginas, 0 errores**, sitemap 150 URLs (incluye `data-in-ran/`). HTML del post: `<title>` y `meta description` nuevos, canonical `https://salvadoribarra.tech/insights/data-in-ran/`, JSON-LD `headline` actualizado, 8 H2 / 8 H3, enlaces a `/insights/ai-ran-where-adds-value/` y `/#contact` presentes, boton de LinkedIn intacto. **0 enlaces internos rotos** en todo el sitio. Chromium headless (`astro preview`), escritorio 1280 px y movil 390 px: HTTP 200, 0 imagenes rotas, sin scroll horizontal; unico error de consola = `googletagmanager.com` bloqueado por el proxy del sandbox (esperado, no es del sitio). Los 3 `linkedinUrl` sincronizados verificados en el HTML.
Hallazgo colateral (no cambiado): los 147 posts renderizan 2 `<h1>` (el layout pinta el `title` y el cuerpo Markdown repite `# titulo`). Patron preexistente de todo el catalogo; candidato a BL propio.

## Deploy Preview #13 (2026-10-23, PR #13)
URL: https://deploy-preview-13--stellular-strudel-c35baa.netlify.app. Verificado desde el navegador integrado del equipo de Salvador con `fetch` (`redirect: "manual"`) desde una pestana con `sitemap-index.xml` (no carga GA4), para no contaminar KPIs; mismo metodo que Deploy Preview #12.
1. `/`, `/insights/`, `/success/`, `/insights/data-in-ran/`, `/insights/ai-ran-where-adds-value/`, `/insights/ee-tradeoff/` y los 3 posts con LinkedIn sincronizado: 200, canonical con `/` hacia salvadoribarra.tech, 0 referencias a Google Fonts, GTM con `async`.
2. `data-in-ran/`: `<title>` y meta description nuevos, 8 H2 / 8 H3, ~1,080 palabras de texto visible, enlaces a `/insights/ai-ran-where-adds-value/` y `/#contact`, imagen `/_astro/data-in-ran.*.webp`, boton "Discuss on LinkedIn" con la URL original. `/insights/data-in-ran` (sin `/`) responde redirect, igual que en produccion.
3. LinkedIn sincronizado: downtilt-antena-cobertura-rf -> lnkd.in/p/eNk8r8Wm; energy-aware-ran -> lnkd.in/p/eEVEjFXw; low-band-vs-mid-band-5g -> lnkd.in/p/ejAFVM4k.
4. Sitemap: 150 URLs, 0 sin `/`, incluye `data-in-ran/`; las 150 responden 200 sin redireccion. 150 enlaces internos distintos (de todas las paginas): 0 rotos. 155 recursos del homepage y del post (imagenes, CSS, JS, preload): 0 fallidos.
5. Formularios: contact -> `/success/`, cv-request presente; CV `/assets/cv/Salvador_Ibarra_Luna_CV.pdf` 200 `application/pdf`. Eventos Tier 1 presentes en el HTML del homepage (GoogleAnalytics.astro no se modifico). No se disparo GA4 en esta validacion.
6. Render visual del post en un iframe sin los scripts de GA4: Inter cargada (`document.fonts.check` true, `h1` en Inter), 0 imagenes rotas, sin scroll horizontal; titulo, descripcion, cuerpo, H2 y Key takeaways correctos. 0 errores de consola, 0 peticiones a dominios de Google.
Resultado: listo para merge.

## Result
Fusionado a `main` via PR #13 (merge commit `98fc33c`, 2026-10-23 ~21:40 hora CDMX = 2026-10-24 ~03:40 UTC); deploy de produccion en verde segun Salvador.
**Verificacion en produccion (2026-10-23, navegador integrado, `fetch` desde `sitemap-index.xml`, sin cargar GA4):** `/insights/data-in-ran/` 200 con `<title>`, meta description, JSON-LD `headline` nuevos, canonical `https://salvadoribarra.tech/insights/data-in-ran/`, 8 H2 / 8 H3, enlaces a `/insights/ai-ran-where-adds-value/` y `/#contact`, boton de LinkedIn con la URL original. Los 3 `linkedinUrl` sincronizados en vivo (lnkd.in/p/eNk8r8Wm, eEVEjFXw, ejAFVM4k). Sitemap: 150 URLs, 0 sin `/`, las 150 en 200 sin redireccion. `/`, `/insights/`, `/success/` 200; CV 200.
**Sitemap reenviado** (`submit_sitemap()`, sitemap-index.xml): `lastSubmitted` **2026-10-24T03:44:06Z**, 150 URLs web, 0 errores, 0 advertencias, `isPending: true` (normal justo despues del envio). Inicio de la ventana de medicion de negocio.
Nota: el `lastmod` de `data-in-ran/` en el sitemap sigue siendo `pubDate` (2026-04-02), porque el sitemap lo deriva de `pubDate` (BL-004); Google no recibe una senal de frescura por esa via. El reenvio del sitemap y el recrawl son la senal disponible sin cambiar el schema.
Medicion de negocio: checkpoint semanal (desde v6 del prompt), ventana de 4 semanas hasta ~2026-11-20.
**Actualizacion (2026-10-23, EXP-017):** `data-in-ran` declara `updatedDate: 2026-10-23`; desde PR #14 el sitemap anuncia `lastmod` 2026-10-23 y el JSON-LD `dateModified` 2026-10-23. Sitemap reenviado 2026-10-24T04:01:56Z.
**Trafico propio conocido (2026-10-23, noche, hora CDMX):** Salvador visito `data-in-ran/` en produccion para revisar el resultado, con GA4 activo (BL-014 aun sin implementar). Esa visita cuenta en GA4 (page_view/sesion, probablemente canal Direct); tenerlo en cuenta al leer el trafico de esta pagina y los canales de esa fecha.

## Decision
Pendiente.

## Learning
Pendiente.

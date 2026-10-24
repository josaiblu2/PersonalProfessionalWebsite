# EXP-014 -- Forma canonica CON diagonal final (corrige la direccion de EXP-010)

> **Clasificacion:** correccion tecnica de SEO sobre EXP-010 (BL-008). Mismo objetivo (una sola URL canonica por pagina), direccion invertida para alinearla con lo que Netlify sirve realmente.

## Experiment ID
EXP-014

## Observation
2026-10-07: Search Console envio la alerta "Nuevo motivo que impide la indexacion de paginas: Pagina con redireccion" (WNC-20237597) para `sc-domain:salvadoribarra.tech`.

## Evidence
- **URL Inspection API (117 URLs, variantes con/sin `/` de las 74 paginas con impresiones):** 51 URLs con `/` "Enviada e indexada"; 40 URLs sin `/` "Pagina con redireccion". En las paginas rastreadas despues del deploy de EXP-010 (ej. `/insights/biggest-misconception`, rastreo 2026-10-01) Google elige como canonica la version CON `/` aunque el canonical declarado es SIN `/`.
- **Produccion (fetch en navegador, 2026-10-07):** `/insights/<slug>` -> 301 -> `/insights/<slug>/` (tambien `/insights` y `/success`). La forma con `/` responde 200 directo.
- **Senales declaradas por el sitio (todas sin `/`):** canonical, `og:url`, `twitter:url`, JSON-LD `@id`, `sitemap-0.xml` (144 URLs), enlaces internos (nav, home, listado, posts) y enlaces para compartir.
- Sitemap reenviado 2026-09-24, descargado por Google 2026-10-05 -> cada URL del sitemap es una redireccion -> origen de la alerta.

## Causa raiz
EXP-010 fijo `trailingSlash: 'never'`, pero Astro sigue generando `build.format: 'directory'` (`insights/<slug>/index.html`) y Netlify sirve los directorios agregando la diagonal con 301. Las senales (sin `/`) contradecian el comportamiento real del servidor (con `/`). La verificacion de EXP-010 no lo detecto porque WebFetch sigue redirecciones de forma transparente y la prueba se enfoco en la redireccion contraria (`/` -> sin `/`).

## Hypothesis
Si canonical, sitemap y enlaces internos declaran la misma URL que el servidor sirve sin redireccion (forma con `/`), Google dejara de reportar "Pagina con redireccion" para URLs del sitemap, respetara el canonical declarado y consolidara la senal en una sola URL por post, sin migrar las ~51 URLs con `/` que ya tiene indexadas.

## Target KPI
Tecnico: URLs del sitemap con estado "Pagina con redireccion" -> 0 (Search Console, informe de indexacion / URL Inspection). Contexto (Tier 3): impresiones y posicion media por post consolidadas en la URL con `/`.

## Guardrail KPI
Cero regresion funcional: 144 paginas construyen, 0 enlaces internos rotos, flujo `/success/` (Tier 1 contacto) intacto, `tier1_cv_download_conversion` sin cambios, sin loops de redireccion.

## Baseline
Ver Evidence (2026-10-07): 40 URLs sin `/` "Pagina con redireccion"; 144/144 URLs del sitemap redirigen; Google ignora el canonical en las paginas rastreadas post-EXP-010.

## Proposed change (implementado en rama `fix/trailing-slash-always`)
1. `astro.config.mjs`: `trailingSlash: 'always'`; `serialize` del sitemap agrega `/` final (conserva `lastmod` de BL-004).
2. `src/layouts/MainLayout.astro`: canonical / `og:url` / `twitter:url` normalizados con `/`; enlace del menu `/insights/`.
3. `src/components/InsightsFeed.astro`: 3 enlaces `/insights/${post.slug}/`.
4. `src/pages/insights/[slug].astro`: `shareUrl` (botones de compartir + JSON-LD `@id`) con `/`; 2 enlaces "volver" a `/insights/`.
5. 3 enlaces internos en Markdown (`ai-ran-where-adds-value`, `network-slicing-automation`, `NetworkSlicing`) con `/` (solo el formato del enlace; sin cambios de texto).
6. `public/_redirects`: retiradas las 2 reglas sin forzar de EXP-010 (`/insights/:slug/ -> /insights/:slug`), que apuntaban en la direccion contraria y nunca se activaban. Queda un comentario con la advertencia del loop.
- **No se toca:** `netlify.toml`, `build.format`, `Contact.astro` (`action="/success/"` ya usa `/`), analitica.

## Pre-change commit hash
444b350 (HEAD de `main` local; produccion = 3cf92da + docs). Rollback: `git revert` del commit `fix(seo): EXP-014 ...` o redeploy del deploy anterior desde Netlify.

## Risk
Bajo. Se alinea con el comportamiento nativo de Netlify (no se agrega ninguna redireccion nueva, no hay riesgo de loop). Riesgo residual: Google tarda en recrawlear; la alerta puede persistir algunas semanas mientras procesa el sitemap nuevo. Las URLs sin `/` seguiran apareciendo como "Pagina con redireccion" en el informe -- es lo esperado y correcto (ya no estan en el sitemap ni se enlazan).

## Validacion realizada (2026-10-07) -- Quality Gate local-first
1. Build en **clon limpio** de la rama (`git clone` + `npm ci` + `npm run build`): 144 paginas, exit 0.
2. `dist/sitemap-0.xml`: 144 URLs, 0 sin `/` final, 141 `lastmod`.
3. 145 HTML: canonical, `og:url`, `twitter:url` y JSON-LD `@id` con `/` en todas las paginas (unica excepcion: `forms.html`, archivo estatico de deteccion de Netlify Forms, sin canonical, preexistente).
4. 2429 `href` internos: 0 sin `/` final (excluyendo archivos), 0 rotos.
5. `action="/success/"` intacto; `dist/success/index.html` presente.
6. LinkedIn sync (v1.9): `linkedinUrl` presentes en el HTML de `from-kpi-dashboards` y `rapps-vs-xapps`.

## Pendiente post-merge
1. Verificar en produccion: canonical con `/`, sitemap con `/`, `/insights/<slug>/` 200 sin redireccion, `/success/` OK.
2. Reenviar `sitemap-index.xml` en Search Console (skill `submit-sitemap`).
3. Opcional: "Validar correccion" en el informe "Pagina con redireccion" de Search Console (accion de Salvador en la UI).

## Approval status
Opcion A aprobada explicitamente por Salvador el 2026-10-07. Pendiente: revision de Deploy Preview, push y merge (acciones de Salvador).

## Measurement window
2026-10-07 + 2-4 semanas (recrawl). Primera revision ~2026-10-21. Sustituye la ventana de medicion de negocio de EXP-010 (prevista 2026-10-08 a 10-22), que medía una consolidacion que no estaba ocurriendo en la direccion prevista.

## Result
**Verificacion post-merge (2026-10-10, pendientes 1 y 2 de "Pendiente post-merge" cerrados):**
1. **Produccion** (navegador real del equipo de Salvador, `fetch` con `redirect: "manual"` para exponer cada salto, no WebFetch): `/insights/ee-tradeoff/` -> 200; `/insights/massive-mimo-not-deliver-gains/` -> 200; `/insights/` -> 200; `/` -> 200; `/success/` -> 200. Las formas sin `/` (`/insights/ee-tradeoff`, `/insights`) -> 3xx hacia la forma con `/` (esperado: ya no estan en el sitemap ni se enlazan). En `ee-tradeoff/`: canonical, `og:url` y JSON-LD `@id` = `https://salvadoribarra.tech/insights/ee-tradeoff/`; enlaces "Insights" y "volver" -> `/insights/`. `sitemap-0.xml`: 144 `<loc>`, 0 sin `/` final. Homepage: formulario `contact` con `action="/success/"` intacto; CV en `/assets/cv/Salvador_Ibarra_Luna_CV.pdf`. Sin loops de redireccion. Nota: abrir la pagina en el navegador pudo registrar 1 page_view interno en GA4 (2026-10-10); las verificaciones de estado se hicieron con `fetch`, que no dispara GA4.
2. **Sitemap** (`get_sitemaps_status()`, solo lectura): `sitemap-index.xml` reenviado 2026-10-07T23:40:44Z (~2 min despues del merge de PR #10), descargado por Google 2026-10-08T00:08:13Z, 0 errores, 0 advertencias, 144 URLs enviadas.
3. Pendiente opcional 3 ("Validar correccion" en el informe "Pagina con redireccion"): **DESCARTADO (2026-10-10).** Las URLs de ese informe son las variantes SIN `/`, que siguen redirigiendo a proposito (comportamiento correcto y deseado tras EXP-014). "Validar correccion" pide a Google confirmar que esas URLs ya no redirigen; como si redirigen, la validacion terminaria en "Fallida", sin ningun beneficio de indexacion y con una senal confusa en el informe. "Pagina con redireccion" no es un error en este caso: es la clasificacion correcta de una URL alternativa. La correccion real ya ocurrio (el sitemap y los enlaces ya no apuntan a URLs que redirigen) y Google la procesara en su recrawl normal. Se mantiene la misma conclusion a la que Salvador ya habia llegado en una sesion anterior con Claude (no registrada en el ledger en su momento).

Resultado tecnico: exitoso, guardrails cumplidos. Resultado de negocio (desaparicion de "Pagina con redireccion" para URLs del sitemap, consolidacion por post): pendiente de la ventana de medicion, primera revision ~2026-10-21.

**Actualizacion checkpoint semanal (2026-10-16, 9 dias post-deploy):** primera revision con datos de Search Console post-EXP-014. `dimensions=["date"]`: ultimo dia con datos **2026-10-14** -> 8 dias post-deploy (2026-10-07 a 10-14; 7 completos, 2026-10-08 a 10-14). (1) **URLs sin `/` con impresiones (todo el sitio, `dimensions=["page"]`):** 2026-10-08 a 10-14 -> 1 URL sin `/` (`/insights/l4-autonomous-networks`, 1 impr.) de 41 paginas con impresiones; en la ventana previa 2026-09-25 a 10-06 eran 7 URLs sin `/` (23 impr.) de 52. Direccion coherente con la hipotesis (Google muestra casi exclusivamente la forma con `/`). (2) **BL-008:** `ee-tradeoff/` 44 impr., pos. 23.5 y `massive-mimo-not-deliver-gains/` 8 impr., pos. 53.4, una sola URL por post, 0 filas sin `/` (detalle en EXP-010). (3) **Sitemap** (`get_sitemaps_status()`, solo lectura): `sitemap-index.xml` ultimo envio 2026-10-10T04:49:21Z, descargado por Google 2026-10-10T05:16:27Z, 150 URLs enviadas (antes 144; incluye los 6 posts de PR #11), 0 errores, 0 advertencias, `isPending: false`. El campo `indexed` de la API aparece en 0; no se usa como senal de desindexacion. (4) Posicion media de todo el sitio por dia (contexto): 24.5-39.1 entre 2026-10-08 y 10-12, 48.1 y 43.4 el 2026-10-13/10-14 (vs. 28.0-38.8 en 2026-10-01 a 10-07) -- variacion a vigilar; coincide con la entrada de 6 posts nuevos (PR #11) y con el recrawl, sin datos suficientes para atribuirla. No medido en esta corrida: el conteo de "Pagina con redireccion" del informe de indexacion (no disponible via `analytics_readonly.py`; requiere URL Inspection API o la UI). Normal para 1 semana de recrawl; primera revision formal ~2026-10-21.

**Actualizacion checkpoint semanal (2026-10-23, 16 dias post-deploy):** `dimensions=["date"]`: ultimo dia con datos **2026-10-21** -> 15 dias post-deploy (2026-10-07 a 10-21; 14 completos, 2026-10-08 a 10-21). (1) **URLs sin `/` con impresiones (todo el sitio, `dimensions=["page"]`):** 2026-10-15 a 10-21 -> **0** URLs sin `/` de 56 paginas con impresiones (semana previa 2026-10-08 a 10-14: 1 de 41; 2026-09-25 a 10-06: 7 de 52). Ventana post-EXP-014 completa (2026-10-08 a 10-21): 1 URL sin `/` (`/insights/l4-autonomous-networks`, 1 impr.) de 63. Direccion coherente con la hipotesis: en la ultima semana Google mostro exclusivamente la forma con `/`. (2) **BL-008:** `ee-tradeoff/` 23 impr., pos. 16.3 y `massive-mimo-not-deliver-gains/` 15 impr., pos. 80.1 en la ultima semana, una sola URL por post, 0 filas sin `/` (detalle en EXP-010). (3) **Sitemap** (`get_sitemaps_status()`, solo lectura): `sitemap-index.xml` ultimo envio 2026-10-10T04:49:21Z, descargado por Google 2026-10-19T07:30:15Z (nueva descarga desde la revision anterior), 150 URLs enviadas, 0 errores, 0 advertencias, `isPending: false`; el campo `indexed` sigue en 0 y no se usa como senal de desindexacion. (4) **Posicion media de todo el sitio por dia (contexto):** 2026-10-15 a 10-21 -> 72.7, 47.8, 43.1, 54.6, 35.9, 41.2, 43.7 (vs. 24.5-48.1 en 2026-10-08 a 10-14 y 28.0-38.8 en 2026-10-01 a 10-07); impresiones diarias 40-63, estables o ligeramente mayores; paginas con impresiones 56 vs. 41 la semana previa. La posicion media empeora por segunda semana consecutiva mientras aumenta el numero de paginas con impresiones (incluye posts nuevos de PR #11 en posiciones profundas); sin evidencia suficiente para atribuirlo a EXP-014. 0 clics en todo el sitio desde 2026-10-08. No medido en esta corrida: el conteo de "Pagina con redireccion" del informe de indexacion (requiere URL Inspection API o la UI). Normal para ~2 semanas de recrawl; el KPI de contexto (impresiones solo en la forma con `/`) se cumple en la ultima semana.

## Decision
**KEEP (2026-10-23, sesion en vivo con Salvador, con base en el Reporte-SEO-2026-10-23).** El objetivo de BL-008 (una sola URL por post) se cumple y es estable: cada post aparece como una sola URL, la forma con `/`, por cuarta revision consecutiva del checkpoint semanal (detalle por revision en EXP-010), y en la ultima semana con datos (2026-10-15 a 10-21) hay **0** URLs sin `/` con impresiones en todo el sitio (0 de 56), frente a 7 de 52 antes de EXP-014 (2026-09-25 a 10-06). Sitemap: 150 URLs, 0 errores, 0 advertencias, descargado por Google 2026-10-19. Guardrails tecnicos cumplidos desde el deploy (sin regresion funcional, `/success/` y eventos Tier 1 intactos, sin loops de redireccion). La ventana de 4 semanas de PR #7 se cumplio el 2026-10-22 sin impresiones divididas, por lo que no hace falta `build.format: 'file'` (opcion B).

Limites de la evidencia: el conteo de "Pagina con redireccion" del informe de indexacion no se volvio a medir con URL Inspection (la senal usada es Search Analytics por pagina); las URLs sin `/` siguen redirigiendo 301 a proposito, por lo que ese motivo es informativo y no se usa "Validar correccion". La posicion media del sitio empeoro dos semanas seguidas mientras crecio el numero de paginas con impresiones; no hay evidencia que la atribuya a EXP-014 y se sigue como contexto general, no como KPI de este experimento.

Consecuencia: BL-008 queda resuelto y sale del checkpoint semanal (Work Project Instructions v1.25).

## Learning
- Verificar redirecciones con una herramienta que exponga el hop (navegador real con `fetch` -> `response.redirected`, o `curl -I`), no con WebFetch, que las sigue de forma transparente.
- En Astro + Netlify con `build.format: 'directory'`, la forma canonica compatible de forma nativa es CON diagonal final; elegir la contraria exige cambiar el formato de build.

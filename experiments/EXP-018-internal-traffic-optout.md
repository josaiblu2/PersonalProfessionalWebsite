# EXP-018 -- Excluir el trafico propio de GA4 (interruptor `?internal=on`) y las visitas de Lighthouse

## Experiment ID
EXP-018 (origen: BL-014)

## Observation
Salvador visita su propio sitio para verificar cambios (ej. 2026-10-23, `data-in-ran/` tras EXP-016) y esas visitas cuentan en GA4 como trafico normal. Con un volumen muy bajo (desde 2026-10-17 solo 2 `page_view` / 2 `session_start`), unas pocas visitas propias distorsionan los KPI de contexto y, si prueba formularios, contaminarian el KPI Tier 1.

## Evidence
Ver BL-014. `src/components/GoogleAnalytics.astro` (antes del cambio) ejecutaba `gtag('config', 'G-Q023R5XBS1')` sin ninguna exclusion. Ademas, el checkpoint semanal corre ~4 mediciones de PageSpeed/Lighthouse por semana contra el homepage; no esta verificado si GA4 las registra.

## Hypothesis
Si un navegador marcado (`?internal=on`, marca en `localStorage`) y el user agent de Lighthouse/PageSpeed activan `ga-disable-G-Q023R5XBS1` antes de `gtag('config')`, esos navegadores no enviaran ningun hit a GA4, sin cambiar la medicion de los visitantes reales.

## Target KPI
Tecnico: 0 peticiones a `google-analytics.com/g/collect` desde un navegador marcado o con UA de Lighthouse; visitantes sin marca con `page_view` y eventos Tier 1 igual que antes.

## Guardrail KPI
- Visitantes reales: `page_view`, `tier1_contact_conversion` y `tier1_cv_download_conversion` sin cambios.
- Formularios de contacto y CV funcionan igual con y sin marca (no esperan respuesta de GA4).
- Sin errores de JavaScript; GTM sigue `async` (EXP-008).

## Approval status
Metodo (opcion 1b de BL-014 + exclusion de Lighthouse) aprobado explicitamente por Salvador el 2026-10-23 (cambio de configuracion de analitica); implementacion pedida el 2026-10-24.

## Proposed change (rama `feat/internal-traffic-optout`)
`src/components/GoogleAnalytics.astro`: nuevo script inline ANTES de la etiqueta de `gtag.js`:
1. `?internal=on` guarda `sib_internal_traffic=1` en `localStorage`; `?internal=off` lo borra. El parametro se elimina de la URL con `history.replaceState` (conserva otros parametros y el `#`).
2. Con la marca, o con user agent que contenga `Chrome-Lighthouse` / `Google Page Speed Insights`, se define `window['ga-disable-G-Q023R5XBS1'] = true`.
3. Al activar/desactivar se muestra un aviso breve (5 s) y un `console.info`, para confirmarlo tambien en el celular.
4. Si `localStorage` no esta disponible (navegador restringido), GA4 se comporta como siempre.
- **No se toca:** `gtag('config')`, `Contact.astro`, `Hero.astro`, ID de medicion, `async` de GTM.

## Quality Gate (2026-10-24, clon limpio en la nube)
`origin/main` 70ed7f0 + 4 commits locales como parches: `npm run build` 150 paginas, 0 errores. En las 150 paginas con GA4 el orden es marca -> `gtag.js` -> `gtag('config')`.
Pruebas en Chromium headless con `astro preview`, sustituyendo `gtag.js` por un stub local que replica la regla documentada de Google (no envia si `ga-disable-<ID>` esta activo) y respondiendo localmente a `/g/collect` (ningun hit llego a la propiedad real):
| Escenario | Hits a `/g/collect` | Otros resultados |
|---|---|---|
| A. Visitante normal, `data-in-ran/` | `page_view` | -- |
| E1. Visitante normal envia el formulario de contacto | `tier1_contact_conversion` | POST a `/success/` |
| B. `/?internal=on` | ninguno | marca guardada, URL limpia, aviso "GA4 desactivado en este navegador" |
| B2. Misma sesion, otra pagina sin parametro | ninguno | sin aviso |
| E2. Con marca, envia el formulario de contacto | ninguno | POST a `/success/` (formulario intacto) |
| C. `/?internal=off` | `page_view` | marca borrada, aviso "GA4 reactivado" |
| D. User agent de Lighthouse | ninguno | -- |
| F. `/insights/?utm_source=linkedin&internal=on#x` | -- | URL final `/insights/?utm_source=linkedin#x` |
0 errores de JavaScript en todos los escenarios.
Limite: el stub replica el comportamiento documentado de `ga-disable`; la verificacion con el `gtag.js` real se hace en produccion con la marca activa (debe haber 0 peticiones a `/g/collect`), lo que no genera hits.

## Deploy Preview #15 (2026-10-24, PR #15)
URL: https://deploy-preview-15--stellular-strudel-c35baa.netlify.app. Navegador integrado del equipo de Salvador. Para no arriesgar ningun hit, la marca se puso primero en `localStorage` desde una pestana de `sitemap-index.xml` (sin GA4) y solo despues se cargaron paginas con GA4.
1. Sitemap 150 URLs, las 150 en 200; en las 150 el orden es marca -> `gtag.js` (async) -> `gtag('config')`. 158 enlaces internos, 0 rotos. Formularios `cv-request` y `contact` presentes, eventos Tier 1 en el HTML, CV 200.
2. **Con el `gtag.js` real de Google:** `/insights/data-in-ran/?internal=on` -> aviso "GA4 desactivado en este navegador (trafico interno)." visible, `console.info` `[BL-014]`, URL final sin el parametro, `window['ga-disable-G-Q023R5XBS1'] === true`, `gtag.js` cargado, `gtag` definida y **0 peticiones a google-analytics.com / `/g/collect`**.
3. Homepage con la marca, con scroll de toda la pagina y 4 s de espera (medicion mejorada de GA4): 0 peticiones a `/g/collect`, sin aviso (correcto: solo aparece al cambiar la marca), 0 errores de consola.
No se probo el caso "sin marca" con el `gtag.js` real para no generar hits; ese camino no cambia respecto a produccion (la marca solo agrega `ga-disable`), y se cubrio con el stub en el Quality Gate.
Resultado: listo para merge.

## Result
Fusionado a `main` via PR #15 (merge commit `3159af4`, 2026-10-24 noche, hora CDMX); deploy en verde segun Salvador. Dentro de la excepcion de creditos (2026-10-19 a 2026-11-18).
**Activacion por Salvador (2026-10-24):** entro a `https://salvadoribarra.tech/?internal=on` desde los navegadores de su computadora y de su celular; en todos vio el aviso "GA4 desactivado en este navegador". Desde ese momento sus visitas en esos navegadores no cuentan en GA4.
**Verificacion en produccion (2026-10-25, navegador integrado del agente; marca puesta primero desde `sitemap-index.xml`):** sitemap 150 URLs, las 150 en 200 y con el orden marca -> `gtag.js` -> `config`; `/success/` y CV 200. Homepage con `?internal=on`: aviso en consola `[BL-014]`, URL limpia, `ga-disable` activo, `gtag.js` real cargado, recorrido completo con scroll y 4 s de espera: **0 peticiones a `/g/collect`**. El navegador integrado del agente queda marcado como trafico interno en salvadoribarra.tech.
Corte de datos: a partir del 2026-10-24 (noche, CDMX) los conteos de GA4 excluyen las visitas de Salvador en sus navegadores marcados y las de Lighthouse/PageSpeed; los conteos anteriores pueden incluirlas (no se pueden separar retroactivamente).

## Decision
**KEEP (tecnico, 2026-10-25).** Cumple el KPI tecnico (0 hits desde navegadores marcados, con el `gtag.js` real) sin cambiar la medicion de visitantes reales ni los formularios.

## Learning
1. La marca vive en `localStorage` por sitio y por navegador: se pierde al borrar datos del sitio, no aplica en incognito y hay que activarla en cada navegador o dispositivo nuevo. Comprobacion: volver a entrar con `?internal=on` (el aviso solo aparece al cambiar la marca).
2. Validar cambios de analitica sin contaminar la propiedad: poner la marca desde una pagina sin GA4 del mismo origen antes de cargar paginas con GA4; el caso "sin marca" se prueba con un stub local de `gtag.js`.
3. Los envios de formularios de prueba siguen llegando a Netlify Forms aunque GA4 no los registre: las pruebas de formulario se hacen en Deploy Preview.

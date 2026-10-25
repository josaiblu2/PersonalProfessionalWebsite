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

## Result
Pendiente (Deploy Preview y produccion).

## Decision
Pendiente.

## Learning
Pendiente.

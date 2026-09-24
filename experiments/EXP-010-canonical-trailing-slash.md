# EXP-010 -- Canonical fijo, `trailingSlash` y redirects 301 (BL-008)

## Experiment ID
EXP-010

## Observation
Multiples posts de Insights aparecen indexados por Google Search Console como dos URLs distintas -- con y sin `/` final -- cada una acumulando impresiones por separado para las mismas queries, en vez de consolidar toda la senal en una sola URL.

## Evidence
Consulta de Search Console (`dimensions=["query","page"]`, 2026-06-21 a 2026-09-21) mostro el par duplicado para al menos 2 posts de alto trafico: `ee-tradeoff` (138 impresiones sin slash vs. 2 con slash) y `massive-mimo-not-deliver-gains` (121 vs. 153 impresiones, practicamente divididas a la mitad). Verificado en codigo: `astro.config.mjs` no definia `trailingSlash` (default `ignore`); `MainLayout.astro` calculaba el canonical como `new URL(Astro.url.pathname, siteUrl)`, autorreferenciandose a la URL exacta solicitada en vez de normalizar siempre a una sola forma; y el `sitemap.xml` generado anunciaba todas las URLs de Insights CON diagonal final (`https://salvadoribarra.tech/insights/<slug>/`), mientras que todos los enlaces internos del sitio (`InsightsFeed.astro`, `[slug].astro`) usan la forma SIN diagonal final -- una inconsistencia directa entre lo que el sitio le dice a Google via sitemap y lo que realmente enlaza. Registrado como **BL-008** en `experiments/BACKLOG.md`.

## Hypothesis
Fijar una sola forma canonica de URL (sin diagonal final, la que ya usan los enlaces internos), corregir el calculo del canonical para que no dependa de la URL solicitada, alinear el sitemap a la misma forma, y agregar redirects 301 para la variante no elegida, permitira que Google consolide gradualmente ambas URLs duplicadas en una sola, dejando de dividir impresiones/clics entre ellas.

## Target KPI
Search Console: impresiones por pagina para `ee-tradeoff` y `massive-mimo-not-deliver-gains` deben consolidarse en una sola entrada de URL (sin diagonal final) en las semanas posteriores al redespliegue del sitemap. Guardrail secundario: posicion promedio de esas paginas no debe empeorar.

## Guardrail KPI
Cero regresion funcional: el conteo de paginas generadas por el build debe mantenerse en 144; ningun enlace interno debe romperse; el flujo de conversion Tier 1 (`/success/`, formulario de contacto) no debe verse afectado -- deliberadamente fuera de alcance de este experimento.

## Baseline
`astro.config.mjs`: sin `trailingSlash` definido. `MainLayout.astro`: canonical autorreferencial. `sitemap.xml`: 141 URLs de Insights con diagonal final. Sin archivo `public/_redirects`. Duplicacion confirmada en Search Console para al menos 2 posts (ver Evidence).

## Proposed change (implementado)
1. `astro.config.mjs`: agregado `trailingSlash: 'never'`; el `serialize()` del sitemap ahora normaliza toda URL a la forma sin diagonal final (excepto la raiz `/`) antes de aplicar la logica existente de `lastmod`.
2. `src/layouts/MainLayout.astro`: `canonicalURL` ahora se calcula sobre un `normalizedPathname` que despoja la diagonal final de `Astro.url.pathname` (excepto para la raiz `/`), en vez de usarlo tal cual.
3. `public/_redirects` (nuevo archivo): dos reglas 301 -- `/insights/ -> /insights` y `/insights/:slug/ -> /insights/:slug` -- para que Netlify redirija tambien las URLs ya indexadas por Google en la variante con diagonal final.

Deliberadamente fuera de alcance: `/success/` (accion del formulario de `Contact.astro`) no se toca, para mantener la disciplina de una sola variable causal y no arriesgar el flujo de conversion Tier 1 ya validado.

## Pre-change commit hash
8757aad (merge de PR #6 / EXP-008+EXP-009 a main)

## Risk
Medio. Es un cambio de infraestructura de URLs (canonical, sitemap, redirects), no solo de contenido. El riesgo principal es que una regla de redireccion mal configurada afecte temporalmente URLs ya indexadas o rutas no previstas -- mitigado con: (a) eleccion de la forma sin diagonal final, que ya coincide con el 100% de los enlaces internos existentes, por lo que no se modifico ningun `href`; (b) exclusion explicita de `/success/`; (c) validacion exhaustiva en Deploy Preview antes de fusionar (ver Validacion realizada).

## Implementation reference
Rama: `feat/canonical-trailing-slash` (desde `main` post-EXP-008/EXP-009). Archivos: `astro.config.mjs` (modificado), `src/layouts/MainLayout.astro` (modificado), `public/_redirects` (nuevo).

## Validacion realizada (2026-09-24)
1. Build local exitoso: 144 paginas construidas sin errores (mismo conteo que el baseline).
2. `dist/sitemap-0.xml`: verificado que cero URLs de Insights conservan diagonal final (antes: 141).
3. Canonical verificado en produccion simulada (`dist/`) para: `ee-tradeoff`, `massive-mimo-not-deliver-gains`, `cloud-ran`, `oran-plain`, `data-in-ran`, `networkslicing`, `network-slicing-automation`, homepage (`/`, sin cambio) y listado de Insights (`/insights`, sin diagonal final).
4. `dist/success/index.html`: canonical normalizado a `/success` sin diagonal final; comportamiento del formulario de contacto no modificado (el `action="/success/"` de `Contact.astro` no fue tocado, y la resolucion de archivos estaticos de Netlify sirve el mismo `index.html` para ambas variantes independientemente de la configuracion de `trailingSlash` de Astro, que no cambia el formato de salida del build estatico).
5. `dist/_redirects` confirmado presente y con el contenido esperado tras el build.
6. **Validado en Deploy Preview #7 (2026-09-24) -- se encontro y corrigio un bug real:** las reglas de `_redirects` NO se estaban aplicando (`/insights/ee-tradeoff/` y `/insights/massive-mimo-not-deliver-gains/` devolvian 200, no 301). Causa: Netlify ignora por defecto un redirect cuando la ruta de origen coincide con un archivo estatico existente (aqui, `dist/insights/<slug>/index.html` existe fisicamente), a menos que se fuerce con `!` despues del codigo de estado. Corregido agregando `301!` a ambas reglas. Sin este fix, BL-008 no habria resuelto el problema que originalmente motivo el experimento.
7. Confirmado en el mismo Deploy Preview (antes del fix de redirects, que no afecta lo demas): homepage sin errores de consola; `/insights` (listado) renderiza correctamente; los 4 enlaces internos de EXP-011 (`ai-ran-where-adds-value` -> `data-in-ran`, `networkslicing` <-> `network-slicing-automation`) presentes y con el `href` correcto; `/success/` sigue cargando normalmente (200, sin tocar) -- el flujo de conversion Tier 1 no se vio afectado.
8. Pendiente: confirmar el 301 real una vez que Salvador haga push del fix del `!` y Netlify reconstruya el mismo Deploy Preview.

## Approval status
BL-008 aprobado por Salvador para su implementacion el 2026-09-24 ("Vamos a empezar a implementar por BL-008"), con instruccion explicita de: validar localmente, generar Deploy Preview, verificar redirects 301 ahi antes de fusionar, documentar la forma canonica elegida y su razon, y dejar el PR sin fusionar hasta su revision y confirmacion.

## Measurement window
Tecnico (redirects, canonical, sitemap): inmediato, verificable en el Deploy Preview y en produccion tras el merge. De negocio (consolidacion de impresiones en Search Console): 2-4 semanas tras el redespliegue del sitemap en Search Console, dado el tiempo que Google tarda en recrawlear y consolidar URLs.

## Result
(a completar tras la validacion en Deploy Preview)

## Decision
Pendiente de validacion en Deploy Preview y de la confirmacion de merge por parte de Salvador.

## Learning
(a completar tras el despliegue y el periodo de medicion en Search Console)

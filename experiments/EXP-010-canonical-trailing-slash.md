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
8. **Se probo el forzado (`!`) y se revirtio (2026-09-24):** al forzar la regla, se produjo un LOOP INFINITO de redirecciones -- confirmado independientemente via fetch automatizado y navegador real, ambos con error de "demasiadas redirecciones", tanto en `/insights/ee-tradeoff/` como en `/insights/ee-tradeoff` (sin slash). Causa raiz: Astro genera cada post en formato "directorio" (`insights/<slug>/index.html`); Netlify, al servir ese directorio, re-agrega internamente la diagonal final, y la regla forzada la quitaba de nuevo -- ninguna de las dos partes cedia. Esto habria roto las 141 paginas de Insights si se hubiera fusionado asi, no solo las 2 URLs duplicadas originales. Revertido a `301` sin forzar en el mismo Deploy Preview: Netlify vuelve a ignorar la regla quando existe el archivo estatico coincidente (comportamiento confirmado seguro, sin loop).
9. **Decision de alcance:** la consolidacion activa via redirect 301 real requeriria cambiar `build.format` a `'file'` en `astro.config.mjs` (para que Astro genere `insights/<slug>.html` en vez de `insights/<slug>/index.html`, eliminando la ambiguedad de directorio). Ese cambio es mas invasivo de lo que BL-008 preveia originalmente y afecta como Netlify resuelve `/success/` (la accion del formulario de contacto, un flujo de conversion Tier 1 protegido), por lo que se deja fuera de este experimento y se documenta como posible follow-up separado (no registrado aun como BL formal, pendiente de que Salvador decida si vale la pena perseguirlo).
10. Con el redirect sin forzar, la unica via de consolidacion en este experimento es el canonical tag + sitemap.xml corregidos -- ambos ya validados sin ningun riesgo de loop, funcionando correctamente en produccion simulada y en el Deploy Preview #7.

## Approval status
BL-008 aprobado por Salvador para su implementacion el 2026-09-24 ("Vamos a empezar a implementar por BL-008"), con instruccion explicita de: validar localmente, generar Deploy Preview, verificar redirects 301 ahi antes de fusionar, documentar la forma canonica elegida y su razon, y dejar el PR sin fusionar hasta su revision y confirmacion.

## Measurement window
Tecnico (redirects, canonical, sitemap): inmediato, verificable en el Deploy Preview y en produccion tras el merge -- confirmado 2026-09-24. De negocio (consolidacion de impresiones en Search Console): reloj iniciado el 2026-09-24, cuando Salvador reenvio manualmente `sitemap-index.xml` en Search Console (estado "Correcto"; "Paginas descubiertas: 0" en el momento del envio es esperado -- Google aun no ha vuelto a recrawlear, no indica un problema). Ventana de 2-4 semanas: revisar entre 2026-10-08 y 2026-10-22.

## Result
Fusionado a `main` via PR #7 (merge commit `6c07776`) y confirmado en produccion el 2026-09-24. Verificado en vivo en salvadoribarra.tech: (1) canonical de `ee-tradeoff` normalizado a `https://salvadoribarra.tech/insights/ee-tradeoff` (sin diagonal final, sin autorreferencia); (2) `sitemap-0.xml` de produccion con cero URLs de Insights con diagonal final (144 URLs listadas, todas normalizadas); (3) `/insights/ee-tradeoff` (sin slash) resuelve en un solo salto limpio (200) hacia la forma con slash via el propio servido de directorios de Netlify -- sin loop, confirmado tambien para `/insights/massive-mimo-not-deliver-gains/`; (4) `/success/` (flujo de conversion Tier 1) intacto, 200, sin errores. Resultado tecnico: exitoso y sin regresiones. Resultado de negocio (consolidacion de impresiones de las 2 URLs duplicadas en Search Console): pendiente del periodo de medicion (ver Measurement window) -- proxima revision estimada ~2026-10-08 a 2026-10-22.

## Decision
KEEP (infraestructura de URLs: trailingSlash, canonical, sitemap). El redirect 301 activo se mantiene en su forma sin forzar (no consolida activamente las 2 URLs ya indexadas, pero tampoco arriesga las 141 paginas de Insights); la consolidacion de esas 2 URLs queda delegada al canonical+sitemap corregidos, sujeta a confirmacion en el proximo corte de Search Console. Reevaluar como REVISAR si, pasadas 4 semanas, Search Console sigue mostrando impresiones divididas para `ee-tradeoff` y `massive-mimo-not-deliver-gains` -- en ese caso, el siguiente paso natural es `build.format: 'file'` (permite un redirect 301 forzado real sin el loop), evaluando primero su impacto en `/success/`.

## Learning
1. `trailingSlash` en Astro solo controla el ruteo/dev-server; NO cambia el formato de salida del build estatico (`build.format`, que sigue siendo `directory` por defecto: `<ruta>/index.html`). Un redirect forzado (`!` en `_redirects`) que despoja la diagonal final choca con el propio servido de directorios de Netlify, que la vuelve a agregar -- creando un loop infinito que habria afectado las 141 paginas de Insights, no solo las 2 URLs con evidencia directa de duplicacion. Se detecto en Deploy Preview antes de fusionar, gracias a validacion cruzada independiente (browser + WebFetch) en vez de confiar en una sola senal de error ambigua.
2. Reenviar el sitemap actualizado en Search Console requiere permiso de escritura (`webmasters` scope) que la cuenta de servicio de solo lectura de este proyecto no tiene (`webmasters.readonly`, ver `claude/ga4-search-console-readonly-access.md`) -- es una accion manual pendiente de Salvador en la interfaz de Search Console, no automatizable con el acceso actual.

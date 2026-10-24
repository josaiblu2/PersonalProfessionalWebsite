# EXP-017 -- Campo `updatedDate`: senal de frescura para posts actualizados

## Experiment ID
EXP-017 (origen: BL-015; soporte de EXP-016)

## Observation
Tras el deploy de EXP-016 (PR #13), el sitemap siguio anunciando `lastmod` 2026-04-02 para `data-in-ran/` y el JSON-LD no tiene `dateModified`.

## Evidence
Produccion 2026-10-23: `sitemap-0.xml` -> `data-in-ran/` `lastmod` 2026-04-02T00:00:00.000Z. `astro.config.mjs` (BL-004) deriva `lastmod` de `pubDate`; `src/pages/insights/[slug].astro` solo emite `datePublished`.

## Hypothesis
Si los posts con cambios sustanciales declaran `updatedDate`, y esa fecha alimenta `lastmod`, `dateModified` y una etiqueta visible "Updated", Google detectara y recorrera antes la version nueva, acelerando la medicion de EXP-016, sin alterar el orden del listado ni la fecha de publicacion original.

## Target KPI
Tecnico: `lastmod` de `data-in-ran/` = 2026-10-23 en el sitemap de produccion; `dateModified` presente. Contexto: fecha de ultimo rastreo de `data-in-ran/` (URL Inspection o Search Console) y aparicion de las nuevas impresiones de EXP-016.

## Guardrail KPI
Los otros 146 posts sin cambios (mismo `lastmod`, `dateModified` = `datePublished`, sin etiqueta); orden del listado intacto; build sin errores, 0 enlaces rotos.

## Proposed change (rama `feat/updated-date`)
1. `src/content/config.ts`: `updatedDate: z.date().optional()`.
2. `astro.config.mjs`: el mapa de `lastmod` usa `updatedDate` si existe; si no, `pubDate` (igual que antes).
3. `src/pages/insights/[slug].astro`: JSON-LD `dateModified` = `updatedDate ?? pubDate`; etiqueta "Updated <fecha>" bajo la fecha, solo si hay `updatedDate` (fecha formateada en UTC).
4. `src/content/insights/data-in-ran/index.md`: `updatedDate: 2026-10-23`.

## Quality Gate (2026-10-23, clon limpio en la nube)
`origin/main` 98fc33c + 4 commits locales como parches. `npm run build`: 150 paginas, 0 errores. `data-in-ran/`: `datePublished` 2026-04-02, `dateModified` 2026-10-23, etiqueta "Updated October 23, 2026", sitemap `lastmod` 2026-10-23. Los otros 146 posts: 0 con `dateModified` distinto de `datePublished`, 0 con etiqueta; `ee-tradeoff/` mismo `lastmod` (2026-06-15). Sitemap 150 URLs; 0 enlaces internos rotos; posicion de `data-in-ran/` en el listado sin cambio (92 de 147). Chromium headless 390 px y 1280 px: sin scroll horizontal, 0 errores de pagina.
Nota: en el sandbox la fecha de publicacion se ve como "April 1" por la zona horaria del build; Netlify compila en UTC y muestra "April 2" (verificado en el Deploy Preview #13). La etiqueta nueva usa `timeZone: 'UTC'` explicitamente.

## Deploy Preview #14 (2026-10-23, PR #14)
URL: https://deploy-preview-14--stellular-strudel-c35baa.netlify.app. Verificado desde el navegador integrado del equipo de Salvador con `fetch` (`redirect: "manual"`) desde una pestana con `sitemap-index.xml` (sin GA4).
1. `data-in-ran/`: 200; JSON-LD `datePublished` 2026-04-02, `dateModified` 2026-10-23; etiqueta "Updated October 23, 2026" (`<time datetime="2026-10-23">`) bajo la fecha "April 2, 2026" (build de Netlify en UTC); sitemap `lastmod` 2026-10-23.
2. Los otros 146 posts: 0 con `dateModified` distinto de `datePublished`, 0 con etiqueta "Updated"; `ee-tradeoff/` conserva `lastmod` 2026-06-15. Posicion de `data-in-ran/` en el listado sin cambio (92 de 147).
3. Sitemap: 150 URLs, 0 sin `/`, las 150 en 200 sin redireccion; 158 enlaces internos distintos, 0 rotos.
4. Formularios `contact` (-> `/success/`) y `cv-request` presentes; CV 200; eventos Tier 1 presentes en el HTML del homepage. No se disparo GA4.
5. Render del post en iframe sin GA4 a 390 px y 1280 px: etiqueta visible, sin scroll horizontal, 0 imagenes rotas; 0 errores de consola, 0 peticiones a dominios de Google.
Resultado: listo para merge.

## Result
Pendiente (produccion).

## Decision
Pendiente.

## Learning
Pendiente.

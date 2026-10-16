# EXP-015 -- Fuentes autoalojadas (Inter y JetBrains Mono) en lugar de la hoja de Google Fonts

## Experiment ID
EXP-015 (origen: BL-013)

## Observation
Tras EXP-008 (gtag.js async), el LCP movil del homepage se mantuvo en ~4.4s. El elemento LCP es el `<h1>` del Hero (Inter 700), y el audit `render-blocking-insight` de PageSpeed Insights sigue mostrando la hoja de estilos de Google Fonts como el mayor recurso render-blocking restante.

## Evidence
Checkpoint semanal del 2026-10-16 (Reporte-SEO-2026-10-16, produccion, homepage):
- Mobile: Google Fonts (`fonts.googleapis.com/css2?family=Inter...JetBrains+Mono...`) **780 ms** de ahorro estimado; CSS propio de Astro 190 ms.
- Desktop: Google Fonts 201 ms; CSS de Astro 112 ms.
Confirmado en codigo (`src/layouts/MainLayout.astro`, antes del cambio): dos `preconnect` (fonts.googleapis.com, fonts.gstatic.com) y un `<link rel="stylesheet">` a Google Fonts con Inter 400/700 y JetBrains Mono 400/700, `display=swap`. Esa hoja es de un origen externo: el navegador debe abrir una conexion nueva (DNS + TLS) solo para descubrir los archivos de fuente, y bloquea el render mientras tanto.

Nota de nomenclatura: el Reporte-SEO-2026-10-16 se refiere a este hallazgo como "BL-010"; en BACKLOG.md el ID correcto es **BL-013** (BL-010 es la ausencia de H2/H3 y enlaces internos). Confirmado con Salvador el 2026-10-16.

## Hypothesis
Servir las mismas fuentes (mismas familias y pesos, `font-display: swap`) desde el propio dominio, empaquetadas por Astro/Vite dentro del CSS del sitio, y precargar Inter 700 (fuente del `<h1>` LCP), eliminara la dependencia render-blocking de un origen externo y reducira el FCP y el LCP moviles del homepage, sin cambio visual.

## Target KPI
LCP y FCP moviles del homepage (PageSpeed Insights API, produccion). Baseline 2026-10-16: LCP 4.5 s, FCP 2.9 s, score 75.

## Guardrail KPI
- Sin cambio visual: mismas familias y pesos que antes (Inter 400/700, JetBrains Mono 400/700); CLS movil debe seguir en ~0 (baseline 0) y desktop ~0.002.
- Desktop sin regresion (baseline score 99, LCP 0.9 s).
- Eventos Tier 1 sin cambios (este experimento no toca GoogleAnalytics.astro ni los formularios).
- Ningun recurso de fonts.googleapis.com / fonts.gstatic.com en el HTML generado.

## Baseline (produccion, 2026-10-16)
| Metrica | Mobile | Desktop |
|---|---|---|
| Performance score | 75 | 99 |
| LCP | 4.5 s | 0.9 s |
| FCP | 2.9 s | 0.8 s |
| CLS | 0 | 0.002 |
| TBT | 130 ms | 40 ms |
| Speed Index | 4.6 s | 0.8 s |
Una sola corrida de Lighthouse por estrategia (variacion normal de laboratorio de varios puntos).

## Proposed change (implementado en rama, sin push)
1. `package.json` / `package-lock.json`: dependencias `@fontsource/inter@^5.3.0` y `@fontsource/jetbrains-mono@^5.3.0` (fuentes con licencia SIL OFL, mismos archivos de Google Fonts, `font-display: swap`).
2. `src/layouts/MainLayout.astro`: importar `@fontsource/inter/400.css`, `700.css`, `@fontsource/jetbrains-mono/400.css`, `700.css` en el frontmatter (Vite los empaqueta en el CSS del sitio y emite los `.woff2` con hash en `/_astro/`); se eliminan los dos `preconnect` y el `<link>` de Google Fonts; se agrega `<link rel="preload" as="font" type="font/woff2" crossorigin>` para `inter-latin-700-normal.woff2`.
Los subconjuntos por `unicode-range` (latin, latin-ext, etc.) se conservan: el navegador solo descarga los que usa, igual que con Google Fonts.
Sin cambios en tailwind.config.mjs (los nombres de familia 'Inter' y 'JetBrains Mono' no cambian).

## Pre-change commit hash
ed595f7 (merge de PR #11 a main)

## Risk
Bajo. 3 archivos (2 de dependencias). Rollback: revertir el commit de EXP-015. Riesgo residual: diferencias minimas de renderizado si la version de Fontsource difiere de la que sirve Google (mismas fuentes fuente; se valida visualmente en Deploy Preview).

## Implementation reference
Rama: feat/self-host-fonts (desde main ed595f7).

## Validacion realizada
Pendiente (ver seccion siguiente al completar el Quality Gate).

## Approval status
Aprobado por Salvador el 2026-10-16: tecnica "autoalojar fuentes" (frente a `media=print` + onload). Autorizo ademas, como **excepcion explicita a la regla de un deploy por ciclo quincenal**, un deploy de produccion esta misma semana (segundo del ciclo tras PR #11 del 2026-10-10; 15 creditos adicionales). Merge y push siguen siendo accion manual de Salvador.

## Measurement window
Inmediata para el resultado tecnico (PageSpeed en produccion tras el deploy, minimo 2-3 corridas por estrategia por la variacion de laboratorio). El checkpoint semanal del 2026-10-23 repite la medicion.

## Result
Pendiente.

## Decision
Pendiente.

## Learning
Pendiente.

# EXP-008 -- Carga no bloqueante (`async`) del script de Google Tag Manager

## Experiment ID
EXP-008

## Observation
Tras EXP-007 (optimizacion de la imagen del Hero), el LCP movil del homepage bajo de 8.7s a 4.4s, pero el First Contentful Paint (FCP) no se movio (3.6s). El elemento LCP cambio: ya no es la imagen del Hero, sino el `<h1>` del titular principal, con un "Element render delay" de 2,363 ms segun el desglose de PageSpeed Insights.

## Evidence
Medicion real de PageSpeed Insights contra produccion (homepage, mobile, 2026-09-23, post-EXP-007). El audit `render-blocking-insight` identifica tres recursos render-blocking con su ahorro estimado:
- `gtag.js` (Google Tag Manager): 176,981 bytes, **2,710 ms** de ahorro estimado.
- Hoja de estilo de Google Fonts: 1,597 bytes, 751 ms de ahorro estimado.
- CSS critico propio del sitio: 8,682 bytes, 183 ms de ahorro estimado.

Confirmado en codigo (`src/components/GoogleAnalytics.astro`, linea 1, antes del cambio): `<script is:inline src="https://www.googletagmanager.com/gtag/js?id=G-Q023R5XBS1"></script>` -- sin `async` ni `defer`. Por comportamiento estandar del navegador, esto bloquea el parseo del HTML (y por tanto el primer render) hasta que el script se descarga y ejecuta completamente. La guia oficial de Google para gtag.js recomienda explicitamente `<script async src="...">`.

## Hypothesis
Agregar el atributo `async` al script de GTM eliminara su condicion de render-blocking, permitiendo que el navegador pinte el contenido inicial (incluyendo el `<h1>` del LCP) sin esperar a que ese script externo termine de descargarse y ejecutarse, reduciendo el FCP y el LCP movil del homepage sin afectar la medicion de GA4.

## Target KPI
FCP y LCP moviles del homepage, medidos via PageSpeed Insights API. Baseline (post-EXP-007): FCP 3.6s, LCP 4.4s.

## Guardrail KPI
Los eventos Tier 1 (`tier1_cv_download_conversion`, `tier1_contact_conversion`) deben seguir disparando correctamente en GA4 (validado via GA4 Realtime con la bandera de opt-out para no contaminar la ventana de medicion real). Cero cambios visuales ni funcionales en el sitio.

## Baseline
`src/components/GoogleAnalytics.astro`: script de GTM sin `async`/`defer`. FCP movil homepage: 3.6s. LCP movil homepage: 4.4s.

## Proposed change (implementado)
`src/components/GoogleAnalytics.astro`, linea 1: se agrego el atributo `async` al script tag: `<script is:inline async src="https://www.googletagmanager.com/gtag/js?id=G-Q023R5XBS1"></script>`. Sin ningun otro cambio -- el snippet inline que define `dataLayer`/`gtag()` funciona por diseno de cola (queue) independientemente de cuando termine de cargar el script externo, por lo que no requiere ningun ajuste adicional.

## Pre-change commit hash
5e2ca45 (merge de PR #5 / EXP-007 a main)

## Risk
Bajo. Cambio de un solo atributo HTML estandar (`async`), en un solo archivo, sin tocar la logica de medicion de GA4 ni los eventos Tier 1. Es la practica oficial recomendada por Google para este mismo script.

## Implementation reference
Rama: feat/render-blocking-cleanup. Archivo modificado: src/components/GoogleAnalytics.astro (1 linea).

## Validacion realizada (2026-09-23)
1. Build local exitoso: 144 paginas construidas sin errores (`npm run build`, 134.57s incluyendo el reprocesamiento completo de imagenes de Insights).
2. Verificacion del HTML generado (`dist/index.html`): el script de GTM aparece correctamente como `<script async src="https://www.googletagmanager.com/gtag/js?id=G-Q023R5XBS1">`.
3. Pendiente: validar en Deploy Preview que los eventos Tier 1 de GA4 siguen disparando correctamente (usando la bandera `window['ga-disable-G-Q023R5XBS1'] = true` para no contaminar la medicion real), y repetir la consulta de PageSpeed Insights contra produccion tras el merge para cuantificar la mejora real en FCP/LCP.

## Approval status
BL-006 aprobado por Salvador para promoverse a experimento formal el 2026-09-23 ("si, autorizo ambas"), junto con BL-007. Implementado y validado localmente.

## Measurement window
Se definira tras el deploy: repetir la consulta de PageSpeed Insights (homepage, mobile) contra produccion, comparando FCP (baseline 3.6s) y LCP (baseline 4.4s).

## Result
Implementado y validado localmente (build exitoso, atributo confirmado en el HTML generado). Pendiente: validacion en Deploy Preview y medicion real de PageSpeed Insights en produccion tras el merge.

## Decision
Pendiente de validacion en Deploy Preview y, tras el merge, de la nueva medicion real de PageSpeed Insights en produccion.

## Learning
(a completar tras la medicion en produccion)

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

## Validacion realizada (2026-10-16, Quality Gate local)
Clon limpio de GitHub (main ed595f7) + los commits de la rama aplicados con `git am`; `npm ci` + `npm run build` en el entorno de nube (el build sobre la carpeta del equipo excede el limite de tiempo por llamada del puente).
1. Build: 150 paginas, 0 errores. Sitemap: 150 URLs, 0 sin `/`.
2. HTML generado: 0 referencias a fonts.googleapis.com / fonts.gstatic.com en todo `dist/`. `<link rel="preload">` de `inter-latin-700-normal.*.woff2` con el mismo hash que referencia el CSS (sin doble descarga).
3. Ajuste durante la validacion: la primera version importaba todos los subconjuntos de Fontsource (26 bloques `@font-face`, ~27 KB dentro del CSS render-blocking). Se limito a latin + latin-ext (8 bloques, 1.9 KB); CSS del sitio 58.9 KB sin comprimir / 9.2 KB gzip. Commit aparte en la rama.
4. Enlaces internos: 151 HTML, 3,578 referencias internas, 0 rotas. Formulario de contacto con `action="/success/"`; `/success/` presente.
5. Navegador headless (Chromium, viewport movil 412x900) sobre `/`, `/insights/`, `/insights/ee-tradeoff/`, `/success/`: `document.fonts.check` true para Inter 400/700 y JetBrains Mono; `h1` con `font-family: Inter`; todas las fuentes servidas desde `/_astro/`; 0 peticiones a Google Fonts. Unico error de consola: `googletagmanager.com/gtag/js` bloqueado por el proxy del entorno de pruebas (ERR_TUNNEL_CONNECTION_FAILED), no atribuible al sitio. Captura visual del Hero correcta (Inter en titular, JetBrains Mono en "SENIOR SON ARCHITECT").

### Deploy Preview #12 (2026-10-16, PR #12)
URL: https://deploy-preview-12--stellular-strudel-c35baa.netlify.app. Verificado desde el navegador integrado del equipo de Salvador con `fetch` (`redirect: "manual"`) desde una pestana con `sitemap-index.xml` (no carga GA4), para no contaminar KPIs.
1. `/`, `/insights/`, `/insights/ee-tradeoff/`, `/success/` y los 3 posts con LinkedIn sincronizado: 200; canonical con `/` hacia salvadoribarra.tech; 0 referencias a fonts.googleapis.com / fonts.gstatic.com; `<link rel="preload">` de `inter-latin-700-normal.Yt3aPRUw.woff2` en todas.
2. `/insights/ee-tradeoff` (sin `/`) responde redirect (opaqueredirect), igual que en produccion.
3. CSS `/_astro/index.BIVdLDgH.css`: 58,900 bytes, 8 `@font-face`, referencia el mismo woff2 que se precarga. Los 8 woff2 responden 200; el precargado con `content-type: font/woff2`, 24,356 bytes.
4. LinkedIn: 5g-tdd-synchronization-rf-interference -> lnkd.in/p/eGqhyS_F; altura-antena-cobertura-rf -> lnkd.in/p/eJqt6Dwa; ran-troubleshooting-pyramid -> lnkd.in/p/eN6yzRq5. ee-tradeoff sin cambios.
5. Formularios: contact -> `/success/`, cv-request presente; CV estable `/assets/cv/Salvador_Ibarra_Luna_CV.pdf` 200. Sitemap 150 URLs, 0 sin `/`.
6. GA4: script de GTM con `async` y los dos eventos Tier 1 presentes en el HTML (GoogleAnalytics.astro no se modifico). No se disparo GA4 en esta validacion.
7. Render visual movil (390x844) del homepage en un iframe sin los scripts de GA4: Inter 400/700 y JetBrains Mono cargadas (`document.fonts.check` true), `h1` con Inter, solo peticiones de fuentes a `/_astro/`; titular, subtitulo monoespaciado y colores identicos a produccion; sin errores de consola.
Resultado: listo para merge.

## Approval status
Aprobado por Salvador el 2026-10-16: tecnica "autoalojar fuentes" (frente a `media=print` + onload). Autorizo ademas, como **excepcion explicita a la regla de un deploy por ciclo quincenal**, un deploy de produccion esta misma semana (segundo del ciclo tras PR #11 del 2026-10-10; 15 creditos adicionales). Merge y push siguen siendo accion manual de Salvador.

## Measurement window
Inmediata para el resultado tecnico (PageSpeed en produccion tras el deploy, minimo 2-3 corridas por estrategia por la variacion de laboratorio). El checkpoint semanal del 2026-10-23 repite la medicion.

## Result
PR #12 (merge e61f72c) desplegado a produccion el 2026-10-16 (deploy verde). Segundo deploy del ciclo, excepcion autorizada por Salvador.

**Verificacion en produccion (2026-10-16, ~15:45 CDMX)**, con `fetch` desde una pestana de `sitemap-index.xml` (sin GA4): `/`, `/insights/`, `/insights/ee-tradeoff/`, `/success/` y los 3 posts con LinkedIn sincronizado responden 200, canonical con `/`, 0 referencias a Google Fonts, preload de `inter-latin-700-normal.Yt3aPRUw.woff2` (200, `font/woff2`); CSS `index.BIVdLDgH.css` con 8 `@font-face`, los 8 woff2 responden 200; forma sin `/` redirige; contact -> `/success/`, cv-request presente, CV estable 200; GTM `async` intacto; sitemap 150 URLs, 0 sin `/`; LinkedIn correcto en los 3 posts.

**PageSpeed Insights, homepage de produccion.** Mobile: 3 corridas independientes (21:47, 21:49 y 21:51 UTC; la API devuelve en cache corridas consecutivas con el mismo `fetchTime`, por lo que se espaciaron >60 s). Desktop: 2 corridas independientes. Se reporta la mediana.

| Metrica | Mobile antes (10-16) | Mobile despues (mediana) | Cambio | Desktop antes | Desktop despues (mediana) |
|---|---|---|---|---|---|
| Performance score | 75 | **82** (80, 82, 82) | +7 | 99 | 98 (98, 98) |
| LCP | 4.5 s | **4.30 s** (4.23-4.37) | -4% | 0.9 s | 0.94 s |
| FCP | 2.9 s | **1.80 s** (identico en las 3) | **-38%** | 0.8 s | **0.38 s** |
| CLS | 0 | 0 | = | 0.002 | 0 |
| TBT | 130 ms | 85 ms (51-130) | dentro del ruido | 40 ms | ~90 ms (ruido; GTM, no fuentes) |
| Speed Index | 4.6 s | 4.27 s | -7% | 0.8 s | 0.63-0.81 s |

**render-blocking-insight:** Google Fonts **ya no aparece** (antes 780 ms mobile / 201 ms desktop). Unico recurso restante: el CSS propio de Astro (171-183 ms mobile, 75-105 ms desktop). 0 peticiones a fonts.googleapis.com / fonts.gstatic.com; 8 woff2 servidos desde `/_astro/`.

**LCP breakdown (mobile):** el elemento LCP sigue siendo el `<h1>` del Hero; "Element render delay" 2,269-2,357 ms (vs. 2,377 ms medido en EXP-008). Es decir, el FCP mejoro claramente pero el H1 se sigue pintando ~2.4 s despues del primer contenido: la hoja de Google Fonts no era el cuello de botella principal del LCP movil. La causa restante no esta identificada con la evidencia actual (no se infiere).

**Hallazgos colaterales:**
1. El homepage descarga tambien los 4 woff2 latin-ext (~85 KB). Los provocan 12 acentos combinantes (U+0301/U+0303: texto en forma Unicode descompuesta NFD, p. ej. "e" + acento suelto) y 5 flechas (U+2192, U+2194) en el contenido visible. En la simulacion de red lenta de Lighthouse compiten por ancho de banda.
2. Los woff2 con hash de `/_astro/` se sirven con `cache-control: public,max-age=0,must-revalidate` (default de Netlify): las visitas repetidas revalidan en vez de usar cache inmutable. Cambiarlo es configuracion de despliegue (`netlify.toml` / `_headers`), fuera del alcance del agente por la seccion Security; decision de Salvador.

## Decision
**KEEP.** El cambio cumplio su objetivo tecnico directo (eliminar el render-blocking de Google Fonts: confirmado, 780 ms -> 0) con mejora real y estable del FCP movil (-38%, 2.9 s -> 1.8 s) y del score (75 -> 82), sin regresion visual, de CLS, de desktop ni de conversion. La hipotesis sobre el LCP movil solo se cumplio marginalmente (4.5 s -> 4.3 s, aun en "needs improvement"); se registra como aprendizaje, no como fallo del cambio.

## Learning
1. Para el LCP movil del homepage, el render-blocking de Google Fonts era un factor del FCP, no el principal del LCP: tras EXP-008 y EXP-015 el "Element render delay" del H1 sigue en ~2.3 s. Siguiente paso: diagnostico dirigido (traza de Lighthouse / Performance panel del H1) antes de proponer otro cambio, en lugar de seguir atacando recursos por eliminacion.
2. PageSpeed Insights API cachea resultados de la misma URL por ~1 min: varias corridas "seguidas" pueden ser la misma medicion. Espaciar >60 s y verificar `fetchTime` distinto.
3. Candidatos de seguimiento (no aprobados): normalizar a NFC el texto con acentos descompuestos del homepage (evita descargar latin-ext; cambio de contenido) y cabeceras de cache inmutable para `/_astro/*` (configuracion de despliegue, decision de Salvador).

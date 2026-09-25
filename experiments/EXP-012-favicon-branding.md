# EXP-012 -- Reemplazo del favicon generico por el monograma "SI" (mejora de branding/UX)

> **Clasificacion:** mejora de branding/UX de bajo riesgo. **No es un experimento de SEO** y no tiene KPI de medicion ni ventana de medicion asociada; se registra en el ledger unicamente por trazabilidad (ningun cambio queda sin documentar) y para dejar un punto de rollback explicito.

## Experiment ID
EXP-012

## Observation
El sitio seguia usando el favicon por defecto de la plantilla de Astro (`public/favicon.svg` con el logotipo de Astro y `public/favicon.ico` de 32x32 original de la plantilla). Es un icono generico que no identifica la marca personal en pestanas, marcadores ni accesos directos en movil. Ademas, el layout solo declaraba el SVG: no existia `apple-touch-icon` (iOS generaba una captura de pagina) ni web app manifest (Android no tenia icono propio).

## Evidence
- `src/layouts/MainLayout.astro` (unico layout con `<head>`): una sola declaracion, `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`.
- `public/favicon.svg`: path del logotipo de Astro. `public/favicon.ico`: 655 bytes, sin cambios desde el commit inicial (enero 2026).
- Imagen fuente proporcionada por Salvador: `mi-favicon.png` (2048x2048, monograma "SI" turquesa `#2DC0B9` sobre azul marino `#0A274E`), alineada con la identidad visual del proyecto.

## Hypothesis
N/A -- cambio de branding, sin hipotesis causal sobre KPIs. Beneficio esperado (cualitativo): reconocimiento de marca y apariencia profesional en pestana, marcadores, resultados moviles y pantalla de inicio.

## Target KPI
Ninguno (no aplica). Explicitamente fuera del marco de medicion de KPIs Tier 1/2.

## Guardrail KPI
Cero regresion funcional: build sin errores, cero referencias rotas a iconos, todos los recursos de icono responden 200 con el content-type correcto.

## Baseline
Favicon generico de Astro; sin apple-touch-icon; sin manifest.

## Proposed change (implementado)
1. Vectorizacion del monograma a partir de `mi-favicon.png` (trazado con potrace de la mascara del glifo, colores muestreados de la imagen fuente) para obtener un `favicon.svg` nitido a cualquier densidad (~1 KB de geometria), en lugar de incrustar un bitmap.
2. Todos los tamanos raster se renderizaron desde ese vector (bordes limpios, colores planos):
   - `public/favicon.svg` (reemplaza el de Astro; misma ruta, sin referencias rotas) -- glifo ~78% del alto, esquinas redondeadas.
   - `public/favicon.ico` (reemplaza el anterior) -- multi-resolucion 16/32/48.
   - `public/favicon-16x16.png`, `public/favicon-32x32.png`.
   - `public/apple-touch-icon.png` (180x180, cuadrado completo; iOS aplica su propia mascara).
   - `public/android-chrome-192x192.png`, `public/android-chrome-512x512.png` (cuadrado completo con el glifo dentro de la zona segura "maskable" del 80%).
   - `public/site.webmanifest` minimo (`display: "browser"`, para no introducir comportamiento de instalacion tipo PWA).
3. `src/layouts/MainLayout.astro`: la declaracion unica se sustituyo por el set completo (ico, png 32/16, svg al final para que los navegadores modernos lo prefieran, apple-touch-icon y manifest). No se agrego `<meta name="theme-color">` para no alterar el color de la barra del navegador movil (variable ajena a este cambio).
4. Nota: los PNG/SVG escritos en el repo incluyen metadatos de procedencia (Content Credentials / C2PA) agregados al transferirlos al equipo (+6-8 KB por archivo). Impacto en peso despreciable; se conservan.

## Pre-change commit hash
1681a9a (HEAD de `main` local al crear la rama; ultimo commit en `origin/main`: 6c07776)

## Risk
Bajo. Solo archivos estaticos en `public/` y 6 lineas de `<link>` en el `<head>`. No toca contenido, afirmaciones profesionales, analitica ni flujos de conversion. Riesgo residual: cache agresiva de favicons en navegadores (el icono viejo puede persistir hasta limpiar cache), sin impacto funcional.

## Implementation reference
Rama: `feat/favicon-si-monogram`. Commit de codigo: 3dd168b. Archivos: 8 en `public/` (2 reemplazados, 6 nuevos) + `src/layouts/MainLayout.astro` (+6 lineas).

## Validacion realizada (2026-09-25) -- Quality Gate local-first
1. Build en **clon limpio** de la rama (`git clone` + `npm ci` + `npm run build`): 144 paginas, exit 0, sin errores.
2. `dist/`: los 8 archivos de icono presentes; el HTML generado contiene las 6 etiquetas nuevas. 144/145 HTML incluyen el set de iconos; la excepcion es `forms.html` (pagina estatica oculta de deteccion de Netlify Forms, no visible para usuarios) -- esperado.
3. Servidor local sobre `dist/`: los 9 recursos (`/`, ico, svg, 2 png, apple-touch, 2 android, manifest) responden 200 con content-type correcto (`image/vnd.microsoft.icon`, `image/svg+xml`, `image/png`, `application/manifest+json`).
4. Verificacion visual en Chromium headless: pestana clara/oscura a 16px, PNG 16, ICO, SVG a 64px y apple-touch-icon con mascara iOS -- el monograma es legible y nitido en todos.

## Approval status
Implementacion solicitada explicitamente por Salvador (2026-09-25). **Pendiente:** revision visual de Salvador en Deploy Preview de Netlify (pestana, marcadores, icono en movil) antes de aprobar el merge. No se ha hecho push ni merge.

## Measurement window
N/A (sin KPI). Solo la revision visual en Deploy Preview.

## Result
Pendiente de revision en Deploy Preview.

## Decision
Pendiente.

## Learning
(Por completar tras la revision.) Nota operativa: el trazado vectorial desde un PNG de alta resolucion con fondo plano produce un SVG mas nitido y ligero que incrustar el bitmap, y permite derivar todos los tamanos raster desde una sola fuente.

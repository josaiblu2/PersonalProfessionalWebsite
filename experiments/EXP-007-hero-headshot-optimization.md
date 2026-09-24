# EXP-007 -- Optimizacion de la imagen del Hero (headshot) del homepage

## Experiment ID
EXP-007

## Observation
BL-005 identifico que el homepage obtiene un Performance score de 67/100 en movil (vs. 92/100 en escritorio), con un Largest Contentful Paint (LCP) de 8.7 segundos en movil -- calificacion "poor" segun los umbrales de Google (>4s).

## Evidence
Primera linea base real capturada con la PageSpeed Insights API (2026-09-23, ver claude/pagespeed-insights-readonly-access.md en el Proyecto). El detalle `network-requests` de la auditoria identifico `Salvador_Headshot_Primary.png` como el recurso mas pesado del homepage: 1,030 KB de transferencia. Confirmado en codigo (`src/components/Hero.astro`, linea 33 antes del cambio): la imagen se renderizaba con una etiqueta `<img src="/assets/Salvador_Headshot_Primary.png">` plana, servida directamente desde `public/assets/` (1,054,779 bytes en disco, PNG sin comprimir), sin pasar por el pipeline de `astro:assets` -- el mismo patron de defecto que EXP-004a/EXP-004b ya corrigio para las 141 imagenes de posts de Insights, nunca aplicado a esta imagen del Hero por no pertenecer a esa coleccion de contenido.

## Hypothesis
Migrar la imagen del Hero al pipeline de `astro:assets` (componente `<Image />`, con un ancho de renderizado acorde al tamano real mostrado en pantalla y formato WebP) reducira drasticamente su peso de transferencia y, por tanto, el LCP movil del homepage, sin afectar la nitidez visual del retrato circular.

## Target KPI
LCP movil del homepage, medido via PageSpeed Insights API (`largest-contentful-paint` en `lighthouseResult.audits`). Baseline: 8.7s. Objetivo cualitativo: salir de la categoria "poor" (<4s), idealmente acercarse a "good" (<2.5s).

## Guardrail KPI
Cero cambios visuales perceptibles en el retrato circular del Hero (mismo recorte, mismas proporciones, sin perdida de nitidez visible en pantallas de alta densidad). El build debe seguir completando exitosamente y las 141 paginas de Insights deben permanecer sin cambios (verificado por checksum).

## Baseline
`Salvador_Headshot_Primary.png`: 1,054,779 bytes en disco, 1,030 KB transferidos en el request real medido por PageSpeed Insights. LCP movil del homepage: 8.7s. Performance score movil: 67/100.

## Proposed change (implementado)
1. Movida la imagen de `public/assets/Salvador_Headshot_Primary.png` a `src/assets/Salvador_Headshot_Primary.png` (via `git mv`, preservando historial), para que Astro pueda procesarla por su pipeline de imagenes.
2. `src/components/Hero.astro`: agregado `import { Image } from 'astro:assets'; import headshotImage from '../assets/Salvador_Headshot_Primary.png';` en el frontmatter. Reemplazada la etiqueta `<img>` plana por `<Image src={headshotImage} width={800} height={800} format="webp" quality={80} loading="eager" fetchpriority="high" alt="Salvador Ibarra" class="..." />`, conservando exactamente las mismas clases de Tailwind (recorte circular, tamanos responsive) que ya tenia.
3. `width={800}`: calculado como aproximadamente 2x el tamano de renderizado CSS mas grande (`lg:w-96 lg:h-96` = 384px), suficiente para pantallas de alta densidad (retina) sin sobre-dimensionar.
4. `loading="eager"` y `fetchpriority="high"` agregados explicitamente (en vez de dejar los valores por defecto de `<Image />`, que son `loading="lazy"` y `fetchpriority="auto"`): al ser el elemento LCP de la pagina de entrada principal, el navegador debe priorizar su descarga desde el primer instante, no diferirla como si fuera contenido bajo el pliegue.

## Pre-change commit hash
2e489d2

## Risk
Bajo. Cambio de una sola imagen en un solo componente, mismo patron de `astro:assets` ya implementado y validado dos veces en produccion (EXP-004a/EXP-004b). Ningun otro archivo del repositorio referenciaba `Salvador_Headshot_Primary.png` (confirmado por busqueda exhaustiva antes del cambio).

## Implementation reference
Rama: feat/image-optimization-pipeline. Archivos: src/components/Hero.astro (modificado), public/assets/Salvador_Headshot_Primary.png -> src/assets/Salvador_Headshot_Primary.png (movido).

## Validacion realizada (2026-09-23)
1. Build local con la imagen real del Hero (tecnica de placeholders para las 141 imagenes de Insights, para acelerar el build -- mismo metodo de EXP-004b/EXP-005): la imagen del Hero se proceso correctamente, resultado real: **1,030 KB -> 22.8 KB (-97.8%)**, en formato WebP, 800x800px.
2. Verificacion del HTML generado (`dist/index.html`): la etiqueta `<img>` final apunta a `/_astro/Salvador_Headshot_Primary.D3QIUWAj_Z1xJri9.webp`, con `loading="eager"`, `fetchpriority="high"`, `width="800"`, `height="800"`, y exactamente las mismas clases de Tailwind que antes (recorte circular, tamanos responsive por breakpoint).
3. Segundo build (tras agregar `loading`/`fetchpriority`): el cache de Astro reutilizo la imagen ya procesada ("reused cache entry"), confirmando que el cambio de esos dos atributos no afecta el procesamiento de la imagen en si, solo el HTML.
4. Imagenes reales de los 141 posts de Insights restauradas tras la validacion y verificadas por checksum MD5 contra los originales: 141/141 identicas -- cero regresion en el contenido migrado en EXP-004a/EXP-004b.
5. **Limite conocido de esta validacion:** no se corrio una nueva consulta a la PageSpeed Insights API contra un entorno real (Deploy Preview) en este paso -- eso queda como parte de la validacion en el Deploy Preview antes del merge, igual que en experimentos anteriores.

## Approval status
BL-005 aprobado por Salvador para promoverse a experimento formal el 2026-09-23 ("Super, adelante. Procedamos con la implementacion de BL-005"). Construccion y validacion local completadas.

## Measurement window
PageSpeed Insights API contra produccion (https://salvadoribarra.tech/), homepage, mismas estrategias mobile y desktop del baseline. Medido 2026-09-23, tras merge a main (commit de fix 1ba294b) y deploy de produccion exitoso (confirmado por Salvador: build completo en verde a las 5:34 PM).

## Result
**Mobile (comparacion directa contra baseline):**
- LCP: 8.7s -> 4.4s (-4.3s, -49%). Sale de la categoria "poor" (>4s), aunque aun no alcanza "good" (<2.5s) -- queda en el borde superior de "needs improvement".
- Performance score: 67 -> 75.
- CLS: 0 (sin cambio, ya era optimo).
- FCP: 3.6s (sin cambio material -- el First Contentful Paint no depende del peso de la imagen del Hero, sino de fuentes/CSS/JS bloqueantes iniciales; queda fuera del alcance de este experimento).
- TBT: 80ms -> 10ms.
- Peso de la imagen del Hero en produccion: 1,030 KB -> 22.7 KB (-97.8%), confirmado con `network-requests`: `statusCode 200`, `content-type: image/webp`.

**Desktop:**
- LCP: 1.7s -> 1.1s.
- Performance score: 92 -> 97.
- CLS: 0.002 (sin cambio material).

**Verificacion visual:** navegacion directa a https://salvadoribarra.tech/ confirma render correcto del homepage completo (titulo, Hero con headshot circular, sin artefactos ni errores).

**Nota de proceso:** durante la validacion en Deploy Preview #5 se observo un error transitorio (HTTP 500 / pagina de error de Netlify) al consultar tanto el Deploy Preview directamente como via PageSpeed Insights, mientras el log de build de Netlify aparecia completamente limpio (confirmado por Salvador, sin ningun mensaje de error, todas las fases en verde). Se diagnostico como un artefacto transitorio de propagacion de cache/CDN en el edge de Netlify para un hash de asset nuevo en un Deploy Preview (menos distribuido que produccion), no como un defecto de codigo o build -- confirmado retroactivamente por el resultado limpio en produccion.

## Decision
**KEEP.** Mejora real y sustancial confirmada en produccion con datos de PageSpeed Insights: LCP movil del homepage reducido en 49% (8.7s -> 4.4s), performance score movil +8 puntos, sin ninguna regresion visual ni en desktop ni en movil. El guardrail KPI (cero cambios visuales, 141 imagenes de Insights intactas) se cumplio integramente. LCP movil aun no alcanza el umbral "good" (<2.5s) de Google -- FCP (3.6s) sugiere que el siguiente cuello de botella ya no es el peso de la imagen, sino recursos que bloquean el render inicial (fuentes web, CSS/JS de terceros como Google Tag Manager, que ahora es el recurso mas pesado del homepage con 172.8 KB). Se documenta como oportunidad futura en Learning, no como parte de este experimento.

## Learning
El mismo patron de `astro:assets` que se goberno como "el pipeline de imagenes de Insights" en EXP-004a/EXP-004b aplica igual de bien a cualquier imagen del sitio, sin importar si pertenece a una coleccion de contenido o es una imagen de UI fija como el Hero -- vale la pena, en una futura auditoria, revisar si quedan otras imagenes del sitio (ademas de esta) sirviendose todavia desde `public/` sin pasar por el pipeline.

Un error transitorio de origen externo (CDN/crawler) en un Deploy Preview puede parecer, a primera vista, un defecto de codigo -- la senal decisiva para diferenciarlos fue el log de build de Netlify (limpio) contra el sintoma observado (error solo en ciertas rutas de red externas). Vale la pena, ante una senal de error en Deploy Preview, revisar primero el log de build antes de bloquear un merge.

Con el peso de la imagen del Hero resuelto, el siguiente cuello de botella visible para el LCP movil del homepage es el bloqueo de render inicial: Google Tag Manager (172.8 KB, el recurso mas pesado del homepage ahora) y las fuentes web (Inter, JetBrains Mono, ~90 KB combinados) se cargan antes del primer contenido visible. Candidato natural para un futuro BL/experimento: diferir la carga de GTM (`gtag.js`) hasta despues del primer render, o explorar `font-display: swap` / preload selectivo de fuentes si no esta ya en uso.

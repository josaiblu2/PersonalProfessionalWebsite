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
Se definira tras el deploy: repetir la misma consulta a PageSpeed Insights (homepage, mobile) usada para capturar el baseline, y comparar el LCP resultante contra los 8.7s de referencia.

## Result
Implementado y validado localmente (ver Validacion realizada arriba). Pendiente: commit visible en Deploy Preview, validacion de PageSpeed Insights contra el Deploy Preview, y decision de merge a produccion.

## Decision
Pendiente de validacion en Deploy Preview y, tras el merge, de la nueva medicion real de PageSpeed Insights en produccion.

## Learning
El mismo patron de `astro:assets` que se goberno como "el pipeline de imagenes de Insights" en EXP-004a/EXP-004b aplica igual de bien a cualquier imagen del sitio, sin importar si pertenece a una coleccion de contenido o es una imagen de UI fija como el Hero -- vale la pena, en una futura auditoria, revisar si quedan otras imagenes del sitio (ademas de esta) sirviendose todavia desde `public/` sin pasar por el pipeline.

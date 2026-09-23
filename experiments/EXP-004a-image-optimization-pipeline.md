# EXP-004a — Pipeline de optimizacion automatica de imagenes (construccion y validacion)

## Experiment ID
EXP-004a

## Observation
La carpeta public/assets/posts/ contiene 148 imagenes sin optimizar (405MB en total), servidas como archivos estaticos planos via tags <img> sin ningun procesamiento. Esto es la causa raiz confirmada del consumo elevado de creditos de banda ancha en Netlify (491 de 300 creditos gratuitos consumidos en el periodo 21-ago a 20-sep).

## Evidence
Auditoria del repositorio (du -sh sobre public/assets/posts/, conteo de archivos, inspeccion de src/content/config.ts, src/pages/insights/[slug].astro y src/components/InsightsFeed.astro). Confirmado que Sharp (^0.34.0) ya esta instalado como dependencia y que Astro soporta optimizacion automatica de imagenes via astro:assets, pero unicamente para imagenes dentro de src/, nunca para public/.

## Hypothesis
Si se integra un mecanismo de optimizacion automatica de imagenes al proceso de build de Astro (sin pasos manuales adicionales para Salvador en su flujo de publicacion), se puede reducir drasticamente el peso de las imagenes nuevas servidas, bajando el consumo de banda ancha de Netlify, sin afectar las 141 URLs de posts ya indexadas por Google.

## Target KPI
Reduccion de tamano de imagen por post nuevo publicado usando el nuevo campo (objetivo referencial: >80% de reduccion vs. el archivo crudo).

## Guardrail KPI
Cero cambios en las URLs de los 141 posts existentes (/insights/<slug>). Cero errores de build sobre el contenido existente.

## Baseline
148 imagenes sin optimizar, 405MB total, en public/assets/posts/. 0 posts usando el nuevo mecanismo.

## Proposed change (segun aprobacion original de Salvador, 2026-09-22)
Integrar la optimizacion de imagenes al proceso de build de Astro, de forma automatica, sin agregar pasos manuales al flujo de publicacion (generar texto+imagen con IA, guardar markdown+imagen cruda, git commit/push).

## Desviaciones tecnicas respecto a la redaccion literal de la propuesta (comunicadas y justificadas a Salvador el 2026-09-23)
1. No se migro la coleccion 'insights' a la Content Layer API de Astro (glob() loader). Esa migracion renombra post.slug -> post.id, arriesgando romper las URLs ya indexadas de los 141 posts existentes. En su lugar, se mantuvo el tipo de coleccion legacy 'content', usando la forma de funcion del schema (schema: ({ image }) => z.object({...})) para acceder al helper image() sin la migracion.
2. No se reemplazo el campo 'image' (string) existente. Se agrego un campo nuevo y separado, 'coverImage: image().optional()', dejando 'image' completamente intacto. Reemplazar 'image' directamente habria roto la validacion Zod/build de los 141 posts existentes, cuyo frontmatter usa nombres de archivo planos apuntando a public/assets/posts/ (incompatibles con los requisitos de resolucion de rutas de image()).
Ambas desviaciones preservan la intencion completa de la propuesta aprobada (pipeline automatico, sin friccion, cero impacto en contenido existente).

## Pre-change commit hash
8466d73

## Risk
Bajo. Cambio aditivo (nuevo campo opcional + logica condicional en templates), sin tocar el campo ni el contenido existente. Validado localmente con build limpio antes/despues, comparando explicitamente las URLs generadas.

## Implementation reference
Rama: feat/image-optimization-pipeline.
Archivos modificados: src/content/config.ts (nuevo campo coverImage), src/pages/insights/[slug].astro (render condicional con <Image />, og:image optimizado via getImage() con formato jpeg y ancho 1200px), src/components/InsightsFeed.astro (render condicional con <Image /> en las tarjetas del feed).

## Validacion local realizada (2026-09-23)
1. Build "antes" (codigo de main, commit 8466d73): 144 paginas, 141 URLs /insights/*, 409MB en dist/.
2. Post de prueba desechable creado con una copia de una imagen real pesada (los-3-errores.png, 11.4MB) usando el nuevo campo coverImage, en un archivo temporal dentro de src/content/insights/ (eliminado antes de este commit).
3. Build "despues" con el pipeline nuevo activo: la imagen del cuerpo se convirtio automaticamente a WebP (11.4MB -> 540KB, -95.4%). 
4. Hallazgo y correccion durante la validacion: el og:image (meta tag para preview de LinkedIn/Facebook) NO se optimizaba automaticamente al leer .src directamente sobre el objeto de imagen (solo re-emite el archivo original sin procesar). Corregido usando getImage() explicitamente con ancho maximo 1200px y formato jpeg (maxima compatibilidad con crawlers de LinkedIn/Facebook): resultado 11.4MB -> 151KB (-98.7%).
5. Comparacion de URLs /insights/* generadas antes vs. despues (excluyendo el post de prueba): identicas, sin ninguna diferencia.
6. Build final limpio (sin el post de prueba, solo con los 141 posts reales): 144 paginas, 409MB en dist/ -- identico al baseline, cero regresion, cero cambio, porque ningun post real usa aun el campo nuevo.

## Approval status
Propuesta (EXP-004a + EXP-004b por separado) aprobada por Salvador el 2026-09-22 ("si, aprovado"). Construccion y validacion local aprobada el mismo dia. Commit de estos cambios en la rama local aprobado por Salvador el 2026-09-23 ("si, apruebo"). Aun sin push ni PR (se agrupara con el siguiente lote de cambios significativos, por disciplina de creditos de despliegue).

## Measurement window
No aplica todavia (no hay contenido en produccion usando el nuevo campo). Se activara con EXP-004b (migracion de contenido).

## Result
Pipeline construido y validado localmente. Pendiente: push, PR, Deploy Preview, y decision de merge a produccion (todo sujeto a aprobacion explicita de Salvador, sin excepcion).

## Decision
Pendiente de la revision del PR/Deploy Preview.

## Learning
El acceso a .src de un objeto de imagen de astro:assets sin pasar por <Image /> o getImage() NO dispara la optimizacion -- solo re-emite el archivo original. Cualquier uso futuro de imagenes de contenido colectivo para metadatos (og:image, twitter:image, JSON-LD, etc.) debe usar getImage() explicitamente, nunca .src directo, o el beneficio de la optimizacion se pierde silenciosamente sin ningun error de build.

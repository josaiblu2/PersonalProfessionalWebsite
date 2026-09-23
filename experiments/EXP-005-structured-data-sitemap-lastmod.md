# EXP-005 -- Datos estructurados JSON-LD (BlogPosting) y lastmod en sitemap para Insights

## Experiment ID
EXP-005

## Observation
BL-004 identifico que `pubDate` no tenia ninguna funcion de SEO: no existian datos estructurados (JSON-LD) en las paginas de posts, y el sitemap no exponia `lastmod` por URL.

## Evidence
Revision de `src/layouts/MainLayout.astro`, `src/pages/insights/[slug].astro` y `astro.config.mjs` (ver BL-004 para el detalle completo de la evidencia original).

## Hypothesis
Agregar datos estructurados tipo `BlogPosting` (headline, description, image, datePublished, author) a cada post, y anotar `lastmod` en el sitemap a partir de `pubDate`, le da a Google señales explicitas de tipo articulo y de frescura de contenido, lo cual puede habilitar resultados enriquecidos y mejorar la priorizacion de rastreo, sin cambiar contenido editorial ni URLs.

## Target KPI
Cobertura de "rich results" tipo articulo en Google Search Console (metrica a revisar periodicamente una vez en produccion; Search Console tarda dias/semanas en reflejar cambios de este tipo).

## Guardrail KPI
Cero cambios en las 141 URLs de Insights. Cero errores de build. El sitemap debe seguir siendo XML valido.

## Baseline
0 posts con JSON-LD. 0 URLs con `lastmod` en el sitemap.

## Proposed change
1) Nuevo prop opcional `structuredData` en `MainLayout.astro`: si se recibe, se serializa como `<script type="application/ld+json">` en el `<head>`. Default `undefined`, sin efecto en ninguna otra pagina del sitio.
2) En `src/pages/insights/[slug].astro`: se construye el objeto `structuredData` (tipo `BlogPosting`) reutilizando datos ya calculados en el archivo (URL canonica `shareUrl`, imagen ya resuelta para `og:image`) mas `post.data.pubDate.toISOString()` como `datePublished`, y se pasa a `MainLayout`.
3) En `astro.config.mjs`: se agrega una funcion `serialize` a la integracion `sitemap()` que lee el frontmatter de cada post directamente del disco (via `fs`/`path`, no via `astro:content`, que no esta disponible en el archivo de configuracion) para construir un mapa slug -> fecha ISO, y anota `lastmod` en cada URL de Insights que coincida.

## Pre-change commit hash
8adba7d

## Risk
Bajo. Cambios aditivos en metadatos de `<head>` y en la configuracion del sitemap; no tocan contenido editorial, esquema de contenido, rutas ni logica de negocio.

## Implementation reference
Rama: feat/image-optimization-pipeline. Archivos: astro.config.mjs, src/layouts/MainLayout.astro, src/pages/insights/[slug].astro.

## Validacion realizada (2026-09-23)
1. Build completo (metodologia de placeholders, igual que EXP-004b, para evitar el tiempo de procesamiento real de las 141 imagenes): 144 paginas generadas, 142 directorios bajo dist/insights (141 posts + indice), sin regresion de rutas.
2. Verificacion del JSON-LD generado en una muestra real (`1erkpiquejas`): JSON valido, con `headline`, `description`, `image`, `datePublished` y `author` correctos, coincidiendo con el frontmatter real del post.
3. Verificacion del sitemap (`dist/sitemap-0.xml`): 141 entradas de Insights con `<lastmod>` (una por post, con la fecha ISO correcta derivada de `pubDate`), y exactamente 3 entradas sin `lastmod` (home, indice de insights, success) -- comportamiento esperado, ya que esas paginas no tienen `pubDate`.
4. Imagenes reales restauradas tras la validacion y verificadas por checksum MD5 contra los originales: 141/141 identicas.

## Observacion adicional (no es un defecto de esta implementacion)
Se detecto que algunos posts tienen `pubDate` en el futuro respecto a la fecha actual (ej. varios posts con fechas de octubre 2026). Esto es un dato preexistente en el frontmatter, no introducido por este cambio -- `lastmod` simplemente refleja fielmente el `pubDate` que ya existia. Se deja como observacion para que Salvador confirme si es una practica intencional (p.ej. calendario editorial) o si algunos `pubDate` deberian corregirse; no se modifico ningun `pubDate` en este experimento.

## Approval status
BL-004 aprobado por Salvador para promoverse a experimento formal el 2026-09-23 ("sigamos con BL-004"). Construccion y validacion local completadas; pendiente de aprobacion para commit.

## Measurement window
No aplica todavia (no desplegado a produccion). Una vez en produccion, revisar Search Console periodicamente (cobertura de rich results / articulos) como parte del ciclo de revision bisemanal.

## Result
Implementado y validado localmente, pendiente de commit, push, Deploy Preview y merge.

## Decision
Pendiente.

## Learning
El mismo patron de validacion con placeholders usado en EXP-004b (reemplazar imagenes reales por miniaturas para acelerar el build, validar estructura/metadatos, restaurar y verificar por checksum) es reutilizable para cualquier cambio futuro que no dependa del contenido real de las imagenes, evitando el costo de tiempo del procesamiento real de Sharp sobre las 141 imagenes en este entorno.

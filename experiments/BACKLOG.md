# Backlog de Optimizacion -- AI Closed-Loop Website Optimization

Este archivo registra hallazgos y mejoras identificadas que aun no se convierten en un experimento formal (EXP-XXX). Cada item sigue el formato requerido por Work Project Instructions v1.6 (OBSERVATION, EVIDENCE, IMPACT, RECOMMENDATION, PRIORITY, RISK, REUSABILITY), mas Status y fecha de registro. Antes de iniciar cualquier sesion de trabajo, revisar este archivo junto con el ledger de /experiments/ para determinar el estado actual del sistema.

---

## BL-001 -- Proteccion anti-spam en formularios de Netlify Forms [CERRADO -- hallazgo original incorrecto]

**Status:** Cerrado -- el hallazgo original era incorrecto, ver Correccion abajo.
**Registrado:** 2026-09-22
**Corregido:** 2026-09-23

**Correccion (2026-09-23):** Al iniciar la implementacion de este item, se reviso el codigo fuente real de ambos formularios y se confirmo que **ambos ya cuentan con proteccion honeypot nativa de Netlify**, usando el atributo correcto `netlify-honeypot="bot-field"` (sin el prefijo `data-` que se busco erroneamente durante la auditoria original) mas su campo oculto `bot-field` correspondiente. El honeypot de `contact` existe desde el commit `bb37d7c` (6 de febrero de 2026); el honeypot de `cv-request` existe desde su commit de implementacion original, `cf66f49` (EXP-003). El hallazgo original de este item ("Ninguno de los dos formularios... tiene proteccion anti-spam activa") fue un error de auditoria: se busco el atributo `data-netlify-honeypot`, que no es el nombre de atributo que usa el codigo (ni el que documenta Netlify), en lugar de `netlify-honeypot`. No se requiere ninguna implementacion adicional para este item. Se deja este registro (en lugar de borrarlo) para dejar constancia del error y evitar que se repita en auditorias futuras.

**Observation original (incorrecta, mantenida por transparencia):** Ninguno de los dos formularios en produccion (`contact` y `cv-request`, ambos via Netlify Forms) tiene proteccion anti-spam activa. Ambos son formularios publicos accesibles por cualquier visitante o bot.

**Evidence original (incorrecta, mantenida por transparencia):** Revision del codigo de ambos formularios (`Contact.astro`, `Hero.astro` / modal de CV) confirma que no se implemento el atributo honeypot nativo de Netlify (`data-netlify-honeypot`) ni ningun otro mecanismo (reCAPTCHA, rate limiting, validacion adicional). Salvador pregunto explicitamente donde se almacenan los correos capturados por `cv-request` (respuesta: en el panel de Netlify Forms, sin base de datos propia), lo cual expuso esta brecha durante la revision.

**Impact:** Riesgo de que envios de spam/bots contaminen la lista de correos capturados en `cv-request` (pensada para generar leads reales de oportunidades profesionales) y el buzon de notificaciones del formulario `contact`. Impacto indirecto en la calidad de datos usada para medir el KPI Tier 1 (descargas de CV / contactos), pudiendo inflar artificialmente los conteos de EXP-002 y EXP-003 si no se corrige antes de que el volumen de spam sea significativo.

**Recommendation:** Agregar el campo honeypot nativo de Netlify Forms (`data-netlify-honeypot="bot-field"` en el `<form>` + campo oculto correspondiente) a ambos formularios. Es la mitigacion mas simple, sin costo, sin dependencias externas, y sin fricción para el usuario real. Evaluar tambien si conviene revisar periodicamente el panel de Forms de Netlify en busca de patrones de spam antes de invertir en algo mas robusto (reCAPTCHA) si el honeypot no fuera suficiente.

**Priority:** Media (importante, no urgente -- confirmado por Salvador).

**Risk:** Bajo. Cambio aislado, no toca la logica de negocio ni los eventos de GA4 ya instrumentados; debe seguir el flujo completo de gobernanza (Proposal -> Aprobacion -> Build local -> Rama -> PR -> Merge) antes de tocar produccion.

**Reusability:** Alta -- el mismo patron (honeypot) aplica igual a cualquier formulario futuro de Netlify Forms en este u otros proyectos con la misma arquitectura (framework reusable segun el Contexto Estrategico del proyecto).

---

## BL-002 -- Tags HTML sin cerrar al final de Contact.astro

**Status:** Abierto -- pendiente de priorizacion
**Registrado:** 2026-09-22 (detectado originalmente durante Fase 1, Tarea 2)

**Observation:** `Contact.astro` presenta una estructura preexistente con un `<div>`/`<section>` sin cerrar correctamente al final del archivo.

**Evidence:** Observado al instrumentar el evento GA4 del formulario de contacto (EXP-002); no se corrigio en ese momento para mantener el diff de esa tarea minimo y enfocado en una sola variable (Causal Discipline).

**Impact:** Bajo riesgo funcional inmediato (los navegadores toleran HTML mal cerrado y el renderizado actual no muestra problemas visibles), pero es deuda tecnica que podria complicar futuras modificaciones de este componente.

**Recommendation:** Corregir en un ciclo futuro de mantenimiento/limpieza tecnica, como cambio aislado de una sola variable, no combinado con cambios funcionales.

**Verificacion adicional (2026-09-23, durante auditoria de SEO/adquisicion):** Se confirmo mediante inspeccion directa de `dist/index.html` (build de produccion) que el compilador de Astro infiere y cierra correctamente el `<div>` y el `<section>` faltantes en el HTML generado (`...</script></div></section> </main> <footer...`). **No existe ningun defecto de renderizado, anidacion de DOM ni impacto en SEO en produccion hoy.** El hallazgo sigue siendo valido como deuda tecnica en el codigo fuente (riesgo de que una edicion futura del archivo, combinada con un cambio en el compilador de Astro, produzca un resultado distinto), pero se confirma que no es causa contribuyente de los problemas de posicionamiento identificados en la auditoria de la Fase 3.

**Priority:** Baja (confirmado: no aporta a la falta de posicionamiento).

**Risk:** Bajo.

**Reusability:** N/A (fix especifico de este archivo).

---

## BL-003 -- Cache de build de Netlify para el pipeline de optimizacion de imagenes [PROMOVIDO A EXP-006]

**Status:** Promovido a experimento formal EXP-006 (ver experiments/EXP-006-netlify-build-cache.md) el 2026-09-23.
**Registrado:** 2026-09-23 (detectado durante EXP-004b, migracion de imagenes)

**Observation:** No existe archivo `netlify.toml` en el repositorio, por lo que no hay configuracion explicita de cache de build. A partir de EXP-004a/EXP-004b, cada build de produccion procesa con Sharp las imagenes de los posts que usan el nuevo campo `coverImage` (141 posts tras la migracion), algo que antes no ocurria (0 imagenes procesadas por build).

**Evidence:** Validacion local de EXP-004b: un build limpio (sin cache) con las 141 imagenes reales excede varios minutos de procesamiento solo en la etapa de optimizacion de imagenes (estimado >3 minutos, extrapolado de una muestra real de 3 imagenes pesadas). Sin persistencia del cache de imagenes de Astro entre builds de Netlify, este costo se repetiria en cada deploy futuro, incluso para cambios que no toquen imagenes (ej. una correccion de texto en un solo post).

**Impact:** Incremento en el tiempo de build de Netlify en cada deploy, lo cual consume minutos de build que forman parte del modelo de creditos del proyecto (300 creditos/mes). Si no se cachea, este costo se paga de forma innecesaria y repetida en cada iteracion futura, incluso cuando ninguna imagen cambio.

**Recommendation:** Configurar el cache de build de Netlify (via `netlify.toml`, seccion `[build]` con `cache` o el mecanismo equivalente vigente en la documentacion de Netlify al momento de implementar) para persistir el directorio de cache de imagenes de Astro (tipicamente bajo `.astro/` o `node_modules/.astro/` -- confirmar la ruta exacta segun la version de Astro en uso al implementar) entre builds. Esto evitaria reprocesar imagenes que no cambiaron desde el build anterior.

**Priority:** Media (importante, no urgente -- confirmado por Salvador).

**Risk:** Bajo. Cambio de configuracion de infraestructura de build, no toca codigo de la aplicacion ni contenido. Debe validarse que el cache efectivamente reduce el tiempo de build en un Deploy Preview real antes de confiar en el ahorro de creditos.

**Reusability:** Alta -- aplica a cualquier proyecto Astro/Netlify que use optimizacion de imagenes en build.

---

## BL-004 -- Datos estructurados (JSON-LD) y lastmod en sitemap para los posts de Insights [PROMOVIDO A EXP-005]

**Status:** Promovido a experimento formal EXP-005 (ver experiments/EXP-005-structured-data-sitemap-lastmod.md) el 2026-09-23.
**Registrado:** 2026-09-23 (detectado durante revision de campos del frontmatter con Salvador)

**Observation:** El campo `pubDate` de cada post de Insights no tiene ninguna funcion de SEO actualmente. Se usa unicamente para ordenar el feed y mostrar la fecha visible al lector en la UI. No existen datos estructurados (JSON-LD) en las paginas de posts, y el sitemap generado por `@astrojs/sitemap` no expone `lastmod` por URL.

**Evidence:** Revision del codigo (`src/layouts/MainLayout.astro`, `src/pages/insights/[slug].astro`, `astro.config.mjs`): `MainLayout.astro` no incluye ningun bloque `<script type="application/ld+json">`; la configuracion de `sitemap()` en `astro.config.mjs` no tiene una funcion `serialize` personalizada, por lo que no anota `lastmod` a partir de `pubDate`. Se confirmo mediante `grep` que `pubDate` solo aparece en `InsightsFeed.astro` (ordenamiento) y en `[slug].astro` (fecha visible), nunca en metadatos de SEO.

**Impact:** Se pierden dos señales que Google usa activamente para contenido tipo articulo/blog: (1) datos estructurados `Article` (headline, description, image, datePublished, author) que habilitan resultados enriquecidos (rich results) en busqueda; (2) `lastmod` en el sitemap, que ayuda a Google a priorizar el rastreo de contenido nuevo o actualizado. Para un sitio cuyo objetivo es posicionamiento y autoridad en Telecomunicaciones/RAN, esto es una oportunidad de mejora mas directa que optimizaciones menores como `imageAlt` (que ya tiene funcion, aunque acotada).

**Recommendation:** 1) Agregar un bloque JSON-LD tipo `Article` (o `BlogPosting`) en `src/pages/insights/[slug].astro`, poblado con `title`, `description`, `pubDate` (como `datePublished`), la imagen (`coverImage`/`image` resuelta), y datos del autor (Salvador Ibarra). 2) Configurar una funcion `serialize` en la integracion `sitemap()` de `astro.config.mjs` para anotar `lastmod` de cada URL de insight usando `pubDate` (y, si se agrega en el futuro, una fecha de actualizacion). Ambos cambios son aditivos, no requieren modificar el frontmatter existente de los 141 posts (ya cuentan con `pubDate`), y siguen la misma disciplina de "un cambio, una variable" antes de cualquier despliegue.

**Priority:** Media (importante, no urgente -- identificado durante revision conjunta con Salvador el 2026-09-23).

**Risk:** Bajo. Cambios aditivos en metadatos/build config, no tocan contenido editorial ni URLs existentes. Debe validarse con Google's Rich Results Test y una revision de sitemap.xml generado antes de considerar el cambio cerrado.

**Reusability:** Alta -- el patron de JSON-LD `Article`/`BlogPosting` y `lastmod` en sitemap aplica a cualquier sitio Astro con contenido tipo blog/insights.

## BL-005 -- Imagen del Hero (headshot) sin optimizar, causando LCP movil de 8.7s en el homepage [CERRADO -- KEEP via EXP-007]

**Status:** Promovido a experimento formal EXP-007 el 2026-09-23, implementado, mergeado a produccion y validado con datos reales de PageSpeed Insights. Decision: KEEP. Resultado: LCP movil 8.7s -> 4.4s (-49%), performance score movil 67 -> 75, imagen del Hero 1,030 KB -> 22.7 KB (-97.8%), sin regresion en desktop ni en las 141 imagenes de Insights. Ver experiments/EXP-007-hero-headshot-optimization.md para el detalle completo.
**Registrado:** 2026-09-23 (detectado durante la primera linea base de PageSpeed Insights, tras el deploy de EXP-004a/EXP-004b/EXP-005/EXP-006)

**Observation:** El homepage obtiene un Performance score de solo 67/100 en movil (vs. 92/100 en escritorio), con un Largest Contentful Paint (LCP) de **8.7 segundos** en movil -- calificacion "poor" segun los umbrales de Google (>4s). El mismo problema no aparece en escritorio (LCP 1.7s) ni en las paginas de Insights ya migradas a `astro:assets` en EXP-004a/EXP-004b.

**Evidence:** Consulta real a la PageSpeed Insights API v5 (2026-09-23) sobre `https://salvadoribarra.tech/`, estrategia mobile. El detalle `network-requests` de la auditoria identifica `https://salvadoribarra.tech/assets/Salvador_Headshot_Primary.png` como el recurso mas pesado de la pagina: **1,030 KB** de transferencia. Confirmado en codigo (`src/components/Hero.astro`, linea 33): la imagen se renderiza con una etiqueta `<img src="/assets/Salvador_Headshot_Primary.png">` plana, sirviendose directamente desde `public/assets/` (1,054,779 bytes en disco, PNG sin comprimir) -- exactamente el mismo patron de defecto que EXP-004a/EXP-004b ya corrigio para las 141 imagenes de posts de Insights, simplemente nunca se aplico a esta imagen del Hero porque no pertenece a la coleccion de contenido `insights`.

**Impact:** El homepage es la pagina de entrada mas importante del sitio -- desde ahi se accede directamente a los dos eventos Tier 1 (Contact, CV download). Un LCP de 8.7s en movil esta muy por encima del umbral "poor" de Google (4s), lo cual perjudica tanto la experiencia real del visitante (la imagen principal tarda casi 9 segundos en aparecer) como senales de SEO relacionadas con Core Web Vitals. Es, ademas, el hallazgo de mayor impacto individual detectado hasta ahora en cualquier auditoria de rendimiento del proyecto.

**Recommendation:** Migrar `Salvador_Headshot_Primary.png` al pipeline de `astro:assets` (mover a `src/assets/` o a la coleccion correspondiente, usar `<Image />` con un ancho maximo razonable para el tamano real de renderizado del circulo del Hero, y formato WebP/AVIF), siguiendo exactamente el mismo patron ya implementado y validado dos veces en EXP-004a/EXP-004b. Es un cambio de una sola imagen, de alcance minimo y riesgo bajo.

**Priority:** Alta -- es el hallazgo de mayor impacto medido objetivamente hasta ahora (LCP "poor" en la pagina de entrada principal del sitio), y la solucion es de bajo riesgo por ser un patron ya probado.

**Risk:** Bajo. Cambio de una sola imagen en un solo componente (`Hero.astro`), mismo patron ya validado en produccion dos veces. Validar visualmente que el circulo del Hero se siga viendo nitido al nuevo ancho de renderizado antes de dar por cerrado el cambio.

**Reusability:** Alta -- el mismo patron de auditoria (buscar imagenes servidas fuera de `astro:assets` via el detalle `network-requests` de PageSpeed Insights) es reutilizable para detectar cualquier imagen similar que se agregue al sitio en el futuro fuera del flujo de Insights.

## BL-006 -- Script de Google Tag Manager sin `async`, bloqueando el render inicial del homepage [CERRADO -- KEEP via EXP-008]

**Status:** Cerrado 2026-09-23 con decision KEEP (ver experiments/EXP-008-gtag-async.md). Confirmado con PageSpeed Insights real en produccion: `gtag.js` ya no aparece como render-blocking, FCP movil del homepage mejoro 19% (3.6s -> 2.9s). El LCP movil no bajo de 4.4s -- el cuello de botella restante es la hoja de estilo de Google Fonts, candidato natural para una futura iteracion.

**Registrado:** 2026-09-23 (detectado durante el re-medicion de PageSpeed Insights post-EXP-007 contra produccion)

**Observation:** Con la imagen del Hero ya optimizada (EXP-007), el LCP movil del homepage bajo de 8.7s a 4.4s, pero el First Contentful Paint (FCP) no se movio (3.6s, igual que antes del fix). El nuevo elemento LCP de la pagina ya no es la imagen sino el titular `<h1>` ("Industrializing SON Outcomes via SMO-Driven Automation"), y el desglose de PageSpeed Insights (`lcp-breakdown-insight`) le atribuye un "Element render delay" de **2,363 ms** -- es decir, el texto del titular tarda mas de 2.3 segundos en pintarse una vez que el navegador ya podria hacerlo, porque algo esta bloqueando el render inicial.

**Evidence:** El audit `render-blocking-insight` de la misma medicion identifica tres recursos render-blocking en el homepage, con su ahorro estimado si se corrigen:
- `https://www.googletagmanager.com/gtag/js?id=G-Q023R5XBS1` -- 176,981 bytes de transferencia, **2,710 ms** de ahorro estimado (por mucho el mayor).
- `https://fonts.googleapis.com/css2?family=Inter...&display=swap` (hoja de estilo de Google Fonts) -- 1,597 bytes, 751 ms de ahorro estimado.
- `_astro/index.DV0xYDeC.css` (CSS critico propio del sitio) -- 8,682 bytes, 183 ms de ahorro estimado.

Confirmado en codigo: `src/components/GoogleAnalytics.astro` linea 1 carga el script de GTM asi: `<script is:inline src="https://www.googletagmanager.com/gtag/js?id=G-Q023R5XBS1"></script>` -- **sin el atributo `async` ni `defer`**. Por comportamiento estandar del navegador, un `<script>` externo sin `async`/`defer` bloquea el parseo del HTML (y por tanto el primer render) hasta que se descarga y ejecuta completamente. La guia oficial de Google para gtag.js recomienda explicitamente `<script async src="...">`. La hoja de fuentes de Google (`src/layouts/MainLayout.astro`, lineas 57-59) ya tiene `rel="preconnect"` a ambos dominios de Google Fonts (buena practica ya implementada), pero el `<link rel="stylesheet">` en si sigue siendo render-blocking por naturaleza de ese tipo de recurso.

**Impact:** El homepage es la pagina de entrada principal del sitio. Aunque el hallazgo mas grande (BL-005, imagen del Hero) ya se corrigio, el LCP movil (4.4s) sigue en la zona "needs improvement" de Google (2.5s-4s) y muy cerca del umbral "poor" (4s) -- el render-blocking de gtag.js es, segun la propia estimacion de Lighthouse, el factor individual mas grande que queda por corregir para acercarse a "good" (<2.5s).

**Recommendation:** Agregar el atributo `async` al script de GTM en `GoogleAnalytics.astro` (`<script async is:inline src="...">`), siguiendo la recomendacion oficial de Google. Este cambio no afecta la funcionalidad de medicion: el snippet inline que define `dataLayer`/`gtag()` ya funciona por diseno de cola (queue) independientemente de cuando termine de cargar el script externo, por lo que los eventos Tier 1 (`tier1_cv_download_conversion`, `tier1_contact_conversion`) seguiran disparando igual. Opcionalmente, en una iteracion posterior, evaluar si vale la pena aplicar la tecnica de carga no bloqueante para la hoja de estilo de Google Fonts (patron `media="print" onload`), aunque su impacto estimado (751 ms) es bastante menor que el de GTM.

**Priority:** Alta -- es el mayor contribuyente identificado y cuantificado al render delay actual, y la correccion propuesta es un cambio de una sola palabra (`async`) en un solo archivo.

**Risk:** Bajo. Cambio aditivo de un atributo HTML estandar, sin tocar la logica de medicion de GA4 ni los eventos Tier 1 ya validados. Debe validarse en Deploy Preview que los eventos `tier1_cv_download_conversion` y `tier1_contact_conversion` sigan disparando correctamente (usando la misma bandera de opt-out de GA4 que se uso para las validaciones anteriores) antes de dar por cerrado el cambio.

**Reusability:** Alta -- `async`/`defer` en scripts de terceros no criticos para el primer render es una practica general aplicable a cualquier script de analytics/marketing que se agregue al sitio en el futuro.

## BL-007 -- Limpieza de `public/assets/posts/` (405MB de imagenes originales sin optimizar, ya no utilizadas) [CERRADO -- KEEP via EXP-009]

**Status:** Cerrado 2026-09-23 con decision KEEP (ver experiments/EXP-009-cleanup-legacy-posts-assets.md). Confirmado en produccion: cero regresion en las 141 imagenes de Insights ni en el Hero, repositorio 405MB mas ligero.

**Registrado:** 2026-09-23 (evaluado tras confirmar en produccion que EXP-004a/EXP-004b y EXP-007 funcionan correctamente)

**Observation:** El directorio `public/assets/posts/` sigue existiendo en el repositorio con 148 archivos (405MB en total), dejado intencionalmente como red de seguridad durante EXP-004a/EXP-004b (ver Netlify Credit Model en el documento de gobernanza). Se evaluo si ya es seguro eliminarlo ahora que ambas migraciones de imagenes (Insights y Hero) estan confirmadas funcionando en produccion.

**Evidence:** Verificacion exhaustiva en el codigo actual (2026-09-23):
1. El esquema de la coleccion de contenido (`src/content/config.ts`, linea 17) define `coverImage: image().optional()` -- el campo moderno, optimizado por `astro:assets`.
2. **Los 141 posts de Insights tienen el campo `coverImage` poblado; 0 posts dependen unicamente del campo legacy `image`** (verificado programaticamente sobre los 141 archivos de contenido).
3. `coverImage` apunta a un archivo local dentro de la propia carpeta del post en `src/content/insights/<slug>/` (ejemplo verificado: `coverImage: "./l4-autonomous-networks.png"` en `src/content/insights/l4-autonomous-networks/`), **completamente independiente de `public/assets/posts/`**.
4. Las unicas 3 referencias restantes a `assets/posts` en el codigo (`src/components/InsightsFeed.astro`, `src/pages/insights/[slug].astro`, y un comentario en `config.ts`) son ramas de **fallback legacy** (`post.data.coverImage ? <Image ...> : post.data.image && <img src={`/assets/posts/...`}>`), que solo se ejecutarian si un post NO tuviera `coverImage` -- condicion que hoy no se cumple para ningun post.

En conjunto, esto confirma que `public/assets/posts/` es contenido huerfano: no se sirve a ningun visitante real bajo el estado actual del contenido.

**Impact:** Los 405MB no representan necesariamente consumo activo de creditos de ancho de banda de Netlify (solo se facturan bytes efectivamente servidos, y ningun codigo activo los solicita hoy), pero: (a) siguen incrementando el tamano del repositorio y el tiempo/peso de cada deploy, ya que Netlify publica todo el contenido de `public/` al CDN en cada build; y (b) URLs directas a estos archivos pudieron quedar indexadas externamente (buscadores, cache de redes sociales) de cuando el sitio los serviá activamente antes de EXP-004a/EXP-004b, por lo que podrian seguir generando trafico residual esporadico a archivos que ya no tienen proposito.

**Recommendation:** Eliminar el directorio `public/assets/posts/` completo (148 archivos, 405MB) del repositorio, y en el mismo cambio retirar las dos ramas de fallback legacy en `InsightsFeed.astro` y `[slug].astro` que referencian esa ruta (simplificando el codigo, ya que nunca se ejecutan con el contenido actual). Esta es una accion de **borrado de contenido**, que segun la Governance del proyecto requiere autorizacion explicita del humano antes de ejecutarse, incluso estando confirmada como segura.

**Priority:** Media -- no afecta ningun KPI de conversion ni de performance medido hoy (ya se confirmo que no se sirve), por lo que no es urgente, pero es limpieza de bajo esfuerzo con beneficio claro (tamano de repo/deploy) una vez autorizada.

**Risk:** Bajo, condicionado a la verificacion ya realizada (0 posts dependen del campo legacy). El unico escenario de riesgo seria que, en el futuro, alguien agregue un post nuevo usando el campo `image` legacy en vez de `coverImage` -- por eso se recomienda retirar tambien esas ramas de fallback en el mismo cambio, para que el esquema de contenido quede consistente (solo `coverImage`) y no vuelva a depender silenciosamente de una carpeta que ya no existira.

**Reusability:** Alta -- el patron de verificacion (confirmar en el esquema de contenido que 100% de los registros usan el campo moderno antes de borrar el legacy) es reutilizable para cualquier migracion futura de este tipo.


## BL-008 -- Canonical tag auto-referencial y ausencia de `trailingSlash` fijo -- duplicacion de URLs (con/sin `/` final) fragmentando la senal de posicionamiento [PROMOVIDO A EXP-010]

**Status:** Promovido a EXP-010 el 2026-09-24, implementado en la rama `feat/canonical-trailing-slash`, validado localmente (build de 144 paginas sin errores, canonical y sitemap normalizados, redirects 301 generados). Pendiente de validacion en Deploy Preview y aprobacion de merge por Salvador.
**Registrado:** 2026-09-23 (Fase 3, auditoria de SEO/adquisicion)

**Observation:** Multiples posts de Insights aparecen indexados por Google Search Console como dos URLs distintas -- con y sin `/` final (ej. `/insights/ee-tradeoff` y `/insights/ee-tradeoff/`) -- cada una acumulando impresiones por separado para las mismas queries.

**Evidence:** Consulta de Search Console (`dimensions=["query","page"]`, 2026-06-21 a 2026-09-21) muestra el par duplicado para al menos 2 posts de alto trafico: `ee-tradeoff` (138 impresiones sin slash vs. 2 con slash) y `massive-mimo-not-deliver-gains` (121 vs. 153 impresiones, practicamente divididas a la mitad). Verificado en codigo: `astro.config.mjs` no define `trailingSlash`, por lo que Astro usa el default (`ignore`) y genera `dist/insights/<slug>/index.html`, servible por Netlify en ambas formas de URL. Ademas, `MainLayout.astro` linea 18 genera el canonical como `new URL(Astro.url.pathname, siteUrl)` -- es decir, **el canonical se autorreferencia a la URL exacta solicitada, en vez de apuntar siempre a una sola forma fija**. Esto significa que ambas variantes se autodeclaran como "canonicas de si mismas" ante Google, en lugar de que una le diga a Google "la version correcta es la otra". El tag canonical existe (no es una ausencia total de la senal), pero esta implementado de una forma que no resuelve la duplicacion -- la refuerza.

**Impact:** Medio-Alto para las paginas afectadas. Fragmentar impresiones/clics entre dos URLs diluye la senal de relevancia que Google usa para posicionar; consolidar podria, en el mejor caso, sumar el potencial de ambas variantes en una sola URL con mas autoridad.

**Recommendation:** (1) Fijar `trailingSlash: 'never'` (o `'always'`, a decidir, pero una sola forma) en `astro.config.mjs`; (2) corregir el calculo de `canonicalURL` en `MainLayout.astro` para que siempre normalice a la forma elegida, sin importar la URL con la que se accedio a la pagina; (3) agregar una regla de redireccion 301 en Netlify (`netlify.toml` o `_redirects`) de la forma no elegida hacia la elegida, para consolidar tambien las URLs ya indexadas por Google.

**Priority:** Alta.

**Risk:** Medio -- un cambio de redireccion mal configurado puede afectar temporalmente URLs ya indexadas o enlaces externos existentes (ej. los `linkedinUrl` en el frontmatter no se ven afectados, pero conviene validar en Deploy Preview antes de fusionar).

**Reusability:** Alta -- el fix en `astro.config.mjs` y `MainLayout.astro` corrige el problema para las 141 paginas de Insights a la vez, no solo las 2 identificadas con evidencia directa.

---

## BL-009 -- Canibalizacion de keywords entre pares de posts de Insights

**Status:** Abierto -- pendiente de priorizacion
**Registrado:** 2026-09-23 (Fase 3, auditoria de SEO/adquisicion)

**Observation:** Dos pares de posts compiten entre si por las mismas queries de alto valor, en vez de que un solo post concentre toda la senal de relevancia para cada tema.

**Evidence:** Search Console (mismo periodo) muestra: (1) para "ran monitoring", `data-in-ran` (154 impr., pos. 84.4) y `ai-ran-where-adds-value` (105 impr., pos. 78.9) compiten; para "ran analytics", el mismo par vuelve a competir (`data-in-ran` 113 impr. pos. 70.0 vs. `ai-ran-where-adds-value` 27 impr. pos. 92.9). (2) Para "network slicing automation", `network-slicing-automation` (92 impr., pos. 47.5 -- la mejor posicion de toda la auditoria) compite con `networkslicing` (35 impr., pos. 81.9).

**Impact:** Medio. La canibalizacion no solo divide impresiones -- historicamente Google puede alternar cual de las dos paginas muestra para una misma query de una busqueda a otra, lo que genera inestabilidad de posicion ademas de dilucion de autoridad.

**Recommendation:** Para cada par: (1) decidir explicitamente cual pagina es la "primaria" para cada query (recomendacion inicial basada en posicion actual: `network-slicing-automation` como primaria de las queries de slicing/automation; entre `data-in-ran` y `ai-ran-where-adds-value` se requiere diferenciar mejor el angulo -- uno enfocado en "monitoring/observability" y el otro en "AI value-add" -- antes de declarar un ganador); (2) diferenciar el enfoque de contenido de cada pagina para que targeteen sub-intenciones distintas en vez de la misma query exacta; (3) enlazar internamente de la pagina secundaria hacia la primaria con anchor text relacionado, para consolidar autoridad en vez de competir.

**Priority:** Media-Alta.

**Risk:** Bajo -- es un cambio de contenido/enlaces, reversible, sin tocar codigo de infraestructura.

**Reusability:** Media -- el patron de diagnostico (cruzar query-page de Search Console para detectar canibalizacion) es reutilizable para el resto del catalogo de 141 posts en auditorias futuras.

---

## BL-010 -- Ausencia total de encabezados H2/H3 y de enlaces internos entre los posts de Insights de alto valor

**Status:** Abierto -- pendiente de priorizacion
**Registrado:** 2026-09-23 (Fase 3, auditoria de SEO/adquisicion)

**Observation:** Los 7 posts que generan impresiones en las 9 queries de expertise de Salvador tienen exactamente 0 encabezados `##`/`###` cada uno (solo el H1 del titulo, seguido de parrafos corridos), y no existe ni un solo enlace interno de un post de Insights hacia otro.

**Evidence:** Verificado directamente en el codigo fuente (`grep -c "^##"` = 0 en los 7 archivos `.md` de `network-slicing-automation`, `networkslicing`, `data-in-ran`, `ai-ran-where-adds-value`, `ee-tradeoff`, `cloud-ran`, `oran-plain`), y busqueda de enlaces internos (`href="/insights/` o `](/insights/` dentro del contenido de los posts) con resultado vacio.

**Impact:** Medio. La estructura de encabezados ayuda a Google a segmentar semanticamente el contenido (y es requisito practico para aparecer en featured snippets / "People Also Ask"); el enlazado interno entre contenido relacionado es una practica estandar de topic clusters que ayuda a distribuir autoridad y a que Google entienda la relacion tematica entre paginas (relevante tambien para mitigar BL-009).

**Recommendation:** Al reescribir/expandir cada post (ver BL-011), estructurar el contenido en 3-5 secciones con encabezados `##` que incluyan variaciones naturales de las queries objetivo, y agregar 2-3 enlaces internos contextuales hacia otros posts relacionados del catalogo.

**Priority:** Media.

**Risk:** Bajo.

**Reusability:** Alta -- aplica como estandar de calidad para los 141 posts existentes y para todo contenido futuro.

---

## BL-011 -- Profundidad de contenido insuficiente en los posts insignia de expertise (278-422 palabras)

**Status:** Abierto -- pendiente de priorizacion
**Registrado:** 2026-09-23 (Fase 3, auditoria de SEO/adquisicion)

**Observation:** Los 7 posts auditados tienen entre 278 y 422 palabras de cuerpo. Para terminos B2B tecnicos competitivos (ej. "o-ran", "cloud ran", "network slicing automation"), el contenido que suele posicionar en la primera pagina de resultados normalmente tiene mayor profundidad (multiples secciones, ejemplos, datos o cifras de respaldo).

**Evidence:** Conteo de palabras verificado directamente en los 7 archivos `.md` (`wc -w`): `network-slicing-automation` 278, `networkslicing` 384, `data-in-ran` 422, `ai-ran-where-adds-value` 371, `ee-tradeoff` 410, `cloud-ran` 396, `oran-plain` 345.

**Impact:** Medio. Nota importante de honestidad de diagnostico: incluso los posts con mejor alineacion de titulo a la query exacta (`cloud-ran` para "cloud ran", `oran-plain` para "o-ran") solo alcanzan posicion 66-73, no primera pagina -- por lo que la profundidad de contenido por si sola probablemente no sea suficiente para saltar a primera pagina (ver BL-012 sobre autoridad de dominio), pero es una palanca de bajo costo con impacto incremental razonable.

**Recommendation:** Expandir los 7 posts identificados (prioridad) y progresivamente el resto del catalogo, incorporando: mas profundidad tecnica/ejemplos concretos de la experiencia de Salvador, encabezados H2/H3 (BL-010), y alineacion mas precisa de titulo/primer parrafo con la query objetivo donde aplique (ver BL-009 para los casos de titulo desalineado: `networkslicing` no menciona "market" pese a targetear "network slicing market"; `data-in-ran`/`ai-ran-where-adds-value` no mencionan "monitoring"/"analytics" explicitamente).

**Priority:** Media.

**Risk:** Bajo. Nota de esfuerzo: a diferencia de la mayoria de items tecnicos de este backlog, este requiere trabajo de redaccion/contenido sostenido, no un cambio de codigo puntual.

**Reusability:** Alta -- el mismo trabajo de expansion aplica al resto del catalogo de posts.

---

## BL-012 -- Autoridad de dominio y perfil de backlinks casi nulo como factor estructural (no resoluble solo con cambios on-page)

**Status:** Abierto -- para discusion estrategica, no es un fix de codigo
**Registrado:** 2026-09-23 (Fase 3, auditoria de SEO/adquisicion)

**Observation:** El dominio `salvadoribarra.tech` tiene aproximadamente 7 meses de antiguedad (primer commit del repositorio: 2026-02-04) y, hasta donde esta auditoria puede verificar con las herramientas disponibles (Search Console, GA4, PSI -- ninguna mide backlinks de terceros), no hay evidencia de un perfil de enlaces externos hacia el sitio.

**Evidence:** Fecha del primer commit verificada en el historial de git. GA4 (2026-06-21 a 2026-09-21, `sessionDefaultChannelGroup`) muestra 102 sesiones "Direct", 12 "Organic Search" y 2 "Organic Social" en 3 meses -- ningun canal de "Referral" (enlaces desde otros sitios) aparece en absoluto, lo cual es consistente con (aunque no prueba de forma concluyente) un perfil de backlinks minimo o nulo.

**Impact:** Alto, pero de plazo largo. Este es el matiz mas importante a compartir sobre el diagnostico de Salvador (ver seccion de respuesta al punto 4, mas abajo): incluso si BL-008 a BL-011 se implementan perfectamente, es razonable esperar que un dominio de 7 meses sin backlinks tarde varios meses adicionales en escalar posiciones para terminos B2B tecnicos competitivos, independientemente de la calidad del contenido on-page. No es un defecto corregible con un cambio de codigo.

**Recommendation:** Complementar el trabajo on-page con una estrategia de autoridad externa: (1) enlazar desde los posts de LinkedIn (donde Salvador ya publica cada Insight, segun el campo `linkedinUrl`) hacia la version del sitio, en vez de que el contenido viva solo nativamente en LinkedIn; (2) buscar oportunidades de contribucion/mencion en publicaciones o directorios reconocidos del sector RAN/O-RAN/5G; (3) considerar que la ventana de tiempo esperada para ver movimiento en posicionamiento por autoridad de dominio se mide en meses, no en semanas -- ajustar expectativas de medicion de KPI en consecuencia.

**Priority:** Alta (estrategica), pero fuera del ciclo normal de "experimento de codigo" de este proyecto.

**Risk:** N/A -- no es un cambio tecnico.

**Reusability:** N/A.

---

## BL-013 -- Hoja de estilos de Google Fonts bloqueando el render (780ms estimados)

**Status:** Abierto -- pendiente de priorizacion (candidato ya identificado durante el cierre de EXP-008, formalizado ahora)
**Registrado:** 2026-09-23 (formalizado durante Fase 3; identificado originalmente el 2026-09-23 al cerrar EXP-008)

**Observation:** Tras resolver el render-blocking de `gtag.js` en EXP-008, el audit `render-blocking-insight` de PageSpeed Insights sigue mostrando la hoja de estilos de Google Fonts como recurso render-blocking, con un ahorro estimado de 751-780ms. El LCP movil del homepage se mantuvo sin cambio (4.4s) tras EXP-008 pese a la mejora de FCP, lo que sugiere que este recurso podria estar co-bloqueando el elemento LCP (el `<h1>` del titular).

**Evidence:** Documentado en `experiments/EXP-008-gtag-async.md` (seccion Evidence) y en `claude/pagespeed-insights-readonly-access.md` (Project doc), medicion de produccion del 2026-09-23.

**Impact:** Medio para performance/UX; indirecto para SEO (Core Web Vitals es un factor de posicionamiento menor, pero no es la causa principal del problema de adquisicion diagnosticado en esta sesion -- ver respuesta al punto 4).

**Recommendation:** Evaluar la tecnica `media="print" onload="this.media='all'"` para la hoja de estilos de Google Fonts, o alternativamente autoalojar (`self-host`) las fuentes para eliminar la dependencia de un origen externo.

**Priority:** Media.

**Risk:** Bajo.

**Reusability:** N/A (fix especifico de este recurso).

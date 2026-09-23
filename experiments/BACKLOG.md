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

**Priority:** Baja.

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

## BL-005 -- Imagen del Hero (headshot) sin optimizar, causando LCP movil de 8.7s en el homepage

**Registrado:** 2026-09-23 (detectado durante la primera linea base de PageSpeed Insights, tras el deploy de EXP-004a/EXP-004b/EXP-005/EXP-006)

**Observation:** El homepage obtiene un Performance score de solo 67/100 en movil (vs. 92/100 en escritorio), con un Largest Contentful Paint (LCP) de **8.7 segundos** en movil -- calificacion "poor" segun los umbrales de Google (>4s). El mismo problema no aparece en escritorio (LCP 1.7s) ni en las paginas de Insights ya migradas a `astro:assets` en EXP-004a/EXP-004b.

**Evidence:** Consulta real a la PageSpeed Insights API v5 (2026-09-23) sobre `https://salvadoribarra.tech/`, estrategia mobile. El detalle `network-requests` de la auditoria identifica `https://salvadoribarra.tech/assets/Salvador_Headshot_Primary.png` como el recurso mas pesado de la pagina: **1,030 KB** de transferencia. Confirmado en codigo (`src/components/Hero.astro`, linea 33): la imagen se renderiza con una etiqueta `<img src="/assets/Salvador_Headshot_Primary.png">` plana, sirviendose directamente desde `public/assets/` (1,054,779 bytes en disco, PNG sin comprimir) -- exactamente el mismo patron de defecto que EXP-004a/EXP-004b ya corrigio para las 141 imagenes de posts de Insights, simplemente nunca se aplico a esta imagen del Hero porque no pertenece a la coleccion de contenido `insights`.

**Impact:** El homepage es la pagina de entrada mas importante del sitio -- desde ahi se accede directamente a los dos eventos Tier 1 (Contact, CV download). Un LCP de 8.7s en movil esta muy por encima del umbral "poor" de Google (4s), lo cual perjudica tanto la experiencia real del visitante (la imagen principal tarda casi 9 segundos en aparecer) como senales de SEO relacionadas con Core Web Vitals. Es, ademas, el hallazgo de mayor impacto individual detectado hasta ahora en cualquier auditoria de rendimiento del proyecto.

**Recommendation:** Migrar `Salvador_Headshot_Primary.png` al pipeline de `astro:assets` (mover a `src/assets/` o a la coleccion correspondiente, usar `<Image />` con un ancho maximo razonable para el tamano real de renderizado del circulo del Hero, y formato WebP/AVIF), siguiendo exactamente el mismo patron ya implementado y validado dos veces en EXP-004a/EXP-004b. Es un cambio de una sola imagen, de alcance minimo y riesgo bajo.

**Priority:** Alta -- es el hallazgo de mayor impacto medido objetivamente hasta ahora (LCP "poor" en la pagina de entrada principal del sitio), y la solucion es de bajo riesgo por ser un patron ya probado.

**Risk:** Bajo. Cambio de una sola imagen en un solo componente (`Hero.astro`), mismo patron ya validado en produccion dos veces. Validar visualmente que el circulo del Hero se siga viendo nitido al nuevo ancho de renderizado antes de dar por cerrado el cambio.

**Reusability:** Alta -- el mismo patron de auditoria (buscar imagenes servidas fuera de `astro:assets` via el detalle `network-requests` de PageSpeed Insights) es reutilizable para detectar cualquier imagen similar que se agregue al sitio en el futuro fuera del flujo de Insights.

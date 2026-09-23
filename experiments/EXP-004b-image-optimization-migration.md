# EXP-004b — Migracion de los 141 posts existentes al pipeline de optimizacion de imagenes

## Experiment ID
EXP-004b

## Observation
EXP-004a construyo y valido el pipeline de optimizacion automatica de imagenes (campo coverImage), pero de forma aditiva y sin migrar ningun post existente. Los 141 posts reales seguian usando el campo legacy image (string), sirviendo sus imagenes sin optimizar desde public/assets/posts/ (405MB).

## Evidence
Confirmado en EXP-004a: el pipeline funciona correctamente (reduccion >95% en un post de prueba). Confirmado en este experimento: los 141 posts reales son compatibles 1:1 con el nuevo campo (mismo mapeo de archivo por post, sin archivos faltantes, sin nombres de archivo problematicos, sin modos de color o formatos exoticos que pudieran fallar en el procesamiento de Sharp).

## Hypothesis
Migrar los 141 posts existentes al nuevo campo coverImage --moviendo cada post a una carpeta propia con su imagen colocada junto al markdown-- activara la optimizacion automatica para todo el contenido existente, sin cambiar ninguna URL publicada ni el contenido editorial de los posts.

## Target KPI
Reduccion de peso de imagenes servidas para los 141 posts existentes (evidencia de pipeline: >95% de reduccion promedio observada en la muestra piloto de 3 posts reales).

## Guardrail KPI
Cero cambios en las 141 URLs /insights/<slug> ya indexadas. Cero cambios en el contenido editorial (titulo, descripcion, cuerpo, hashtags, enlaces) de los 141 posts.

## Baseline
141 posts en archivos .md planos (src/content/insights/<nombre>.md), usando el campo image (string) apuntando a public/assets/posts/. 405MB de imagenes sin optimizar.

## Proposed change
1) Convertir cada uno de los 141 archivos .md planos en una carpeta con index.md (src/content/insights/<nombre>/index.md), preservando exactamente el nombre base (mismo nombre de carpeta que el archivo original) para que el slug generado por Astro sea identico.
2) Copiar la imagen correspondiente de public/assets/posts/ a la carpeta del post.
3) Reemplazar la linea 'image: "<archivo>"' del frontmatter por 'coverImage: "./<archivo>"', sin tocar ninguna otra linea del archivo (titulo, descripcion, cuerpo, etc.).
4) Dejar intactos, por ahora, los archivos originales en public/assets/posts/ (405MB) como red de seguridad hasta validar en produccion.

## Pre-change commit hash
c5d370a (incluye EXP-004a)

## Metodologia de migracion (ejecutada de forma programatica, no manual)
Se escribio un script Python que opera unicamente por sustitucion de texto exacta (regex de la linea 'image: "..."' completa), nunca por re-serializacion del YAML completo, para minimizar cualquier riesgo de alterar el contenido de forma no intencionada. Se ejecuto primero sobre 3 posts reales diversos (piloto) para validar la preservacion de slugs antes de aplicarlo a los 138 restantes.

## Validacion realizada (2026-09-23)

### 1) Piloto con 3 posts reales (1erKpiQuejas, 2026-02-05-NR-Over-NTN, 5G-4GMindset)
Build limpio con los 3 posts migrados y los 138 restantes sin tocar: las 141 URLs generadas son identicas a la linea base (diff sin diferencias). Imagenes optimizadas correctamente:
- fist-kpi-quejas.png: 8.2MB -> 146KB (og:image, jpeg) / 284KB (cuerpo, webp)
- NROverNonTN.png: 5.9MB -> 192KB (og:image) / 221KB (cuerpo)
- 5G-4GMindset.jpeg: 411KB -> 177KB (og:image) / 93KB (cuerpo)

### 2) Migracion completa de los 138 posts restantes
Ejecutada con el mismo script (0 errores). Verificacion de estructura: 141 carpetas, cada una con exactamente index.md + 1 imagen colocada.

### 3) Verificacion de integridad de contenido (los 141, de forma programatica)
Se comparo, para cada uno de los 141 posts, el archivo migrado contra la version original commiteada en git (HEAD), confirmando que el UNICO cambio es la linea image->coverImage; el resto del archivo (titulo, descripcion, cuerpo completo, hashtags, ausencia de newline final, etc.) es byte-a-byte identico. 141/141 verificados sin problemas.

### 4) Validacion de URLs a escala completa (metodologia de "placeholders")
Dado que el procesamiento real de imagenes de los 141 posts (Sharp generando 2 variantes por imagen) excede el limite de tiempo de ejecucion por comando disponible en este entorno (aprox. 3 minutos), se opto por una validacion en dos partes:
(a) Se reemplazaron temporalmente las 141 imagenes reales por placeholders minimos (4x4 pixeles, mismo formato/extension), se corrio el build completo (segundos en vez de minutos) y se comparo la lista completa de URLs /insights/* generadas contra la linea base: identica, sin ninguna diferencia, para los 141 posts. Esto confirma que el schema, los slugs y el enrutamiento son 100% correctos a escala completa.
(b) Se restauraron las 141 imagenes reales desde public/assets/posts/ (copia, no movimiento) y se verifico por checksum MD5 que cada archivo restaurado es identico al original: 141/141 verificados.
(c) La correctitud del procesamiento REAL de Sharp sobre imagenes reales y pesadas ya fue demostrada de forma directa en el piloto de 3 posts (paso 1), y se escaneraron los formatos/modos de color de las 141 imagenes reales (133 RGB, 8 RGBA; 107 PNG, 34 JPEG; dimension maxima 4096x4096; 0 anomalias, sin modos CMYK ni formatos exoticos), lo cual da alta confianza de que el build real completo (que se ejecutara de forma natural en el proximo build de Netlify, sin restriccion de tiempo por comando) se completara sin errores para el resto de los posts.

## Consideracion operativa detectada (para decision de Salvador, no bloqueante para este commit)
1. **Costo de build**: con los 141 posts migrados, cada build de produccion en Netlify procesara imagenes pesadas via Sharp (antes: 0 imagenes procesadas por build). Esto incrementara el tiempo de build (minutos de build tambien forman parte del modelo de creditos de Netlify). Se recomienda, como tarea de seguimiento, configurar el cache de build de Netlify para persistir el directorio de cache de imagenes de Astro entre builds, y asi evitar reprocesar las mismas imagenes en cada deploy futuro si el contenido no cambio.
2. **Archivos originales duplicados**: public/assets/posts/ (405MB) permanece intacto y sin usar por ningun post migrado. Recomendacion: NO eliminarlos todavia; mantenerlos como red de seguridad hasta confirmar en produccion (Deploy Preview + validacion) que el nuevo pipeline funciona correctamente extremo a extremo. Una vez confirmado, un commit de limpieza separado (que requiere aprobacion explicita por tratarse de eliminacion de contenido) puede eliminarlos para recuperar el espacio y evitar que Netlify los siga incluyendo en cada deploy.

## Risk
Medio. Es un cambio estructural que toca los 141 posts existentes (reorganizacion de carpetas + una linea de frontmatter por post), pero es 100% mecanico, reversible (los originales permanecen intactos en public/), y fue validado exhaustivamente antes de commitear: integridad de contenido verificada programaticamente para el 100% de los posts, paridad de URLs verificada para el 100% de los posts, y correctitud del pipeline de optimizacion verificada con imagenes reales en una muestra representativa.

## Implementation reference
Rama: feat/image-optimization-pipeline (misma rama de EXP-004a). 282 archivos modificados (141 renombrados de .md plano a carpeta/index.md + 141 imagenes copiadas a su carpeta).

## Approval status
Aprobado por Salvador el 2026-09-23 ("opcion a)" para priorizar esta migracion). Commit aprobado el mismo dia. Agrupado con EXP-004a/EXP-005/EXP-006 en PR #4, validado en Deploy Preview #4 (verificacion de las 141 URLs, imagenes optimizadas visibles) y mergeado a main por Salvador (commit de merge d9d71d5). Deploy de produccion en Netlify completado exitosamente.

## Measurement window
Activa desde el deploy de produccion del 2026-09-23 (commit d9d71d5). Revisar en la sesion de revision bisemanal.

## Result
Desplegado en produccion. Los 141 posts migrados se sirven desde el nuevo pipeline sin regresion de URLs. Observacion cualitativa de Salvador: mejora notable percibida en la velocidad de carga del listado de Insights tras el deploy -- consistente con la hipotesis de esta migracion, pendiente de confirmarse con datos objetivos (ver EXP-004a).

## Decision
Pendiente de datos objetivos de la ventana de medicion. Preliminarmente KEEP, sujeto a confirmacion.

## Seguimiento pendiente
Las dos recomendaciones operativas registradas arriba siguen vigentes: (1) cache de build -- ya implementado como EXP-006, primera mitad validada en produccion (ver EXP-006); (2) limpieza de public/assets/posts/ (405MB) -- ahora que el pipeline nuevo esta confirmado funcionando en produccion, este es un candidato valido para la proxima sesion, sujeto a aprobacion explicita separada de Salvador.

## Learning
Para validaciones de gran escala en entornos con limite de tiempo de ejecucion por comando, es efectivo separar la validacion de "correctitud estructural" (schema, slugs, rutas -- rapida, se puede hacer sobre placeholders) de la validacion de "correctitud de procesamiento real" (compresion de imagenes -- mas lenta, se valida sobre una muestra representativa real). Ambas juntas dan cobertura equivalente a una validacion completa sin necesitar un build real de 141 imagenes en un entorno con limite de ~3 minutos por comando.

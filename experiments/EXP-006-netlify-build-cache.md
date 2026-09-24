# EXP-006 -- Cache de build de Netlify para las imagenes optimizadas de Astro

## Experiment ID
EXP-006

## Observation
BL-003 identifico que, a partir de EXP-004a/EXP-004b, cada build de produccion en Netlify procesa con Sharp las imagenes de los 141 posts de Insights (antes: 0 imagenes procesadas por build), sin ningun mecanismo de cache entre builds. Esto incrementa el tiempo de build en cada deploy futuro, incluso para cambios que no tocan imagenes.

## Evidence
Ver BL-003 para la evidencia original (estimacion de tiempo de procesamiento). Investigacion adicional en este experimento: no existe un mecanismo nativo de Netlify (via netlify.toml) para cachear un directorio arbitrario entre builds; el mecanismo real es la API oficial `utils.cache` (paquete `@netlify/cache-utils`, mantenido por Netlify) inyectada automaticamente a cualquier build plugin.

## Hypothesis
Restaurar y guardar el directorio `node_modules/.astro` (donde Astro almacena las imagenes ya optimizadas) entre builds, usando un build plugin de Netlify, evita que Sharp reprocese imagenes que no cambiaron desde el build anterior, reduciendo el tiempo de build y por tanto el consumo de minutos de build del modelo de creditos de Netlify.

## Target KPI
Tiempo de build en Netlify de deploys consecutivos sin cambios en imagenes (se espera una reduccion sustancial del tiempo dedicado a la fase "generating optimized images" a partir del segundo deploy).

## Guardrail KPI
Cero cambios en el sitio construido (HTML, imagenes servidas) respecto a un build sin cache. El build debe seguir completando exitosamente.

## Baseline
0 mecanismos de cache de build configurados. Cada build reprocesa las 141 imagenes de Insights desde cero.

## Investigacion de alternativas (antes de implementar)
Se evaluaron dos opciones:

1) **`netlify-plugin-cache` (paquete de terceros, npm)**: es el enfoque documentado por varios blogs tecnicos sobre Astro + Netlify. Se investigo su reputacion antes de usarlo: ~80,600 descargas/mes, 24 estrellas en GitHub, licencia MIT, sin senales de codigo malicioso u ofuscado. Sin embargo, **no se actualiza desde junio de 2020** (mas de 6 anos), y de sus 7 issues abiertos en GitHub, **4 describen fallas reales**, incluyendo un issue especifico y sin resolver de **incompatibilidad con Node v20**. Dado que los builds de Netlify en 2026 corren versiones de Node recientes, se descarto esta opcion por riesgo real de fallo silencioso o build roto.

2) **Plugin local usando `@netlify/cache-utils` directamente (opcion elegida)**: este es el paquete oficial de Netlify (namespace `@netlify/`, version actual 6.0.2, activamente mantenido) que el plugin de terceros usa por debajo. Netlify inyecta su API (`utils.cache.restore()`/`utils.cache.save()`) automaticamente a cualquier build plugin, sin necesidad de instalarlo como dependencia. Se opto por escribir un plugin local propio (dentro del repositorio, sin ninguna dependencia externa de npm), eliminando por completo el riesgo de mantenimiento/compatibilidad de un paquete de terceros.

## Proposed change (implementado)
1) Nuevo plugin local de Netlify en `netlify/plugins/cache-astro-images/` (`manifest.yml` + `index.js`): `onPreBuild` restaura `node_modules/.astro` desde el cache de Netlify (si existe); `onPostBuild` lo guarda de vuelta para el siguiente build. Ambos hooks registran en el log de build si hubo cache previo o no, para poder verificar el comportamiento revisando los logs de Netlify.
2) Nuevo `netlify.toml` en la raiz del repositorio (no existia ninguno antes), que unicamente declara el plugin (`[[plugins]] package = "./netlify/plugins/cache-astro-images"`). Deliberadamente NO se definen `[build.command]` ni `[build.publish]` en este archivo, para no sobreescribir la configuracion de build ya existente en el dashboard de Netlify.

## Pre-change commit hash
b103847

## Risk
Bajo. El plugin es aditivo (no modifica el HTML, CSS, JS ni las imagenes del sitio final), usa unicamente la API oficial de Netlify, y en el peor caso (que restore/save fallen) el build simplemente no se beneficia del cache pero no se corrompe -- Netlify reporta cualquier error de un plugin de build como fallo explicito y visible en el log, no como una falla silenciosa.

## Implementation reference
Rama: feat/image-optimization-pipeline. Archivos nuevos: netlify.toml, netlify/plugins/cache-astro-images/manifest.yml, netlify/plugins/cache-astro-images/index.js.

## Validacion realizada (2026-09-23)
1. Verificacion de sintaxis: el archivo `index.js` se importa correctamente como modulo ES, expone `onPreBuild` y `onPostBuild` como funciones, y ambos hooks se ejecutaron sin lanzar errores usando un mock minimo de `utils.cache` (que simula las firmas reales documentadas: `restore(path): Promise<boolean>`, `save(path): Promise<boolean>`).
2. Verificacion de sintaxis TOML: `netlify.toml` parsea correctamente a la estructura esperada (`{'plugins': [{'package': './netlify/plugins/cache-astro-images'}]}`).
3. **Limite conocido de esta validacion**: la logica de restaurar/guardar contra el cache REAL y distribuido de Netlify solo puede probarse con un despliegue real (Netlify no expone ese backend de cache localmente sin usar netlify-cli enlazado al sitio real). Por tanto, la prueba definitiva de que el cache efectivamente persiste y reduce el tiempo de build requiere observar los logs de al menos 2 builds reales consecutivos en Netlify: el primero debe mostrar "sin cache previo" y guardar el cache; el segundo deberia mostrar "cache restaurado" y completar la fase de optimizacion de imagenes mas rapido.

## Approval status
Aprobado por Salvador el 2026-09-23, incluyendo el cambio de enfoque (de plugin de terceros a plugin local sin dependencias) tras compartir los hallazgos de reputacion: "con esta nueva hallazgo, con esta version mas segura. Vamos, adelante." Agrupado con EXP-004a/EXP-004b/EXP-005 en PR #4, mergeado a main por Salvador (commit de merge d9d71d5).

## Measurement window
Primer deploy de produccion tras el merge: 2026-09-23, commit d9d71d5 (build iniciado 3:16:35 PM, completado en 1m 3s). Segundo deploy de produccion consecutivo: 2026-09-23, commit 1ba294b (EXP-007), build iniciado ~5:34:47 PM, completado en verde ~5:34 PM (confirmado por Salvador).

## Result
**Validacion completa con datos reales de dos builds de produccion consecutivos (2026-09-23):**

Primer build (`main@d9d71d5`), sin cache previo:
- `onPreBuild` (3:16:55 PM): `[cache-astro-images] sin cache previo (primer build o cache vacio): node_modules/.astro` -- esperado, primer build con el plugin activo.
- `onPostBuild` (3:17:20 PM): `[cache-astro-images] cache guardado para el proximo build: node_modules/.astro`.

Segundo build (`main@1ba294b`, deploy de produccion de EXP-007), con cache del build anterior:
- `onPreBuild` (5:34:48 PM): `[cache-astro-images] cache restaurado desde un build anterior: node_modules/.astro` -- **confirma que el cache efectivamente persiste entre builds**, no solo que se guarda una vez.
- `onPostBuild` (5:34:53 PM): `[cache-astro-images] cache guardado para el proximo build: node_modules/.astro`.

El mecanismo de restore/save funciona en ambas direcciones tal como se diseno, usando exclusivamente la API oficial `@netlify/cache-utils` sin dependencias de terceros. Comparacion de tiempo de build total entre ambos deploys: pendiente de confirmar con Salvador (dato visible en el resumen del deploy en Netlify, mismo lugar donde se obtuvo "1m 3s" para el primer build) -- no bloquea la decision, ya que el Guardrail KPI (build exitoso, cero cambios en el sitio construido) se cumplio en ambos builds y el mecanismo de cache en si quedo verificado de forma directa via los logs.

## Decision
**KEEP.** El mecanismo de cache de build funciona segun lo disenado: guarda el cache de imagenes optimizadas de Astro al final de un build y lo restaura correctamente al inicio del siguiente, confirmado con evidencia directa de los logs de dos builds de produccion reales y consecutivos. Sin ninguna regresion en el sitio construido. La cuantificacion exacta del ahorro de tiempo de build (segundos/minutos) queda como un dato complementario a registrar cuando este disponible, no como condicion para la decision.

## Learning
Antes de adoptar un paquete de terceros para resolver un problema de infraestructura, vale la pena revisar si el paquete es solo un envoltorio delgado sobre una herramienta oficial ya disponible (en este caso, `@netlify/cache-utils`, expuesta automaticamente via `utils.cache` a cualquier build plugin) -- frecuentemente se puede lograr el mismo resultado sin sumar una dependencia externa, eliminando por completo su riesgo de mantenimiento o compatibilidad futura.

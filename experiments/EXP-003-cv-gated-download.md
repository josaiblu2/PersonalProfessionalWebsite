# EXP-003 — Descarga de CV con verja de correo electronico

## Experiment ID
EXP-003

## Observation
No existia ningun mecanismo de descarga directa de CV en el sitio; el unico camino para solicitar el CV era el formulario de contacto general (opcion "Request CV" en el desplegable de tipo de consulta).

## Evidence
Hallazgo del Website Baseline Assessment v1.0 (Fase 0): no se encontro enlace ni mecanismo de descarga de CV en el codigo. Salvador coloco el archivo PDF en public/assets/cv/Salvador_Ibarra_Luna_CV_Master_v1_3.pdf para habilitar esta funcionalidad.

## Hypothesis
Ofrecer una descarga directa de CV, condicionada a capturar el correo del visitante, crea un segundo canal Tier 1 de generacion de leads (ademas del formulario de contacto), sin perder la captura del contacto.

## Target KPI
Tier 1 — descargas de CV con correo capturado.

## Guardrail KPI
Tasa de envio exitoso del formulario de contacto general (no debe verse afectada; es un formulario y un evento completamente independientes).

## Baseline
0 descargas de CV instrumentadas (no existia el mecanismo).

## Proposed change
1) El boton "Request CV" del Hero pasa de ser un ancla a #contact a ser un boton que abre un modal (<dialog>) con un formulario corto de un solo campo (correo, obligatorio).
2) El formulario se declara como un formulario de Netlify Forms independiente, name="cv-request", distinto de name="contact". Se agrega su declaracion estatica en public/forms.html (mismo patron ya usado en produccion para el formulario de contacto) para asegurar que Netlify lo detecte en build.
3) Al enviarse: fetch() POST a Netlify con el email; solo si la respuesta es exitosa se dispara un evento GA4 propio y distinto, tier1_cv_download_conversion (event_category: Tier1_Conversion, event_label: cv_download, transport_type: beacon), y se inicia la descarga del PDF via un enlace con atributo download generado dinamicamente.
4) Si el envio a Netlify falla (error de red u otro), NO se inicia la descarga y se muestra un mensaje de error con opcion de reintentar. Decision confirmada explicitamente por Salvador: la captura del correo es un requisito estricto, no opcional.
5) El formulario de contacto general permanece sin cambios como via alterna de solicitud de CV (opcion "Request CV" en su desplegable).

## Pre-change commit hash
1aacc4159389af4c4597c531110ec49d22b0fb6c

## Risk
Medio-bajo. Es funcionalidad nueva (no modifica un flujo critico existente), pero introduce un nuevo formulario, un nuevo modal y una nueva llamada de red. Mitigado con: reutilizacion del patron de <dialog> ya probado en produccion (CaseStudies.astro), manejo explicito de errores sin descarga silenciosa, y validacion de build local antes de PR.

## Approval status
Aprobado explicitamente por Salvador en sesion de chat, 2026-09-21 (Fase 1, Tarea 3). Confirmado: el boton Request CV existente se reemplaza (no se agrega uno nuevo separado). Confirmado: fallo de envio bloquea la descarga.

## Implementation reference
Rama: feat/cv-gated-download (basada en fix/hero-mailto-placeholder para evitar conflictos de merge en Hero.astro).

## Measurement window
Ciclo de revision bisemanal por defecto (2 semanas) a partir del deploy a produccion.

## Result
Desplegado y validado en produccion. Ventana de medicion de 2 semanas activa desde 2026-09-22 (evento marcado como Key Event en GA4). Resultado cuantitativo pendiente hasta el cierre de la ventana.

## Decision
Confirmado por Salvador el 2026-09-22: 'tier1_cv_download_conversion' ya esta marcado como Key Event en GA4 Admin, distinto del Key Event de EXP-002. Con esto arranca formalmente la ventana de medicion de 2 semanas (2026-09-22 a 2026-10-06 aprox.). Al cierre de esa ventana se revisaran los resultados frente al KPI objetivo y se documentara en la seccion Result/Learning.

## Learning
Pendiente.

## Correction cycle 1 (post-QA local, pre-produccion)
Salvador probo el flujo localmente (npm run dev) antes de aprobar el push a produccion, siguiendo la disciplina de pruebas locales del proyecto, y reporto tres hallazgos:

1) No se mostraba ningun mensaje de cortesia confirmando el envio/descarga, ni tampoco un error.
2) El PDF no se descargo en su equipo; el historial de descargas del navegador mostro "el archivo no se encontraba disponible en el sitio".
3) Los textos del modal estaban en espanol, inconsistente con el resto del sitio (en ingles).

Investigacion (con curl contra astro dev y astro preview reales en el dispositivo, no solo suposicion):
- El PDF SI se sirve correctamente (HTTP 200, bytes correctos) tanto en dev como en preview: el archivo nunca estuvo roto.
- POST a '/' bajo `astro dev` devuelve 200 con el HTML de la home (el dev server no tiene un endpoint real para el POST, asi que cualquier metodo cae al fallback de la ruta estatica). Bajo `astro preview` devuelve 404. Ninguno de los dos es el comportamiento real de Netlify Forms en produccion: **el envio real a Netlify Forms no se puede validar 100% con `astro dev`/`astro preview`**, solo con una Netlify Deploy Preview real o con `netlify dev` (Netlify CLI) si esta instalado. Esto se documenta aqui como limite conocido de las pruebas locales para este componente especifico.
- La descarga automatica (click programatico de un <a download>) puede ser bloqueada silenciosamente por el navegador cuando ocurre despues de un `await fetch(...)`, ya que algunos navegadores solo permiten descargas automaticas dentro de la cadena sincrona del gesto original del usuario. Esto explica de forma plausible por que el intento automatico fallo sin lanzar ningun error de JavaScript.

Correccion aplicada (mismo commit/rama, antes de cualquier push):
- Todo el texto del modal traducido a ingles (titulo, etiqueta, botones, mensajes de exito y error), consistente con el resto del sitio.
- La vista de exito ahora es un panel persistente (no se autocierra) con: mensaje de confirmacion claro, y un enlace real y directamente clickeable "Download CV (PDF)" que apunta al mismo PDF -- este enlace es un respaldo garantizado, independiente de si la descarga automatica funciona o no, porque es un click genuino del usuario sin ninguna dependencia de gestos heredados de un await previo.
- Se mantiene el intento de descarga automatica como mejora de UX cuando funciona, pero ya no es el unico mecanismo.
- Reabrir el modal ahora reinicia su estado (formulario limpio, sin mensajes previos).

Validacion post-correccion: 17 pruebas funcionales con Playwright headless contra el build real (HTML + CSS exactos generados por `astro build`, verificando que el hash de CSS coincidiera con el HTML antes de concluir), cubriendo: textos en ingles, descarga automatica + enlace de respaldo en el camino de exito, bloqueo de descarga + mensaje de error + reintento habilitado en el camino de fallo, y reinicio correcto del modal al reabrir. Las 17 pasaron.

Accion recomendada para Salvador antes del merge final: validar el envio real del formulario cv-request (y del formulario de contacto) usando la Netlify Deploy Preview que Netlify genera automaticamente al abrir el Pull Request -- esto no consume creditos de deploy de produccion segun el modelo de creditos del proyecto, y es el unico entorno donde Netlify Forms funciona de verdad.

## Correction cycle 2 (causa raiz real, post-produccion)

Tras el deploy a produccion del "Correction cycle 1", Salvador probo la descarga directamente contra el sitio en vivo (salvadoribarra.tech) y reporto que la descarga seguia sin completarse en su equipo, incluso al hacer clic genuino en el nuevo enlace de respaldo "Download CV (PDF)" (no un intento automatico/programatico). El historial de descargas de Chrome mostro cuatro intentos consecutivos con el error "Sin archivos".

Esto invalido la hipotesis del "Correction cycle 1" sobre la cadena de gesto del usuario tras un `await fetch()`, ya que el fallo persistio incluso en un click 100% genuino y directo, sin ningun fetch de por medio.

Investigacion definitiva: se ejecuto `git ls-files public/assets/cv/` y `git log --all --diff-filter=A -- "public/assets/cv/*"` sobre el repositorio real. Ambos comandos devolvieron un resultado completamente vacio en todas las ramas.

**Causa raiz confirmada**: el archivo `public/assets/cv/Salvador_Ibarra_Luna_CV_Master_v1_3.pdf` nunca fue agregado a ningun commit de git, en ninguna rama, desde que Salvador lo coloco en el disco local. Netlify construye el sitio desde un checkout limpio del repositorio de git, no desde el disco de Salvador ni desde el disco de este agente; por lo tanto, el archivo jamas existio en ningun build desplegado a produccion, sin importar que tan correcto fuera el HTML/JS que lo referenciaba. Esto explica los tres sintomas originales del "Correction cycle 1" (sin descarga, sin email, "archivo no disponible") y tambien el fallo persistente en produccion reportado despues.

Falla metodologica identificada y reconocida: todas las pruebas locales previas (incluyendo las 17 pruebas de Playwright del "Correction cycle 1") se ejecutaron contra copias preparadas a partir del directorio de trabajo real de Salvador, donde el PDF SI existe fisicamente en disco -- por lo tanto esas pruebas nunca pudieron detectar que el archivo estaba ausente del historial de git, que es exactamente lo que Netlify si nota. Correccion de proceso adoptada de aqui en adelante para este tipo de activos estaticos: validar tambien contra un `git clone` limpio de la rama (o equivalente), no solo contra el arbol de trabajo local.

Correccion aplicada:
- Commit `fa60e2a` en la rama `hotfix/cv-modal-english-and-download-fallback`: se agrego el PDF a git (`git add` + commit dedicado, separado del commit de idioma/UX para mantener el historial claro).

Validacion de esta correccion (metodologia mejorada, sobre clon limpio, no sobre el arbol de trabajo):
1. `git clone` local y limpio de la rama `hotfix/cv-modal-english-and-download-fallback` (solo contenido versionado en git).
2. Confirmado: el PDF aparece en el clon limpio, con checksum MD5 identico al archivo original en el disco de Salvador (`6a736a16505929eaf539bbeb244c43ba`).
3. `npm install` + `npm run build` ejecutados sobre ese clon limpio (sin ninguna dependencia del arbol de trabajo real): build completado sin errores, 144 paginas generadas.
4. Confirmado: `dist/assets/cv/Salvador_Ibarra_Luna_CV_Master_v1_3.pdf` existe en la salida del build, con el mismo checksum MD5, y `dist/index.html` referencia exactamente esa misma ruta (`/assets/cv/Salvador_Ibarra_Luna_CV_Master_v1_3.pdf`).

Este es ahora el fix real y verificado del problema de descarga. El "Correction cycle 1" (idioma en ingles, vista de exito persistente, enlace de respaldo garantizado) sigue siendo una mejora valida y se mantiene, pero por si sola no habria resuelto el problema reportado por Salvador porque el archivo referenciado no existia en el servidor.

Accion pendiente de Salvador: hacer `git push` de la rama `hotfix/cv-modal-english-and-download-fallback` actualizada (ahora con los commits `80372b1` y `fa60e2a`) y actualizar/mergear el Pull Request correspondiente. Se reitera la recomendacion de validar primero con la Netlify Deploy Preview que se genera automaticamente en el PR, dado que es el unico entorno que replica fielmente tanto el build desde git limpio como el backend real de Netlify Forms.

## Validacion final en Netlify Deploy Preview (PR #3)

Salvador valido el fix del PDF (commit `fa60e2a`) directamente contra el Deploy Preview generado automaticamente por Netlify para el PR #3 (`https://deploy-preview-3--stellular-strudel-c35baa.netlify.app`), en ventana de incognito para descartar cache del navegador. Resultado: descarga exitosa.

Nota importante detectada durante esta validacion: una prueba previa contra el dominio de produccion (salvadoribarra.tech) seguia mostrando el error "archivo no disponible", lo cual es el comportamiento esperado y correcto -- production todavia no incluye este fix porque el PR no se ha mergeado aun. No se trata de un bug adicional, sino de la diferencia esperada entre el Deploy Preview (que si construye desde el commit con el PDF) y produccion (que sigue en el commit anterior hasta el merge).

Con esta validacion en un entorno que replica fielmente el build real de Netlify, el fix queda confirmado como listo para merge a `main`.

## Confirmacion en produccion

Salvador confirmo descarga exitosa del CV directamente en salvadoribarra.tech tras el merge del PR #3 a `main`. El fix de causa raiz (PDF agregado a git) queda cerrado y confirmado en el entorno real. Comienza a partir de aqui la ventana de medicion de 2 semanas definida en este experimento.

Pendiente unico: accion manual de Salvador en GA4 Admin para marcar 'tier1_contact_conversion' (EXP-002) y 'tier1_cv_download_conversion' (EXP-003) como Key Events -- fuera del alcance de este agente por gobernanza del proyecto (no se altera configuracion de analitica de forma autonoma).

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
Pendiente de deploy y medicion.

## Decision
Pendiente. Accion manual requerida de Salvador: marcar 'tier1_cv_download_conversion' como Key Event en GA4 Admin, distinto del Key Event de EXP-002.

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

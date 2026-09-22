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

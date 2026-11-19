# EXP-019 -- Eventos intermedios de analitica y bloque de autor al final de cada post

## Experiment ID
EXP-019 (origen: BL-018 y BL-019, auditoria estrategica 2026-11). Dos fases con aprobacion separada. **Esta rama implementa solo la fase A.**

## Observation
Con muy poco trafico real, la conversion Tier 1 seguira cerca de cero y no puede dar senal. Hoy no se mide ningun paso previo: el clic del boton principal del hero (EXP-001 nunca pudo medir su KPI), la apertura de la ventana del CV (EXP-003) ni la llegada a la seccion de contacto. Sin esos eventos no se puede evaluar la fase B (bloque de autor al final de cada post).

## Evidence
Revision critica de EXP-001 a EXP-003 y diagnostico de conversion de la auditoria (carpeta de auditoria, fuera de git). `Hero.astro`: el boton principal es un `mailto:` sin evento y el boton "Request CV" abre la ventana sin registrarlo. `Contact.astro` solo emite `tier1_contact_conversion` al enviar.

## Hypothesis
Si el sitio registra clics en el correo del hero, aperturas de la ventana del CV y llegadas a `#contact`, se obtiene una linea base propia de dos semanas con la que evaluar el bloque de la fase B, sin cambiar nada visible para el visitante.

## Target KPI
Existencia y disparo correcto, una vez por accion, de `mailto_click`, `cv_modal_open` y `contact_section_view`; `post_cta_click` queda listo (sin disparador hasta la fase B). Despues del merge: conteos de los tres eventos en GA4 durante dos semanas.

## Guardrail KPI
- `tier1_contact_conversion`, `tier1_cv_download_conversion` y `page_view` sin cambios.
- La exclusion de trafico propio de EXP-018 (`?internal=on`, `?no_ga=1`, user agent de Lighthouse) sigue sin enviar ningun hit con los eventos nuevos.
- Formularios de contacto y de CV, y el enlace `mailto:`, funcionan igual.
- Build sin errores, 0 enlaces rotos, sin errores de consola. Sin regresion de rendimiento (PSI con `no_ga=1`).

## Baseline
Los cuatro eventos no existen: 0 por construccion. Tier 1: 0 desde 2026-09-24. Trafico real estimado: unos 10 visitantes al mes.

## Proposed change (rama `feat/exp-019-fase-a-eventos`, fase A)
1. `src/components/Hero.astro`: `data-ga-event="mailto_click"` en el boton de correo y `data-ga-event="cv_modal_open"` en el boton "Request CV" (mas `data-ga-label`). Ningun otro cambio.
2. `src/components/GoogleAnalytics.astro`: un script inline que (a) escucha clics en cualquier elemento con `data-ga-event` y envia ese evento con `gtag('event', ...)` sin detener ni retrasar el clic, y (b) envia `contact_section_view` una vez por carga cuando `#contact` entra en pantalla (umbral 40 %). Todo dentro de `try/catch`. Parametros: `event_category: 'Engagement'`, `event_label`, `page_path`, `transport_type: 'beacon'`.
3. No se marcan como Key Events; es una decision de configuracion de Salvador en GA4 Admin si quiere (no recomendado: son intermedios).
Fase B (bloque de autor, texto aprobado el 2026-11-14) queda **fuera de esta rama** y no se despliega antes del cierre de EXP-016 (~2026-11-20) y de dos semanas de linea base.

## Pre-change commit hash
`a8d9615` (`main` local = `5725ffc` produccion + commit de documentacion de la auditoria, sin push).

## Risk
Bajo. Solo anade escuchas de eventos; un fallo de analitica queda atrapado y no rompe la pagina. Riesgo de medicion: con tan poco trafico, un solo visitante mueve la lectura; las decisiones se toman con criterios mecanicos. Un visitante que llegue a `#contact` por scroll rapido o por el ancla `/#contact` dispara `contact_section_view`: es lo esperado.

## Approval status
Fase A aprobada en concepto por Salvador el 2026-11-14. La implementacion sigue el flujo normal: Quality Gate, Deploy Preview y PR que Salvador fusiona. Fase B: texto aprobado, aprobacion de despliegue pendiente.

## Measurement window
Fase A: dos semanas de linea base tras el merge. Fase B: 6 a 8 semanas desde su despliegue.

## Decision criteria
Fase A: **KEEP** si los tres eventos se registran en GA4 (se comprueba con trafico de prueba sin la marca interna o en DebugView) y ningun guardrail esta en rojo; **REVERT** si un guardrail falla. La decision de la fase B esta en `06-experimentos-conversion-propuestos.md` (carpeta de auditoria).

## Cost in Netlify deploys
Un deploy de produccion (15 creditos). Dentro de la excepcion vigente hasta el 2026-11-18 o, despues, de la ampliada por Salvador el 2026-11-14 (hasta 2 por semana hasta el 2026-12-31).

## Quality Gate
2026-11-14, clon limpio de la rama `feat/exp-019-fase-a-eventos` (HEAD `192f166`) en la VM del equipo de Salvador, fuera de la carpeta del repo. `npm ci` y `npm run build`: sin errores, 162 paginas `index.html`, 3,390 enlaces internos y 0 rotos (comprobacion propia: cada `href` interno resuelve a un archivo del build).
- **Homepage construido:** `data-ga-event="mailto_click"` (1) y `data-ga-event="cv_modal_open"` (1); un solo `id="contact"`. Los tres scripts de analitica quedan en el `<head>` en el orden EXP-018 (exclusion), `gtag('config')`, EXP-019 (eventos).
- **Comportamiento en Chrome sin cabeza** (pagina de prueba con los tres scripts tal como salen del build, sin comentarios, y un correo ficticio; peticiones a Google interceptadas, nada llego a la propiedad real). Cada clic cuenta una vez (dos clics al correo, dos `mailto_click`), `cv_modal_open` una vez, `contact_section_view` **una sola vez** aunque se baje otra vez a la seccion, y 0 errores de consola.
- **Exclusion de trafico propio:** con `?no_ga=1` no se pide nada a Google; con la marca `?internal=on` (en la segunda carga, sin parametro) y con el user agent de Lighthouse `ga-disable-G-Q023R5XBS1` queda en `true` antes de los eventos. No pudo observarse a `gtag.js` real descartando los hits (estaba interceptado); es el mecanismo oficial que ya usan los eventos Tier 1 desde EXP-018.
- **Sincronizacion de LinkedIn** (commit aparte, sin tocar nada mas): `analisis-drive-test-diagnostico-red`, `handover-101-5g-handover-parameters` y `ntn-handover-terrestrial-ran-mobility`; cada boton "Discuss on LinkedIn" del HTML construido apunta a su URL nueva.
- **Pendiente para el Deploy Preview** (no verificable en local): recepcion real de los tres eventos en GA4 (DebugView o Realtime, sin la marca interna), consola sin errores en el preview, PSI con `no_ga=1` sin regresion y formularios de contacto y CV funcionando.
- **Deploy Preview #19 (2026-11-15, validado por Claude en el navegador integrado):** `?no_ga=1` no carga `gtag.js` y no hay peticiones a Google; los atributos `mailto_click` / `cv_modal_open` estan en el HTML y el clic en "Request CV" abre `#cv-request-modal`. Con `?internal=on` (segunda carga sin parametro) **`gtag.js` real cargado**, `mailto_click` y `cv_modal_open` en `dataLayer` y **0 peticiones a `/g/collect`**: la exclusion funciona con la libreria real. Consola sin errores. Los 3 posts sincronizados responden 200 con su URL `lnkd.in` nueva. Formularios `cv-request` y `contact` presentes (no se enviaron para no generar envios falsos).
- **`contact_section_view` en la pagina real:** no observable en el preview porque el panel del navegador estaba oculto y no renderizaba (IntersectionObserver no reporta sin render). Por layout, el umbral 0.4 si se alcanza: `#contact` mide 1,262 px en movil y 986 px en escritorio; proporcion maxima visible 0.51 (360x640), 0.64 (375x812), 0.78 (1366x768), 1.04 (768x1024), 1.10 (1920x1080). Riesgo residual: telefono en horizontal (~375 px de alto) no llega a 0.4. Se confirma en produccion con DebugView.
- **Incidente de medicion:** al limpiar la marca con `?internal=off` la carga quedo sin exclusion y envio **2 hits a GA4 con hostname `deploy-preview-19--stellular-strudel-c35baa.netlify.app`** (page_view y su acompanante). Filtrables por hostname; no afectan `salvadoribarra.tech`. Aprendizaje: la marca se quita con `localStorage.removeItem('sib_internal_traffic')` sin recargar, nunca con `?internal=off` como ultima navegacion.
- **Produccion (2026-11-15, merge `6964426`, PR #19; validado por Claude):** copia local = `origin/main`. Con la marca interna activa desde la primera carga: `gtag.js` real cargado, atributos `mailto_click` / `cv_modal_open` en el HTML, ambos eventos en `dataLayer`, modal de CV abre, consola sin errores y **0 peticiones a `/g/collect`**.
- **Recepcion en GA4 (prueba controlada, unica que envia datos):** 2026-11-15 17:08 UTC, exclusion desactivada solo en memoria, `debug_mode` y parametro `qa_run=claude-exp019-2026-11-15`; un clic a cada boton. Realtime (API de solo lectura) registro `mailto_click` 1 y `cv_modal_open` 1 con `event_label` correcto.
- **Hits de prueba a restar en la evaluacion de EXP-019:** (a) Deploy Preview, 2026-11-15 ~16:58 UTC, hostname `deploy-preview-19--stellular-strudel-c35baa.netlify.app`: page_view, first_visit, session_start y scroll de 1 usuario; (b) produccion, 2026-11-15 17:08-17:11 UTC, hostname `salvadoribarra.tech`, 1 usuario (navegador integrado de Claude), sin page_view: `mailto_click` 1, `cv_modal_open` 1, `contact_section_view` 1, `scroll` 1 (medicion mejorada) y `session_start` 1. Al evaluar, restar 1 a cada evento de (b) y excluir el hostname de (a).
- **`contact_section_view` en la pagina real (17:11 UTC):** con el panel visible (576x595), scroll gradual hasta `#contact` (1,166 px; proporcion maxima 0.51): el evento se disparo **una sola vez** aunque se volvio a bajar a la seccion, y Realtime lo registro. **Fase A validada de punta a punta; la linea base corre desde 2026-11-15.**

## Result
Pendiente de deploy.

## Decision
Pendiente.

## Learning
Pendiente.

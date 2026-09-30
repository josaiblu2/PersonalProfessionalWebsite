# EXP-013 -- CV publicado bajo un nombre estable: `Salvador_Ibarra_Luna_CV.pdf`

> **Clasificacion:** mantenimiento de bajo riesgo sobre el flujo de conversion de EXP-003. **No es un experimento de SEO/conversion**: no altera el modal, el formulario, la captura de email ni el evento GA4 `tier1_cv_download_conversion`. Se registra por trazabilidad y para fijar punto de rollback y protocolo de validacion sin contaminar KPIs.

## Experiment ID
EXP-013

## Observation
El CV se servia desde `/assets/cv/Salvador_Ibarra_Luna_CV_Master_v1_3.pdf`. El atributo `download="Salvador_Ibarra_Luna_CV.pdf"` ya existia, pero ese atributo no es garantia universal: si el PDF se abre en el visor del navegador (algunos navegadores moviles, enlace compartido, "abrir en pestana nueva") el nombre al guardar se toma de la URL, exponiendo el sufijo de version interna (`_Master_v1_3`).

## Evidence
- `src/components/Hero.astro`: `href` del enlace de respaldo y constante `CV_PDF_URL` apuntaban a `..._Master_v1_3.pdf`.
- Salvador genero hoy una nueva version del CV (7 paginas, perfil "Senior SON & RAN Automation Architect") y la coloco como `public/assets/cv/Salvador_Ibarra_Luna_CV.pdf` (md5 `e793b8e60f9d95465875e0243bfb988b`).

## Hypothesis
N/A (sin hipotesis causal sobre KPIs). Beneficio esperado: nombre de archivo profesional y consistente en todos los navegadores; URL estable que no cambia en futuras actualizaciones del CV (basta reemplazar el archivo).

## Target KPI
Ninguno. El evento Tier 1 se dispara ANTES de la descarga y no depende del nombre del archivo, por lo que la serie de `tier1_cv_download_conversion` (ventana formal desde 2026-09-22) no se ve afectada.

## Guardrail KPI
Cero regresion funcional del flujo CV: modal abre, envio a Netlify Forms OK, evento GA4 invocado, descarga automatica y enlace de respaldo entregan el PDF con el nombre correcto.

## Baseline
URL versionada `..._Master_v1_3.pdf` (CV de marzo 2026, 6 paginas).

## Proposed change (implementado en rama)
1. `public/assets/cv/Salvador_Ibarra_Luna_CV.pdf` agregado (nueva version del CV); `..._Master_v1_3.pdf` retirado del repo.
2. `src/components/Hero.astro`: 2 lineas (href de respaldo y `CV_PDF_URL`) apuntan a `/assets/cv/Salvador_Ibarra_Luna_CV.pdf`.
3. Nota: el cambio de contenido del CV (version nueva) viaja junto con el renombre por decision de Salvador; ambos son la misma unidad de mantenimiento.

## Pre-change commit hash
f6c9b14 (produccion actual, `origin/main`). Rollback: `git revert` de 67630ea o redeploy de f6c9b14 desde Netlify.

## Risk
Bajo. Riesgo residual: la URL antigua `..._Master_v1_3.pdf` pasa a responder 404 (hoy solo la referenciaba el propio modal; no hay enlaces internos a ella). Si se desea preservar enlaces externos/indexados, la opcion es un redirect 301 en configuracion de Netlify -- **fuera del alcance del agente** (infraestructura), requiere decision explicita de Salvador.

## Implementation reference
Rama `feat/cv-stable-filename`: 67630ea (CV + Hero.astro), e93e721 (sync linkedinUrl, v1.9), commit de este ledger. Smoke test reutilizable: `experiments/qa/cv-download-smoke.mjs`.

## Validacion realizada (2026-09-30) -- Quality Gate local-first, sin tocar KPIs
1. Build en **clon limpio** (`git clone` + `npm ci` + `npm run build`), dos veces (clon local de la rama y clon limpio de GitHub + patch): 144 paginas, exit 0.
2. `dist/`: solo existe `assets/cv/Salvador_Ibarra_Luna_CV.pdf` (md5 identico); 0 referencias a `Master_v1_3`; 3290 referencias internas verificadas, 0 rotas.
3. E2E Playwright sobre `dist/` servido localmente (`cv-download-smoke.mjs`), 10/10 PASS: descarga automatica y enlace de respaldo -> `Salvador_Ibarra_Luna_CV.pdf`, contenido md5 correcto, POST `form-name=cv-request` con email, evento `tier1_cv_download_conversion` invocado, URL nueva 200 `application/pdf`, URL antigua 404, sin errores de consola.
4. **Aislamiento de metricas**: toda peticion externa bloqueada en la prueba (googletagmanager.com, fonts) -> GA4 no recibio page_view ni evento; el POST de Netlify Forms se respondio localmente -> 0 leads de prueba en Netlify.
5. LinkedIn sync (v1.9): los 3 `linkedinUrl` presentes en el HTML de `vonr5gsa`, `ai-ran-where-adds-value`, `son-is-not-dead`.

## Protocolo de validacion post-deploy (sin contaminar GA4 / Netlify Forms / Search Console)
1. Verificaciones HTTP sin JavaScript (curl): `GET /` contiene `/assets/cv/Salvador_Ibarra_Luna_CV.pdf`; `HEAD` del PDF = 200 `application/pdf`. Sin JS no se ejecuta gtag -> 0 hits GA4.
2. `BASE=https://salvadoribarra.tech node experiments/qa/cv-download-smoke.mjs`: mismo E2E contra produccion con GA4 bloqueado y POST simulado -> 0 eventos, 0 leads.
3. Si Salvador prueba manualmente en su navegador: abrir directamente la URL del PDF (no pasa por el modal ni dispara el evento) o, si quiere probar el modal, ejecutar antes en consola `window['ga-disable-G-Q023R5XBS1'] = true` y NO enviar el formulario con un email real; si llegara a enviarse, marcar la entrada como spam/eliminarla en Netlify Forms.
4. Control: en el siguiente review, comparar `tier1_cv_download_conversion` vs. entradas del formulario `cv-request` en Netlify; deben coincidir (sin eventos "fantasma" de pruebas).

## Approval status
Solicitado explicitamente por Salvador (2026-09-30). Pendiente: push de la rama, revision del Deploy Preview y merge por Salvador.

## Measurement window
N/A (sin KPI).

## Result
Pendiente de deploy.

## Decision
Pendiente.

## Learning
Un cambio "cosmetico" sobre un flujo de conversion se puede validar end-to-end sin tocar las metricas: bloquear el trafico a GA4 y simular el endpoint de Netlify Forms en el navegador de prueba aisla por completo la validacion de los KPIs de produccion.

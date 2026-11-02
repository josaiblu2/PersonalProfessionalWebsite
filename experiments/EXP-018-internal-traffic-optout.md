# EXP-018 -- Excluir el trafico propio de GA4 (interruptor `?internal=on`) y las visitas de Lighthouse

## Experiment ID
EXP-018 (origen: BL-014)

## Observation
Salvador visita su propio sitio para verificar cambios (ej. 2026-10-23, `data-in-ran/` tras EXP-016) y esas visitas cuentan en GA4 como trafico normal. Con un volumen muy bajo (desde 2026-10-17 solo 2 `page_view` / 2 `session_start`), unas pocas visitas propias distorsionan los KPI de contexto y, si prueba formularios, contaminarian el KPI Tier 1.

## Evidence
Ver BL-014. `src/components/GoogleAnalytics.astro` (antes del cambio) ejecutaba `gtag('config', 'G-Q023R5XBS1')` sin ninguna exclusion. Ademas, el checkpoint semanal corre ~4 mediciones de PageSpeed/Lighthouse por semana contra el homepage; no esta verificado si GA4 las registra.

## Hypothesis
Si un navegador marcado (`?internal=on`, marca en `localStorage`) y el user agent de Lighthouse/PageSpeed activan `ga-disable-G-Q023R5XBS1` antes de `gtag('config')`, esos navegadores no enviaran ningun hit a GA4, sin cambiar la medicion de los visitantes reales.

## Target KPI
Tecnico: 0 peticiones a `google-analytics.com/g/collect` desde un navegador marcado o con UA de Lighthouse; visitantes sin marca con `page_view` y eventos Tier 1 igual que antes.

## Guardrail KPI
- Visitantes reales: `page_view`, `tier1_contact_conversion` y `tier1_cv_download_conversion` sin cambios.
- Formularios de contacto y CV funcionan igual con y sin marca (no esperan respuesta de GA4).
- Sin errores de JavaScript; GTM sigue `async` (EXP-008).

## Approval status
Metodo (opcion 1b de BL-014 + exclusion de Lighthouse) aprobado explicitamente por Salvador el 2026-10-23 (cambio de configuracion de analitica); implementacion pedida el 2026-10-24.

## Proposed change (rama `feat/internal-traffic-optout`)
`src/components/GoogleAnalytics.astro`: nuevo script inline ANTES de la etiqueta de `gtag.js`:
1. `?internal=on` guarda `sib_internal_traffic=1` en `localStorage`; `?internal=off` lo borra. El parametro se elimina de la URL con `history.replaceState` (conserva otros parametros y el `#`).
2. Con la marca, o con user agent que contenga `Chrome-Lighthouse` / `Google Page Speed Insights`, se define `window['ga-disable-G-Q023R5XBS1'] = true`.
3. Al activar/desactivar se muestra un aviso breve (5 s) y un `console.info`, para confirmarlo tambien en el celular.
4. Si `localStorage` no esta disponible (navegador restringido), GA4 se comporta como siempre.
- **No se toca:** `gtag('config')`, `Contact.astro`, `Hero.astro`, ID de medicion, `async` de GTM.

## Quality Gate (2026-10-24, clon limpio en la nube)
`origin/main` 70ed7f0 + 4 commits locales como parches: `npm run build` 150 paginas, 0 errores. En las 150 paginas con GA4 el orden es marca -> `gtag.js` -> `gtag('config')`.
Pruebas en Chromium headless con `astro preview`, sustituyendo `gtag.js` por un stub local que replica la regla documentada de Google (no envia si `ga-disable-<ID>` esta activo) y respondiendo localmente a `/g/collect` (ningun hit llego a la propiedad real):
| Escenario | Hits a `/g/collect` | Otros resultados |
|---|---|---|
| A. Visitante normal, `data-in-ran/` | `page_view` | -- |
| E1. Visitante normal envia el formulario de contacto | `tier1_contact_conversion` | POST a `/success/` |
| B. `/?internal=on` | ninguno | marca guardada, URL limpia, aviso "GA4 desactivado en este navegador" |
| B2. Misma sesion, otra pagina sin parametro | ninguno | sin aviso |
| E2. Con marca, envia el formulario de contacto | ninguno | POST a `/success/` (formulario intacto) |
| C. `/?internal=off` | `page_view` | marca borrada, aviso "GA4 reactivado" |
| D. User agent de Lighthouse | ninguno | -- |
| F. `/insights/?utm_source=linkedin&internal=on#x` | -- | URL final `/insights/?utm_source=linkedin#x` |
0 errores de JavaScript en todos los escenarios.
Limite: el stub replica el comportamiento documentado de `ga-disable`; la verificacion con el `gtag.js` real se hace en produccion con la marca activa (debe haber 0 peticiones a `/g/collect`), lo que no genera hits.

## Deploy Preview #15 (2026-10-24, PR #15)
URL: https://deploy-preview-15--stellular-strudel-c35baa.netlify.app. Navegador integrado del equipo de Salvador. Para no arriesgar ningun hit, la marca se puso primero en `localStorage` desde una pestana de `sitemap-index.xml` (sin GA4) y solo despues se cargaron paginas con GA4.
1. Sitemap 150 URLs, las 150 en 200; en las 150 el orden es marca -> `gtag.js` (async) -> `gtag('config')`. 158 enlaces internos, 0 rotos. Formularios `cv-request` y `contact` presentes, eventos Tier 1 en el HTML, CV 200.
2. **Con el `gtag.js` real de Google:** `/insights/data-in-ran/?internal=on` -> aviso "GA4 desactivado en este navegador (trafico interno)." visible, `console.info` `[BL-014]`, URL final sin el parametro, `window['ga-disable-G-Q023R5XBS1'] === true`, `gtag.js` cargado, `gtag` definida y **0 peticiones a google-analytics.com / `/g/collect`**.
3. Homepage con la marca, con scroll de toda la pagina y 4 s de espera (medicion mejorada de GA4): 0 peticiones a `/g/collect`, sin aviso (correcto: solo aparece al cambiar la marca), 0 errores de consola.
No se probo el caso "sin marca" con el `gtag.js` real para no generar hits; ese camino no cambia respecto a produccion (la marca solo agrega `ga-disable`), y se cubrio con el stub en el Quality Gate.
Resultado: listo para merge.

## Result
Fusionado a `main` via PR #15 (merge commit `3159af4`, 2026-10-24 noche, hora CDMX); deploy en verde segun Salvador. Dentro de la excepcion de creditos (2026-10-19 a 2026-11-18).
**Activacion por Salvador (2026-10-24):** entro a `https://salvadoribarra.tech/?internal=on` desde los navegadores de su computadora y de su celular; en todos vio el aviso "GA4 desactivado en este navegador". Desde ese momento sus visitas en esos navegadores no cuentan en GA4.
**Verificacion en produccion (2026-10-25, navegador integrado del agente; marca puesta primero desde `sitemap-index.xml`):** sitemap 150 URLs, las 150 en 200 y con el orden marca -> `gtag.js` -> `config`; `/success/` y CV 200. Homepage con `?internal=on`: aviso en consola `[BL-014]`, URL limpia, `ga-disable` activo, `gtag.js` real cargado, recorrido completo con scroll y 4 s de espera: **0 peticiones a `/g/collect`**. El navegador integrado del agente queda marcado como trafico interno en salvadoribarra.tech.
Corte de datos: a partir del 2026-10-24 (noche, CDMX) los conteos de GA4 excluyen las visitas de Salvador en sus navegadores marcados y las de Lighthouse/PageSpeed; los conteos anteriores pueden incluirlas (no se pueden separar retroactivamente).

## Decision
**KEEP (tecnico, 2026-10-25).** Cumple el KPI tecnico (0 hits desde navegadores marcados, con el `gtag.js` real) sin cambiar la medicion de visitantes reales ni los formularios.
**Iteracion abierta 2026-11-02 (ITERATE):** `?no_ga=1` para las mediciones de PageSpeed Insights, porque el user agent de PSI ya no contiene `Chrome-Lighthouse`. Ver la seccion "Iteracion 2026-11-02" al final.

## Learning
1. La marca vive en `localStorage` por sitio y por navegador: se pierde al borrar datos del sitio, no aplica en incognito y hay que activarla en cada navegador o dispositivo nuevo. Comprobacion: volver a entrar con `?internal=on` (el aviso solo aparece al cambiar la marca).
2. Validar cambios de analitica sin contaminar la propiedad: poner la marca desde una pagina sin GA4 del mismo origen antes de cargar paginas con GA4; el caso "sin marca" se prueba con un stub local de `gtag.js`.
3. Los envios de formularios de prueba siguen llegando a Netlify Forms aunque GA4 no los registre: las pruebas de formulario se hacen en Deploy Preview.


## Iteracion 2026-11-02 -- `?no_ga=1` para las mediciones de PageSpeed Insights (ITERATE en curso)

**Origen:** Reporte-SEO-2026-10-30 (checkpoint semanal, hallazgo "EXP-018"). Se registra como iteracion de este experimento, por instruccion de Salvador; la decision KEEP del 2026-10-25 sigue vigente para el interruptor `?internal=on/off`.

**Observation:** En las 4 corridas de PSI del 2026-10-30 (Lighthouse 13.6.0), el user agent de red fue `Mozilla/5.0 (Linux; Android 11; moto g power (2022)) ... Chrome/153 Mobile Safari` (host `HeadlessChrome`), sin el token `Chrome-Lighthouse`. El filtro `/Chrome-Lighthouse|Google Page Speed Insights/` de `GoogleAnalytics.astro` no lo detecta: `gtag.js` cargo y `g/collect` respondio 204 en las 4 corridas.

**Hypothesis:** Si nuestras mediciones de PSI piden la URL con `?no_ga=1` y el sitio, al ver ese parametro, no descarga `gtag.js`, esas corridas no pueden generar ningun hit en GA4, sin importar el user agent que use PSI.

**Target KPI:** Tecnico: 0 descargas de `gtag.js` y 0 peticiones a `/g/collect` en una carga con `?no_ga=1`; sin el parametro, comportamiento identico al actual.

**Guardrail KPI:** `page_view`, `tier1_contact_conversion` y `tier1_cv_download_conversion` de visitantes reales sin cambios; formularios y CV funcionan con y sin el parametro; GTM sigue sin bloquear el render (EXP-008); 0 errores de JavaScript.

**Approval status:** Cambio de configuracion de analitica pedido explicitamente por Salvador (sesion del 2026-10-30 / 2026-11-02, puntos 1-3). El merge y el deploy siguen siendo decision suya.

**Pre-change commit (rollback point):** `e222474` (main local) / `cb8ec01` (origin/main, produccion).

**Proposed change (rama `feat/psi-no-ga`, commit `b19b21e`, sin push):** solo `src/components/GoogleAnalytics.astro` (+17/-1 lineas):
1. El script inicial (el de `?internal=on/off` y el filtro de Lighthouse, sin cambios) ahora tambien lee `no_ga`: si vale `1`, activa `ga-disable-G-Q023R5XBS1` y guarda `window.__sibNoGa = true`. No se guarda marca: aplica solo a esa carga de pagina, y la URL no se modifica.
2. La etiqueta estatica `<script async src=".../gtag/js?id=G-Q023R5XBS1">` se sustituye por una insercion dinamica (`document.createElement('script')`, `async = true`) despues de `gtag('config')`, y solo si `__sibNoGa` no esta activo. Un script insertado dinamicamente es asincrono por definicion, asi que se conserva el no-bloqueo de EXP-008. `dataLayer`, `gtag()`, `gtag('js')` y `gtag('config')` no cambian: los eventos Tier 1 siguen llamando a una `gtag()` definida, y con `no_ga=1` solo se encolan localmente.
- Script de medicion (fuera del repo): `get_pagespeed_report(..., no_ga=True)` en `analytics_readonly.py` (carpeta de credenciales y documento del Proyecto) agrega `no_ga=1` a la URL por defecto, respetando los parametros y el `#` existentes, y sin duplicarlo. `summarize_pagespeed_report()` agrega `requestedUrl`, `fetchTime` y `lighthouseVersion`. Documentado en `claude/pagespeed-insights-readonly-access.md`.

**Quality Gate (2026-11-02, clon limpio de `feat/psi-no-ga` en el equipo de Salvador):** `npm ci` + `npm run build` en verde, 0 errores; 154 HTML (153 paginas con GA4 + `forms.html`). En las 153: orden `internal`/Lighthouse -> `no_ga` -> `gtag('config')` -> insercion de `gtag.js`, y 0 etiquetas estaticas de GTM. 3,196 enlaces internos, 0 rotos, 0 sin `/`.
Las pruebas en Chromium headless se hicieron con un servidor local y un stub de `gtag.js` que respeta `ga-disable`. `googletagmanager.com` y `google-analytics.com` estaban interceptados, asi que ningun hit llego a la propiedad real.
| Escenario | Descargas de `gtag.js` | Hits | Otros |
|---|---|---|---|
| A. Visitante normal, `/` | 1 (async) | `page_view` | -- |
| B. `/?no_ga=1` | 0 | ninguno | `ga-disable` activo, `gtag()` definida, URL intacta |
| B2. `/insights/data-in-ran/?utm_source=linkedin&no_ga=1#x` | 0 | ninguno | URL intacta |
| B3. `/?no_ga=0` | 1 | `page_view` | solo `1` desactiva |
| C. `/?no_ga=1` y despues `/insights/` sin parametro | 1 (segunda pagina) | `page_view` | no persiste |
| D. UA con `Chrome-Lighthouse` (regla existente) | 1 | ninguno | sin cambio |
| D2. UA de PSI sin token, sin `no_ga` (hueco del 10-30) | 1 | `page_view` | reproduce el hallazgo |
| D3. UA de PSI sin token + `?no_ga=1` | 0 | ninguno | hueco cubierto |
| E. `?internal=on` y otra pagina (regla existente) | 2 | ninguno | sin cambio |
| F1. Formulario de contacto, visitante normal | 2 | `page_view`, `tier1_contact_conversion`, `page_view` (`/success/`) | POST a `/success/` |
| F2. Formulario de contacto con `?no_ga=1` | 1 (`/success/`) | `page_view` de `/success/` | sin evento Tier 1; POST intacto |
| G1. Descarga de CV, visitante normal | 1 | `page_view`, `tier1_cv_download_conversion` | vista de exito visible |
| G2. Descarga de CV con `?no_ga=1` | 0 | ninguno | vista de exito visible |
0 errores de JavaScript en todos los escenarios. Limite: el stub replica el comportamiento documentado de `ga-disable`. En produccion, el caso `?no_ga=1` se verifica con el `gtag.js` real: debe haber 0 peticiones a `googletagmanager.com` y a `/g/collect`, lo que tampoco genera hits.

**Linea base corregida de GA4 (consulta de solo lectura, 2026-11-02; `dateHourMinute` en hora CDMX, la zona de la propiedad):**
Ventana 2026-09-24 a 2026-10-31: **122 `page_view` / 63 `session_start`**. Ventanas de PSI cotejadas (UTC-6):
| Corridas de PSI | Ventana CDMX | Hits en GA4 con perfil PSI (Android/moto g, movil, EE.UU.) |
|---|---|---|
| Checkpoint 2026-10-16 (2 corridas del checkpoint, ~20:11Z y ~20:34Z; mobile + desktop) | 14:00-14:50 | 0 |
| EXP-015 post-deploy 2026-10-16 (mobile 21:47/21:49/21:51Z + 2 desktop) | 15:40-16:00 | 0. En el mismo minuto hay 4 hits (15:50-15:51), pero son del navegador de Salvador (Windows 11, 1536x960, Chrome 153.0.8010.54, es-MX): la verificacion de EXP-015 en produccion (~15:45 CDMX) |
| Checkpoint 2026-10-23 (3 mobile + 1 desktop, ~20:1xZ) | 13:55-14:30 | 0 |
| Checkpoint 2026-10-30 (mobile 20:10:20Z, 20:11:36Z, 20:12:51Z + 1 desktop) | 13:55-14:30 | 0 (re-verificado el 2026-11-02, ya con los datos procesados) |
En todo el periodo no hay ningun hit con dispositivo Android 11 / moto g ni con perfil movil de EE.UU. que coincida con PSI.
**Correccion por PSI = 0 `page_view` / 0 `session_start`.** Las corridas del 10-16 y del 10-23 ocurrieron cuando el sitio aun no tenia ningun filtro y `gtag.js` cargaba sin restriccion, y aun asi no aparecen en GA4. Lo mas probable es que GA4 ya descartaba esos hits (exclusion automatica de bots conocidos). `g/collect` 204 no implica que el hit se registre. Con eso, `no_ga=1` queda como defensa en profundidad e independencia del user agent de PSI, no como correccion de un sesgo medido.
Desglose heuristico de los 122/63 (por huella de dispositivo, solo como contexto; no es un filtro aplicado):
| Grupo | page_view | session_start | Criterio |
|---|---|---|---|
| Trafico propio de Salvador (antes del corte del 2026-10-24) | 88 | 32 | Cuautitlan Izcalli / Ecatepec / Ojo de Agua, o Mexico + Direct + Chrome 152.0.7977 / 153.0.8010 |
| Sospechoso de centro de datos (no es PSI) | 9 | 8 | EE.UU., Direct, homepage, UA reducido `x.0.0.0`: San Jose 10-10 y 10-27 (x3), 10-30 12:36 (4/3), The Dalles 10-31 |
| Resto (probables visitantes reales) | 25 | 23 | incluye 10-14 (EE.UU., Chrome 142, 4/2), tambien dudoso |
Lectura: ~72% de los `page_view` del periodo son trafico propio anterior a EXP-018. El ruido automatizado que queda (centros de datos con UA reducido) no viene de PSI y `no_ga=1` no lo filtra; candidato a un BL aparte si se quiere atacar (p. ej. filtro de bots/IP en GA4, que se configura en la interfaz).

**Pendiente:**
1. Salvador: push de `feat/psi-no-ga`, Deploy Preview y merge. Dentro de la excepcion de creditos (2026-10-19 a 2026-11-18). Puede viajar en el mismo deploy que la tanda de contenido del lunes 2026-11-02.
2. Verificacion en produccion con el `gtag.js` real: `/?no_ga=1` -> 0 peticiones a `googletagmanager.com` y `/g/collect`; sin el parametro, `gtag.js` async cargado.
3. **Medicion puente** (primera corrida despues del merge): homepage mobile, 3 corridas con `no_ga=1` y 3 sin el, registradas en `claude/pagespeed-insights-readonly-access.md`. Desde entonces la serie de PSI usa `no_ga=1`.
4. Checkpoint semanal: actualizar su prompt (v7) para usar `get_pagespeed_report()` con `no_ga=True` y registrar `lighthouseVersion`. El prompt se cambia en la sesion del merge.
5. Decision de esta iteracion: KEEP tecnico si el punto 2 pasa.

**Deploy Preview #17 (2026-11-02, PR #17, rama `feat/psi-no-ga` en `8374897`; incluye la tanda de contenido 2026-11-02 y 2 syncs de LinkedIn).** Navegador integrado del equipo de Salvador, con el `gtag.js` real de Google:
1. Sitemap con 156 URLs: las 156 en 200 sin redireccion, todas con el orden `internal`/Lighthouse -> `no_ga` -> `config` -> insercion de `gtag.js` y 0 etiquetas estaticas de GTM. 164 enlaces internos unicos, 0 rotos. `/success/` 200.
2. **`/?no_ga=1` SIN la marca interna** (marca borrada a proposito para probar `no_ga` de forma aislada): `ga-disable` activo, `__sibNoGa` true, `gtag()` definida, **0 peticiones a `googletagmanager.com` y 0 a `/g/collect`** tras scroll completo y 4 s de espera. 0 errores de consola.
3. Marca interna restablecida desde esa misma pagina (sin GA4 cargado). Despues, `/` sin parametro: `gtag.js` cargado (1 peticion, script `async`), `google_tag_manager` presente y 0 peticiones a `/g/collect` (por la marca). Formularios `cv-request` y `contact` y el disparador del CV presentes. 0 errores de consola.
4. Posts nuevos (`5g-pci-planning`, `ai-ran-data-quality`, `rsrp-5g-experiencia-usuario`): portada y `og:image` en 200 y primeros en el listado. LinkedIn correcto en `link-budget-uplink-5g` (`lnkd.in/p/edRUPgay`) y `ran-digital-twin-autonomous-networks` (`lnkd.in/p/eHPaSPbm`).
Resultado: listo para merge.

**Resultado de la iteracion (2026-11-02).** PR #17 fusionado por Salvador (merge `a80b6ac`, deploy en verde confirmado por Salvador a las 09:35 CDMX). Deploy dentro de la excepcion de creditos (2026-10-19 a 2026-11-18); salio junto con la tanda de contenido de la semana (15 creditos en total).
**Verificacion en produccion** (navegador integrado, con la marca interna activa):
- Sitemap: 156 URLs, todas en 200, sin redireccion y con el orden correcto. 0 etiquetas estaticas de GTM. 164 enlaces internos unicos, 0 rotos. Los 3 posts nuevos estan publicados. `/success/` y el CV (`/assets/cv/Salvador_Ibarra_Luna_CV.pdf`) responden 200. La forma sin `/` redirige.
- `/?no_ga=1`: 0 peticiones a `googletagmanager.com` y 0 a `/g/collect`; `gtag()` definida.
- `/` sin el parametro: `gtag.js` real cargado una vez, `async`. Formularios presentes, 174 recursos propios sin 4xx y 0 imagenes rotas.
**Sitemap reenviado:** `lastSubmitted` 2026-11-02T15:36:32Z, 0 errores, 0 advertencias, `isPending` true (Google aun reporta 153 URLs de su descarga anterior).
**Medicion puente de PSI** (homepage, mobile, Lighthouse 13.6.0, 6 corridas intercaladas y separadas por mas de 60 s; mediana de 3 por serie):
| Metrica | Sin `no_ga` (serie vieja) | Con `no_ga=1` (serie nueva) |
|---|---|---|
| Score | 98 (95, 98, 98) | 98 (99, 98, 98) |
| LCP | 0.93 s | 0.94 s |
| FCP | 0.93 s | 0.94 s |
| TBT | 65 ms (202, 16, 65) | 0 ms (0, 9, 0) |
| CLS | 0 | 0 |
| Speed Index | 4.13 s | 3.79 s |
| Peticiones a GTM / `g/collect` en el log de red de Lighthouse | 1 / 1 en cada corrida | 0 / 0 en cada corrida |
`fetchTime` de las corridas sin `no_ga` (pueden haber enviado hits): 15:37:53Z, 15:40:29Z y 15:42:59Z (09:37-09:43 CDMX). Las corridas con `no_ga=1` fueron a las 15:36:35Z, 15:39:12Z y 15:41:44Z.
Lectura: quitar `gtag.js` no cambia el score ni el LCP. Si baja el TBT (unos 65 ms de mediana, y elimina el pico de 200 ms) y el Speed Index (unos 0.34 s). Desde hoy la serie de PSI se mide con `no_ga=1`; para comparar contra mediciones anteriores, se suma esa diferencia o se usa esta tabla.
El log de red de PSI confirma, ademas, que sin el parametro la corrida si envia `g/collect`. Verificar en GA4 el 2026-11-03 si esas 3 corridas aparecen: perfil Android/moto g, EE.UU., homepage, 09:37-09:43 CDMX.

## Decision (iteracion 2026-11-02)
**KEEP (tecnico).** Cumple el KPI tecnico en produccion: 0 peticiones a GTM y a `/g/collect` con `?no_ga=1`, tanto en el navegador como dentro de la propia corrida de PSI, sin cambios para los visitantes reales ni en los formularios.
**Learning:** (1) No hay que confiar en que el user agent de Lighthouse/PSI se mantenga estable. Un parametro que controlamos (`no_ga=1`) no depende de ese user agent. (2) Que `g/collect` responda 204 no significa que GA4 registre el hit: antes de corregir una linea base hay que cruzar con los datos (aqui la correccion fue 0). (3) Medir sin `gtag.js` cambia sobre todo el TBT y el Speed Index; por eso se documento el puente antes de cambiar la serie.
**Pendiente:** confirmar en GA4 las 3 corridas puente sin `no_ga` (2026-11-03). Actualizar el prompt del checkpoint semanal: el script ya usa `no_ga=1` por defecto, pero el prompt debe registrar `lighthouseVersion` y advertir el cambio de serie del 2026-11-02 al comparar.

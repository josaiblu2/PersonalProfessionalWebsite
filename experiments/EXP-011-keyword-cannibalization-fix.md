# EXP-011 -- Diferenciacion y enlazado interno entre posts canibalizados (BL-009)

## Experiment ID
EXP-011

## Observation
Dos pares de posts de Insights compiten entre si por las mismas queries de alto valor en Search Console, en vez de que un solo post concentre la senal de relevancia para cada tema.

## Evidence
Search Console (`dimensions=["query","page"]`, 2026-06-21 a 2026-09-21): (1) "ran monitoring" -- `data-in-ran` (154 impr., pos. 84.4) y `ai-ran-where-adds-value` (105 impr., pos. 78.9); "ran analytics" -- `data-in-ran` (113 impr., pos. 70.0) y `ai-ran-where-adds-value` (27 impr., pos. 92.9). Total combinado: data-in-ran 267 impresiones, ai-ran-where-adds-value 132. (2) "network slicing automation" -- `network-slicing-automation` (92 impr., pos. 47.5, la mejor posicion de toda la auditoria) y `networkslicing` (35 impr., pos. 81.9). `networkslicing` tiene ademas su propia fortaleza sin competencia en "network slicing market" (255 impresiones). Registrado como **BL-009** en `experiments/BACKLOG.md`.

## Hypothesis
Diferenciar explicitamente el angulo de contenido de cada post del par (reforzandolo en su meta description) y enlazarlos entre si con anchor text relacionado ayudara a Google a entender que son paginas complementarias, no competidoras por la misma query -- consolidando gradualmente la senal de relevancia en la pagina primaria de cada tema.

## Target KPI
Search Console: posicion e impresiones de `data-in-ran` en "ran monitoring"/"ran analytics", y de `network-slicing-automation` en "network slicing automation", no deben empeorar, e idealmente deben consolidarse (menos dispersion hacia el post secundario del par) en las semanas posteriores al deploy.

## Guardrail KPI
Cero regresion: el build debe seguir generando 144 paginas sin errores; ningun titulo, H1 ni contenido existente del cuerpo de los 4 posts se modifica (solo frontmatter `description` y una frase de enlace al final); no se toca ningun flujo de conversion.

## Baseline
`data-in-ran`: description generica sin mencionar "monitoring"/"analytics" explicitamente. `ai-ran-where-adds-value`: description que rozaba el overlap ("network performance management"); bullet interno prometia un post futuro sobre calidad de datos sin enlazarlo. `networkslicing`: description truncada/generica que no reflejaba su angulo comercial real. `network-slicing-automation`: sin enlace hacia el post hermano de modelo comercial. Cero enlaces internos entre los 4 posts.

## Proposed change (implementado)
1. `data-in-ran/index.md`: description reescrita para nombrar explicitamente "RAN monitoring" y "RAN analytics", consistente con el contenido real del post (calidad/relevancia de datos).
2. `ai-ran-where-adds-value/index.md`: description reescrita hacia su angulo propio (valor operativo de la IA, mas alla de dashboards de monitoreo); el bullet "Why data quality matters more than models" ahora enlaza a `/insights/data-in-ran`.
3. `networkslicing/index.md` (fisicamente `src/content/insights/NetworkSlicing/`, el slug se genera en minusculas): description reescrita para nombrar explicitamente el angulo comercial/"network slicing market"; se agrego un enlace de cierre hacia `/insights/network-slicing-automation`.
4. `network-slicing-automation/index.md`: se agrego un enlace reciproco de cierre hacia `/insights/networkslicing`.

Deliberadamente fuera de alcance: ningun titulo, H1 ni parrafo del cuerpo existente se reescribe -- el cambio se limita a frontmatter y una frase de enlace por post, para no alterar el posicionamiento ya logrado ni las afirmaciones profesionales del contenido (Causal Discipline).

## Pre-change commit hash
8757aad (merge de PR #6 / EXP-008+EXP-009 a main) -- implementado en la misma rama que EXP-010 (`feat/canonical-trailing-slash`), a peticion explicita de Salvador de agrupar BL-008 y BL-009 en un mismo push/PR/merge.

## Risk
Bajo. Cambios acotados a metadatos (meta description, usada por buscadores pero no visible en el cuerpo del articulo) y a una frase de enlace agregada al final de cada post, sin tocar contenido existente, titulos ni H1.

## Implementation reference
Rama: `feat/canonical-trailing-slash`. Archivos: `src/content/insights/data-in-ran/index.md`, `src/content/insights/ai-ran-where-adds-value/index.md`, `src/content/insights/NetworkSlicing/index.md`, `src/content/insights/network-slicing-automation/index.md`.

## Validacion realizada (2026-09-24)
1. Build local exitoso: 144 paginas construidas sin errores (mismo conteo que el baseline).
2. Verificados en el HTML generado los 4 enlaces internos nuevos, renderizando correctamente como `<a href="/insights/...">`.
3. Verificadas las 3 meta descriptions actualizadas en el HTML generado de `data-in-ran`, `ai-ran-where-adds-value` y `networkslicing`.
4. Pendiente: validacion visual en Deploy Preview (junto con EXP-010) y monitoreo de Search Console tras el despliegue.

## Approval status
BL-009 propuesto por el agente (diferenciacion de angulo + enlace secundario->primario) y aprobado explicitamente por Salvador el 2026-09-24 ("ok, procede con tu sugerencia. Adelante"), para implementarse junto con BL-008/EXP-010 en el mismo PR y push.

## Measurement window
2-4 semanas tras el despliegue y el recrawleo de Google, junto con el mismo periodo de EXP-010.

## Result
Fusionado a `main` via PR #7 (merge commit `6c07776`) junto con EXP-010, confirmado en produccion el 2026-09-24. Verificado en vivo en salvadoribarra.tech: el enlace `data-in-ran` visible en `ai-ran-where-adds-value` (`href="/insights/data-in-ran"`) y el enlace `network-slicing-automation` visible en `networkslicing` (`href="/insights/network-slicing-automation"`) renderizan correctamente en produccion. Resultado tecnico: exitoso y sin regresiones. Resultado de negocio (consolidacion de posicion/impresiones en los pares canibalizados): pendiente del periodo de medicion -- proxima revision estimada ~2026-10-08 a 2026-10-22.

## Decision
KEEP. Sujeto a confirmacion en el proximo corte de Search Console: si pasadas 2-4 semanas `data-in-ran` y `network-slicing-automation` no muestran mejora de posicion/consolidacion frente a sus pares, reevaluar si la diferenciacion de angulo fue suficiente o si se requiere expandir contenido (ver BL-011, thin content) ademas del enlazado.

## Learning
El diagnostico de canibalizacion (cruzar dimensiones `query`+`page` de Search Console) y la correccion (diferenciar meta description + enlace direccional secundario->primario) resultaron en un cambio de bajo riesgo y alta reutilizacion: el mismo patron aplica a cualquier otro par de posts del catalogo de 141 que compita por la misma query, sin necesidad de tocar codigo de infraestructura.

# EXP-016 -- Ampliar `data-in-ran` con foco en "RAN monitoring" (profundidad de contenido)

## Experiment ID
EXP-016 (origen: BL-011; seguimiento del par RAN de EXP-011)

## Observation
Tras 4 semanas de EXP-011 (PR #7, 2026-09-24; ventana cumplida 2026-10-22), el par RAN no consolido: en "ran monitoring" `data-in-ran` sigue sin aparecer y la query la conserva `ai-ran-where-adds-value`. Se cumple el criterio de Decision de EXP-011 para evaluar BL-011 (Work Project Instructions v1.25).

## Evidence
Checkpoint semanal 2026-10-23 (Search Console, datos hasta 2026-10-21; detalle en EXP-011):
- "ran monitoring": solo `ai-ran-where-adds-value/` 36 impr., pos. 83.4 (2026-09-25 a 10-21); `data-in-ran` no aparece (baseline 3 meses: 154 impr., pos. 84.4).
- "ran analytics": `data-in-ran/` 20 impr., pos. 71.1 vs. `ai-ran-where-adds-value/` 13 impr., pos. 56.3 (acumulado); ultima semana `data-in-ran/` 8 impr., pos. 73.0 vs. 3 impr., pos. 89.0 (n=11, insuficiente).
- Contenido: `data-in-ran` tenia 422 palabras (`wc -w`), sin H2/H3 y con titulo que no menciona "monitoring" (BL-011, BL-010).

## Hypothesis
Si `data-in-ran` cubre el tema de RAN monitoring en profundidad (~1,050 palabras de cuerpo con H2/H3 sobre monitoreo vs. observabilidad vs. analitica, pilares PM/CM/FM, modos de falla, calidad de datos, IA y SMO) y su titulo/descripcion declaran "RAN monitoring" de forma explicita, Google la tratara como mejor respuesta que `ai-ran-where-adds-value` para "ran monitoring" y reforzara su posicion en "ran analytics", sin canibalizar al otro post (que conserva el angulo de valor de la IA y recibe un enlace interno).

## Target KPI
Search Console (`dimensions=["query","page"]`), 4 semanas post-deploy: (1) `data-in-ran/` aparece con impresiones para "ran monitoring" y, en direccion, pasa a ser la pagina con mas impresiones o mejor posicion para esa query; (2) en "ran analytics", `data-in-ran/` mantiene o mejora su liderazgo semanal. Contexto (Tier 3): impresiones y posicion de `data-in-ran/` a nivel pagina. Tier 1 (contacto / descarga de CV) se reporta siempre, sin esperar que este cambio solo lo mueva (ver BL-012).

## Guardrail KPI
- `ai-ran-where-adds-value/` no pierde posicion de forma clara en sus queries propias.
- URL sin cambios (`/insights/data-in-ran/`), canonical propio, sin redirecciones; `linkedinUrl`, `pubDate` e imagen sin cambios.
- Build sin errores, 0 enlaces internos rotos, flujo de contacto intacto.

## Baseline
Ver Evidence (checkpoint 2026-10-23). A nivel pagina (todas las queries), 2026-09-25 a 10-21: `data-in-ran/` 29 impr., pos. 53.5; `ai-ran-where-adds-value/` 66 impr., pos. 72.8. Ultima semana (10-15 a 10-21): `data-in-ran/` 9 impr., pos. 73.8.

## Proposed change (rama `content/bl-011-data-in-ran`)
1. `src/content/insights/data-in-ran/index.md`: nuevo `title` ("RAN Monitoring Starts with Data: Building Observability That Operations Can Trust") y `description` orientados a "RAN monitoring"; cuerpo reescrito (422 -> ~1,050 palabras) con 8 H2 y 8 H3, a partir del borrador aprobado por Salvador el 2026-10-23 ("BL-011 – Borrador ampliado data-in-ran").
2. Ajustes al borrador hechos al compararlo con el original (para no perder ideas de Salvador): nueva seccion "More data is not better data" con la tesis del post original (frases de Salvador), un punto equivalente en Key takeaways, se conservan los hashtags del original (sin #BigData).
3. Enlaces internos: a `/insights/ai-ran-where-adds-value/` (titulo real "AI in RAN: Where It Actually Adds Value"; el borrador decia "Really") y al formulario de contacto (`/#contact`).
- **No se toca:** URL, `pubDate`, `coverImage`, `linkedinUrl`, `ai-ran-where-adds-value` (su enlace hacia este post conserva el anchor del titulo anterior), codigo, analitica.

## Quality Gate (2026-10-23, clon limpio en la nube)
Clon de GitHub (`origin/main` e61f72c) + los 7 commits locales aplicados como parches (`git format-patch`; el bundle del repo completo excede el limite de tiempo del puente). `npm ci` + `npm run build`: **150 paginas, 0 errores**, sitemap 150 URLs (incluye `data-in-ran/`). HTML del post: `<title>` y `meta description` nuevos, canonical `https://salvadoribarra.tech/insights/data-in-ran/`, JSON-LD `headline` actualizado, 8 H2 / 8 H3, enlaces a `/insights/ai-ran-where-adds-value/` y `/#contact` presentes, boton de LinkedIn intacto. **0 enlaces internos rotos** en todo el sitio. Chromium headless (`astro preview`), escritorio 1280 px y movil 390 px: HTTP 200, 0 imagenes rotas, sin scroll horizontal; unico error de consola = `googletagmanager.com` bloqueado por el proxy del sandbox (esperado, no es del sitio). Los 3 `linkedinUrl` sincronizados verificados en el HTML.
Hallazgo colateral (no cambiado): los 147 posts renderizan 2 `<h1>` (el layout pinta el `title` y el cuerpo Markdown repite `# titulo`). Patron preexistente de todo el catalogo; candidato a BL propio.

## Result
Pendiente (Deploy Preview y produccion).

## Decision
Pendiente.

## Learning
Pendiente.

# EXP-009 -- Limpieza de `public/assets/posts/` (imagenes legacy huerfanas)

## Experiment ID
EXP-009

## Observation
El directorio `public/assets/posts/` (148 archivos, 405MB) se mantuvo en el repositorio como red de seguridad desde EXP-004a/EXP-004b, a la espera de confirmar que el nuevo pipeline de `astro:assets` funcionara correctamente en produccion. Con EXP-004a/EXP-004b, EXP-005, EXP-006 y EXP-007 ya confirmados en produccion (ver sus respectivos resultados), se evaluo si ya era seguro eliminarlo.

## Evidence
Verificacion exhaustiva en el codigo y contenido actual (2026-09-23):
1. `src/content/config.ts` define `coverImage: image().optional()` como el campo moderno de imagen, optimizado por `astro:assets`.
2. **Los 141 posts de Insights tienen `coverImage` poblado; 0 posts dependen unicamente del campo legacy `image`** (verificado programaticamente sobre los 141 archivos de contenido).
3. `coverImage` apunta a un archivo local dentro de la propia carpeta del post en `src/content/insights/<slug>/`, completamente independiente de `public/assets/posts/`.
4. Las unicas 3 referencias a `assets/posts` en el codigo (`src/components/InsightsFeed.astro`, `src/pages/insights/[slug].astro`, y un comentario en `config.ts`) eran ramas de fallback legacy que nunca se ejecutaban con el contenido actual (condicion `post.data.coverImage ? ... : post.data.image && ...`, siempre resuelta al primer caso).

Registrado como **BL-007** en `experiments/BACKLOG.md`.

## Hypothesis
Eliminar `public/assets/posts/` y las ramas de codigo que lo referencian (que nunca se ejecutan hoy) reduce el tamano del repositorio y de cada deploy sin ningun efecto visible en el sitio, ya que ningun visitante real depende de ese contenido.

## Target KPI
Tamano del repositorio / peso de cada deploy de Netlify. No es un KPI de conversion ni de performance -- es una limpieza de mantenimiento, no un experimento de optimizacion de la experiencia del usuario.

## Guardrail KPI
Cero regresion visual o funcional: todas las imagenes de Insights (141 posts) y la imagen del Hero deben seguir renderizando correctamente despues del cambio. El build debe completar sin errores.

## Baseline
`public/assets/posts/`: 148 archivos, 405MB, huerfano (no referenciado por ningun codepath ejecutable con el contenido actual).

## Proposed change (implementado)
1. Eliminado el directorio completo `public/assets/posts/` (148 archivos, 405MB) del repositorio.
2. `src/components/InsightsFeed.astro`: simplificada la condicion de render de imagen de `post.data.coverImage ? (<Image .../>) : post.data.image && (<img src={`/assets/posts/${post.data.image}`} />)` a `post.data.coverImage && (<Image .../>)`, retirando la rama muerta.
3. `src/pages/insights/[slug].astro`: misma simplificacion aplicada al render del cuerpo del post, y al calculo de `ogImage` (se retiro el fallback `: (post.data.image ? `/assets/posts/${post.data.image}` : undefined)`, dejando `: undefined`).
4. Comentarios desactualizados en `config.ts` y `[slug].astro` actualizados para reflejar que el campo legacy `image` ya no se consume en ningun lado (se mantiene declarado en el schema por compatibilidad, sin romper contenido existente, pero sin efecto practico).

## Pre-change commit hash
5e2ca45 (merge de PR #5 / EXP-007 a main)

## Risk
Bajo, condicionado a la verificacion ya realizada (0 posts dependen del campo legacy). Riesgo residual: si en el futuro se agrega un post nuevo usando el campo `image` legacy en vez de `coverImage`, ahora simplemente no se mostrara ninguna imagen (fallback silencioso a "sin imagen"), en vez de intentar cargar un archivo que ya no existe -- un modo de falla mas seguro que el anterior.

## Implementation reference
Rama: feat/render-blocking-cleanup. Archivos: public/assets/posts/ (eliminado, 148 archivos), src/components/InsightsFeed.astro (simplificado), src/pages/insights/[slug].astro (simplificado), src/content/config.ts (comentario actualizado).

## Validacion realizada (2026-09-23)
1. Build local exitoso: 144 paginas construidas sin errores tras el borrado.
2. Verificacion del HTML generado (`dist/`): cero referencias a `assets/posts` en todo el output del build.
3. Verificacion visual del HTML de una pagina de post (`l4-autonomous-networks`) y del listado de Insights en el homepage: ambas siguen renderizando las imagenes optimizadas (`_astro/*.webp`) correctamente via `coverImage`.
4. Imagen del Hero verificada sin cambios (no afectada por este experimento).

## Approval status
BL-007 aprobado por Salvador para su implementacion el 2026-09-23 ("si, autorizo ambas"), incluyendo el borrado del contenido huerfano, junto con BL-006. Implementado y validado localmente.

## Measurement window
No aplica un periodo de medicion de KPI de conversion/performance (es limpieza de mantenimiento). Verificacion post-deploy: confirmar visualmente en produccion que el listado de Insights y las paginas individuales de posts siguen mostrando sus imagenes correctamente, y que el tamano del proximo deploy en Netlify se redujo.

## Result
Implementado y validado localmente (build exitoso, cero referencias residuales, render de imagenes confirmado). Pendiente: validacion visual en Deploy Preview y confirmacion del peso reducido del deploy en el dashboard de Netlify tras el merge.

## Decision
Pendiente de validacion en Deploy Preview y confirmacion visual en produccion tras el merge.

## Learning
(a completar tras el deploy)

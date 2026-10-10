Procedimiento de Actualización (LinkedIn Insights)
Cada vez que publiques algo relevante en LinkedIn y quieras que aparezca en tu web, sigue estos 4 pasos:

1. Preparación de la Imagen
Guarda la imagen que usaste en LinkedIn en la carpeta de tu proyecto: /public/assets/posts/.

Usa un nombre sencillo y descriptivo, ej: vran-optimization.png.

2. Creación del Archivo de Contenido
Ve a la carpeta /src/content/insights/.

Crea un nuevo archivo con extensión .md (Markdown), por ejemplo: 2026-02-05-vran-post.md.

Copia y pega esta estructura (el "Frontmatter") al inicio del archivo:

Markdown
---
title: "Título de tu Post en LinkedIn"
pubDate: 2026-02-05
description: "Un resumen corto de 1-2 líneas para la tarjeta del feed."
image: "/assets/posts/vran-optimization.png"
imageAlt: "Diagrama conceptual de la arquitectura O-RAN comparando reducción de costos contra control estratégico y agilidad"
linkedinUrl: "URL_DE_TU_POST_EN_LINKEDIN"
---

Aquí pegas el texto completo de tu publicación. Puedes usar **negritas** para resaltar 
términos como **O-RAN**, **SMO** o **KPIs**, y se verán automáticamente en Teal.
3. Guardado y Prueba Local (Opcional)
Si tienes el servidor de Antigravity corriendo, verás que el nuevo post aparece instantáneamente en localhost:4321. No necesitas programar nada más; el sistema que creamos lo detecta solo.

4. Sincronización (El "Launch")
Para que el mundo lo vea en salvadoribarra.tech, debes subir los cambios a GitHub. Puedes pedírselo a Antigravity o hacerlo tú en la terminal:

git add .

git commit -m "Add new insight: O-RAN optimization"

git push origin main

Magia de Automatización: En cuanto hagas el push, Netlify detectará el cambio, reconstruirá tu sitio automáticamente y en menos de 1 minuto el nuevo post estará en vivo.


***Si solo quieres verificar en local antes de aplicar en produccion***

PS C:\Proyectos\PersonalProfessionalWebsite> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
PS C:\Proyectos\PersonalProfessionalWebsite> npm run dev   

Abrir http://localhost:4322/insights
Abrir http://localhost:4321/insights


En caso de error: 

Al correo npm run dev, recibi los siguientes warnings, Explicame que paso, porque lo warnings y como coregir:
PS C:\Proyectos\PersonalProfessionalWebsite> npm run dev

> shaky-solstice@0.0.1 dev
> astro dev

14:41:03 [types] Generated 1ms
14:41:04 [content] Syncing content
14:41:04 [WARN] [glob-loader] Duplicate id "1erkpiquejas" found in C:\Proyectos\PersonalProfessionalWebsite\src\content\insights\1erKpiQuejas.md. Later items with the same id will overwrite earlier ones.
14:41:04 [WARN] [glob-loader] Duplicate id "biggest-misconception" found in C:\Proyectos\PersonalProfessionalWebsite\src\content\insights\biggest-misconception.md. Later items with the same id will overwrite earlier ones.
14:41:04 [WARN] [glob-loader] Duplicate id "when-more-spectrum" found in C:\Proyectos\PersonalProfessionalWebsite\src\content\insights\when-more-spectrum.md. Later items with the same id will overwrite earlier ones.
14:41:04 [content] Synced content


Aplica workaround:

2. ¿Cómo corregirlos?
Opción A: Limpiar la caché interna de Astro (Solución rápida y más probable)
El 90% de los casos en Astro 5 donde aparecen duplicados en glob-loader sin que existan dos archivos idénticos en disco se soluciona borrando la carpeta de caché .astro:

Detén el servidor de desarrollo en la terminal (Ctrl + C).
Elimina la carpeta .astro ejecutando en PowerShell:
powershell
Remove-Item -Recurse -Force .astro
PS C:\Proyectos\PersonalProfessionalWebsite> Remove-Item -Recurse -Force .astro
Vuelve a iniciar el servidor:
powershell
PS C:\Proyectos\PersonalProfessionalWebsite> npm run dev
npm run dev
Astro regenerará la caché desde cero y los warnings deberían desaparecer.

Opción B: Renombrar el archivo 1erKpiQuejas.md a minúsculas convencionales
Para evitar conflictos de compatibilidad de nombres de archivo en Windows / Git / Linux, es una buena práctica mantener todos los nombres de archivo Markdown en minúsculas y separados por guiones (kebab-case):

Renombra src/content/insights/1erKpiQuejas.md a src/content/insights/1er-kpi-quejas.md (o 1erkpiquejas.md).


## Version Claude - Cowork

# Guía: cómo publicar un nuevo post en Insights (salvadoribarra.tech)

Referencia operativa para Salvador (y para cualquier automatización externa, como el proyecto de Claude que genera sus publicaciones de LinkedIn, que necesite producir estos archivos). Basada en el esquema real definido en `src/content/config.ts` y en cómo cada campo se consume en `MainLayout.astro`, `[slug].astro` e `InsightsFeed.astro`.

## 1. Estructura de archivos

```
src/content/insights/<slug-en-minusculas-con-guiones>/
  ├── index.md
  └── <nombre-imagen>.jpg   (o .jpeg / .png)
```

- El **nombre de la carpeta es literalmente el slug de la URL** (`/insights/<slug>/`). Astro lo convierte a minúsculas automáticamente al generar la ruta.
- **Regla dura, no negociable:** usar siempre minúsculas y guiones (`kebab-case`) en el nombre de la carpeta, nunca mayúsculas ni camelCase. Esto evitó un bug real (ver EXP-011): en Windows, una carpeta `NetworkSlicing` y una `networkslicing` son el mismo archivo para el sistema de archivos pero Astro genera el slug en minúsculas de todos modos — mezclar mayúsculas no rompe nada de inmediato, pero genera confusión e inconsistencia con git en Windows. Evítalo desde el nombre de la carpeta.
- La imagen va **dentro de la misma carpeta**, junto a `index.md`, referenciada con ruta relativa (`./nombre-imagen.jpg`).

## 1.1. Patrón exacto de la URL final (copy-paste)

```
https://salvadoribarra.tech/insights/<nombre-exacto-de-la-carpeta-en-minusculas-y-guiones>/
```

El nombre de la carpeta se usa tal cual (ya en minúsculas) como último segmento de la URL. CON diagonal final y sin extensión (forma canónica desde EXP-014, 2026-10-07; la forma sin diagonal redirige a esta). Ejemplos reales:

- Carpeta `data-in-ran/` → `https://salvadoribarra.tech/insights/data-in-ran/`
- Carpeta `ee-tradeoff/` → `https://salvadoribarra.tech/insights/ee-tradeoff/`
- Carpeta `NetworkSlicing/` → `https://salvadoribarra.tech/insights/networkslicing/` (Astro fuerza minúsculas en el slug aunque la carpeta tenga mayúsculas -- por eso conviene nombrar la carpeta ya en minúsculas desde el inicio, para que carpeta y URL coincidan exactamente a simple vista).

## 2. Los campos del frontmatter -- qué hace cada uno y por qué importa

El frontmatter va entre `---` al inicio de `index.md`. Estos son los únicos campos que el sitio reconoce:

| Campo | Tipo | Obligatorio | Para qué se usa (impacto real) |
|---|---|---|---|
| `title` | texto | Sí | Es el H1 del post, el `<title>` de la pestaña del navegador, el título del resultado en Google, el `og:title`/`twitter:title` (lo que se ve al compartir en LinkedIn/redes), y el título mostrado en la tarjeta del listado de Insights. **Es el campo de mayor peso SEO junto con `description`** -- debe incluir la palabra clave objetivo de forma natural. |
| `pubDate` | fecha (`AAAA-MM-DD`) | Sí | Determina el **orden cronológico** en el listado de Insights (el más reciente primero), se muestra como "Mes, Año" en la tarjeta y como fecha completa en el post, alimenta el dato estructurado `datePublished` (Schema.org/JSON-LD, usado por Google para resultados enriquecidos) y el `lastmod` del sitemap (señal de frescura para el recrawl de Google). No afecta la URL. |
| `description` | texto | Sí | **El campo más crítico para SEO y para conversión de clics.** Se convierte en el `<meta name="description">` -- el texto que Google muestra debajo del título en resultados de búsqueda --, en el párrafo resumen de la tarjeta del listado, y en el `og:description`/`twitter:description` (el texto que acompaña el link al compartirlo). Debe: (a) mencionar explícitamente la keyword/ángulo objetivo del post (esto fue exactamente lo que corregimos en BL-009 para evitar que dos posts compitieran por la misma búsqueda), y (b) diferenciarse claramente de la description de cualquier otro post que toque un tema cercano, para no canibalizar posicionamiento entre tus propios posts. |
| `coverImage` | ruta relativa a un archivo de imagen | Recomendado (sin ella no hay imagen en ningún lado) | Astro la optimiza automáticamente en el build (resize, conversión a formato moderno). Se usa como: miniatura en la tarjeta del listado, imagen de portada arriba del post, y -- redimensionada a 1200px de ancho en JPEG -- como `og:image`/`twitter:image`, es decir, **la imagen que aparece en la vista previa cuando compartes el link en LinkedIn**. Impacto directo en tasa de clics al compartir. |
| `imageAlt` | texto | Opcional pero recomendado | Texto alternativo de accesibilidad, usado específicamente como `og:image:alt`/`twitter:image:alt` (la imagen de vista previa social). Nota: **no** es el `alt` de la imagen dentro del artículo ni en la tarjeta del listado -- ahí el sitio usa `title` por defecto. Su impacto es accesibilidad + una señal menor de SEO de imágenes. |
| `linkedinUrl` | URL válida | Opcional | Enlaza el post del sitio de vuelta al post original de LinkedIn donde lo compartiste (se muestra como "Discuss on LinkedIn" al final del artículo). Sirve para conectar el engagement de LinkedIn (comentarios, reacciones) con el sitio -- señal de contexto/Tier 2-3, no afecta indexación de Google directamente. |

Campo legacy que **no debes usar**: `image` (existe en el schema por compatibilidad histórica, pero desde BL-007 ningún componente del sitio lo lee -- usa siempre `coverImage`).

## 3. Especificaciones recomendadas para la imagen

- Formato de origen: JPG o PNG (Astro la convierte a WebP optimizado en el build).
- Peso de origen recomendado: idealmente bajo 1-2 MB. No hace falta optimizarla a mano -- Astro la procesa -- pero partir de un archivo de 6-12MB (como el caso que limpiamos en BL-007) infla el repositorio y el tiempo de build sin ningún beneficio.
- Proporción: las tarjetas del listado la muestran en un contenedor de `h-48` (ancho variable, alto fijo) con `object-contain`, y el artículo la muestra a ancho completo hasta `60vh` de alto -- una imagen horizontal (paisaje, ~16:9 o similar) funciona mejor que una vertical.

## 4. Plantilla lista para copiar

```markdown
---
title: "Título del post"
pubDate: 2026-10-01
description: "Descripción que menciona la keyword objetivo y se diferencia de posts relacionados."
coverImage: "./nombre-imagen.jpg"
imageAlt: "Descripción de la imagen para accesibilidad y redes sociales"
linkedinUrl: "https://www.linkedin.com/posts/salvador-ibarra-luna_..."
---

# Título del post

Contenido del post en Markdown...
```

## 5. Flujo de git para publicar

Hay dos formas válidas. La diferencia real entre ellas es si obtienes o no un **Deploy Preview** (una URL temporal para revisar el post antes de que sea público) antes de que el cambio llegue a producción.

### Modo A -- directo a `main` (tu flujo original, más simple)

```bash
git add .
git commit -m "Add new insight: <título>"
git push origin main
```

Sigue siendo perfectamente válido para contenido (a diferencia de cambios de infraestructura como BL-008, donde sí hubo riesgo real). El costo es que no hay red de seguridad: Netlify despliega a producción de inmediato, así que cualquier error (imagen rota, frontmatter mal escrito) ya es visible en vivo antes de que lo notes.

### Modo B -- con rama y Deploy Preview (recomendado si quieres revisar antes de publicar)

```bash
git checkout main
git pull
git checkout -b post/<slug-del-post>

# crear la carpeta src/content/insights/<slug>/ con index.md y la imagen

git add src/content/insights/<slug>/
git commit -m "content: nuevo post - <título>"
git push -u origin post/<slug>
```

Qué hace cada línea:
- `git checkout main` -- te posiciona en la rama principal, para partir de la versión más reciente.
- `git pull` -- trae a tu copia local cualquier cambio que ya esté en GitHub y que tú todavía no tengas (por ejemplo, un commit de documentación hecho en una sesión de Claude).
- `git checkout -b post/<slug-del-post>` -- crea una **rama nueva** (una copia de trabajo paralela a `main`, donde puedes hacer cambios sin tocar la rama principal todavía). El `-b` le dice a git que la cree. `post/<slug-del-post>` es solo el **nombre** que le das a esa rama -- `post/` no es sintaxis especial de git, es una convención de nomenclatura (igual que una carpeta) para identificarla de un vistazo; podría llamarse cualquier cosa, ej. `nuevo-post-oran`.
- `git add` / `git commit` / `git push -u origin <rama>` -- igual que tu flujo de siempre, solo que el push va a esta rama nueva en vez de directo a `main`.

Después: abres un Pull Request en GitHub (`post/<slug>` → `main`) -- esto genera el Deploy Preview automáticamente -- revisas que el post cargue bien, y tú mismo fusionas (merge) el PR cuando estés conforme. Netlify despliega a producción al fusionar.

### Agrupar varios posts en un solo push (para ahorrar créditos de Netlify)

Cada deploy a producción cuesta 15 créditos fijos de Netlify, sin importar cuánto contenido lleve -- así que agrupar varios posts en un solo push (por ejemplo, uno semanal en vez de uno por post) es exactamente lo recomendable si te importa el consumo de créditos. Puedes combinar esto con el Modo B: acumula las carpetas de todos los posts de la semana, y cuando vayas a publicar, usa una sola rama (ej. `post/semana-<fecha>`) con todos los `git add` de esa tanda antes del commit -- el PR resultante te deja revisar todos los posts nuevos de un vistazo en un solo Deploy Preview, y un solo merge los publica todos juntos en un solo deploy a producción.

### Después de publicar (cualquiera de los dos modos)

Recomendado: reenviar el sitemap en Search Console para que Google detecte el/los post(s) nuevo(s) más rápido (ahora esto se puede automatizar vía `submit_sitemap()` en `analytics_readonly.py` -- pídemelo en tu próxima sesión con Claude y lo hago directo, o hazlo tú manualmente en Search Console → Sitemaps).


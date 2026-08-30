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
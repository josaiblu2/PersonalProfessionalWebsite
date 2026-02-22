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
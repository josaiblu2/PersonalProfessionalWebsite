# EXP-020 -- Linea base de calidad de audiencia en LinkedIn (ventana Premium)

## Experiment ID
EXP-020

## Observation
Los KPI Tier 1 del sitio (`tier1_contact_conversion`, `tier1_cv_download_conversion`) llevan
semanas en 0 con trafico real registrado. Hasta ahora no habia forma de distinguir entre dos
diagnosticos opuestos: (a) llega la audiencia correcta y el sitio no convierte, o (b) no llega
la audiencia correcta. GA4 y Search Console miden el medio y el final del embudo; no miden
quien esta viendo el contenido en LinkedIn, que es donde nace el trafico.

Salvador recibio un mes de LinkedIn Premium que arranco aprox. el 2026-11-19/20 y vence aprox.
el 2026-12-19/20. Esa ventana cubre integramente los lotes 2, 3 y 4 del metodo de publicacion
nuevo (2026-11-30 a 2026-12-18). El acceso a estos datos se pierde al vencer la suscripcion.

## Snapshot de linea base -- capturado 2026-11-23, 17:30 CDMX

### Visitas al perfil (ventana de 90 dias)
- **170** visitas al perfil
- **+208%** contra los 7 dias previos
- Serie del grafico: 13 puntos del 2026-08-31 al 2026-11-23, rango 6 a 40 (maximo en el
  tramo mas reciente, coincidiendo con el arranque del metodo nuevo el 2026-11-23)
- **17 reclutadores** vieron el perfil en el periodo (Kueski, PER International, Cognizant,
  entre otros)

### Composicion de audiencia -- 10 de 10 visitantes visibles son el publico objetivo
| Cargo del visitante | Grado |
|---|---|
| Senior RF Planning Engineer at Neutral Wireless | 1er |
| Senior RF Engineer at AWTG, RF Planning/Design/Testing/Optimisation, 5G NR, Private 5G, SATCOM | 1er |
| RAN Architecture, O-RAN, Automation and Data Insights, RF Design | 1er |
| Radio Frequency Optimization Engineer | 1er |
| Supervision Field Operation Telecom en Ericsson | 2do |
| Telecommunications & ICT Engineering Student, 5G RAN & Core, Cloud-Native | 2do |
| Radio Statistics Engineer | 2do |
| Telecoms, Network Planning, Performance & Optimization strategist | 1er |
| Radio Optimization Expert, Nokia, Ericsson | 2do |
| Telecommunications & Spectrum Monitoring Engineer, RF & Satellite | 1er |

**Calidad de audiencia: 100% en el dominio objetivo. Cero ruido.**

### Origen de la visibilidad (2026-11-10 a 2026-11-16)
- **2,717** apariciones totales del perfil, **+27%** vs. 7 dias previos
- **59** apariciones por busqueda, 0% de cambio

| Donde aparecio | Peso |
|---|---|
| Publicaciones | **67.4%** |
| Comentarios | 20.8% |
| Recomendaciones de red | 9.7% |
| Busqueda de LinkedIn | **2.2%** |

### Limitacion del tier
En "Profile engagement", las metricas de clics y tiempo medio de visualizacion aparecen
bloqueadas con "Unlock details by upgrading". El plan actual no las incluye.

### Comentarios como canal -- linea base 2026-11-23, 18:10 CDMX

Los comentarios son el **20.8%** de las apariciones de perfil (ver reparto arriba), el segundo
canal despues de las publicaciones. Esa ventana medida (10 al 16 de noviembre) es **anterior**
al arranque del metodo de publicacion nuevo, asi que ese 20.8% corresponde casi por completo a
la practica de felicitar a quien anuncia un puesto nuevo, que Salvador mantiene desde hace
semanas por motivo propio (celebrar los logros ajenos como habito personal, no como tactica).

Impresiones por comentario, capturadas de su actividad reciente:

| Destinatario | Comentario | Impresiones |
|---|---|---|
| Vice Director, 6G Test Centre (NATO DIANA) | "Wishing you the best" | **80** |
| Senior Lead Engineer, Qualcomm | emoji | 27 |
| Director Program Management, Qualcomm | "Congratulations!" | 20 |
| Senior Client Lead Recruiter, Blue Origin | "Congratulations!" | recien publicado |

**Patron observado:** el comentario en el dominio propio (6G) rindio 3 a 4 veces mas
impresiones que los de fuera del dominio (Qualcomm program management, reclutamiento
aeroespacial). La explicacion probable es que la red de quien publica define quien ve el
comentario.

**Efecto colateral detectado:** entre los visitantes del perfil hay 17 reclutadores, varios de
empresas sin relacion con telecom (Kueski, PER International, Cognizant). Es consistente con
felicitar fuera del dominio.

**No atribuir el pico a este canal.** El +208% en visitas al perfil coincide con la publicacion
del lunes 23, no con las felicitaciones, que llevan semanas con un goteo constante. Son dos
efectos distintos: las felicitaciones dan base, la publicacion da pico.

**Ajuste acordado el 2026-11-23, sin esfuerzo adicional:** mantener la practica, pero
(a) priorizar destinatarios dentro del dominio RAN / O-RAN / telecom / 6G, y (b) cuando el
destinatario sea del dominio, anadir una frase sustantiva en lugar de solo el emoji, para que
las impresiones lleven posicionamiento y no solo el nombre.

**Que medir en el corte de diciembre:** si el reparto de origen de visibilidad cambia (peso de
comentarios), si las impresiones medias por comentario suben al concentrarse en el dominio, y
si baja la proporcion de visitantes fuera de telecom.

## Conclusion que cambia la prioridad del proyecto
La audiencia correcta **si** esta llegando, y creciendo fuerte. Por tanto el 0 en los KPI
Tier 1 **no** se explica por contenido ni por distribucion: apunta a la conversion del sitio.
El esfuerzo de optimizacion debe ir a los CTA, al formulario de contacto y a la descarga del
CV, no a cambiar el tema ni el canal.

Segundo hallazgo: con 67.4% de la visibilidad viniendo de publicaciones y solo 2.2% de
busqueda, optimizar el perfil para el buscador de LinkedIn es irrelevante. El contenido es
el 88% de la visibilidad sumando publicaciones y comentarios.

## Fricciones detectadas en el perfil (2026-11-23)
1. En la seccion "About" el dominio aparece como **texto plano, no enlace**:
   `josaiblu2@yahoo.com.mx . salvadoribarra.tech`
2. Los dos enlaces de Destacados **no llevan UTM**, asi que el trafico de perfil es
   indistinguible del de posts en GA4, pese a que los primeros comentarios si los llevan.
3. El enlace destacado apunta a `/insights/data-in-ran/`, una pieza antigua, no al pilar
   vigente (`closed-loop-readiness-scorecard`).

## Medicion de cierre -- pendiente, antes del 2026-12-19
Repetir exactamente las mismas tres capturas (visitas 90 dias, composicion de los visitantes
visibles, reparto de origen de visibilidad) y comparar contra este snapshot. Pregunta a
responder: **el volumen crecio manteniendo la calidad de audiencia?**

Guardar los datos antes del vencimiento: el panel desaparece con la suscripcion.

## Approval status
Snapshot solicitado y aprobado explicitamente por Salvador el 2026-11-23
("genera y guarda esa informacion que es valiosa como un snapshot").

---
title: "De SON a rApps: dónde vive hoy cada función de automatización RAN"
pubDate: 2026-11-23
description: "Ubica cada función SON en la arquitectura O-RAN: ANR, MRO, MLB, CCO y PCI, con la interfaz y el lazo de control que las alimenta hoy."
coverImage: "./de-son-a-rapps-mapeo-funciones.png"
imageAlt: "Diagrama de arquitectura O-RAN en tres capas: nodo 5G con RU, DU y CU; Near-RT RIC con SON y apps de control en la escala de 10 ms a 1 s; y Non-RT RIC con rApps por encima de 1 s, conectados por las interfaces E2, A1 y O1"
linkedinUrl: "https://lnkd.in/p/eC-bs-KB"
---

La transición de SON a rApps se cuenta muchas veces como si las funciones de automatización se hubieran reinventado desde cero. No ocurrió eso. ANR, MRO, MLB, CCO y la asignación de PCI siguen existiendo, con la misma lógica que un ingeniero RAN aprendió hace diez años. Lo que se movió fue el domicilio de cada función y la interfaz por la que recibe datos y escribe decisiones.

Esa distinción no es académica. Define quién puede cambiar un parámetro, con qué frecuencia, y qué tan rápido es posible deshacer una decisión equivocada. Si vienes del mundo SON y estás evaluando una arquitectura O-RAN, el mapa que necesitas no es una lista de siglas nuevas, sino una tabla de reubicación.

## Lo que cambió no fue el algoritmo, fue la escala de tiempo

El criterio que ordena toda esta arquitectura es más simple de lo que parece. O-RAN organiza el control en tres lazos según el tiempo que puede tardar una decisión:

- **Lazo de tiempo real:** por debajo de 10 ms, dentro del propio nodo. Aquí viven el scheduling, la adaptación de enlace y la gestión de haces.
- **Lazo near real time:** entre 10 ms y 1 s, en el Near-RT RIC, actuando sobre los nodos E2 a través de la interfaz E2. Es el dominio típico de traffic steering, gestión de movilidad y gestión de interfaces.
- **Lazo non real time:** por encima de 1 s, en el Non-RT RIC alojado dentro del SMO. Aquí caben la orquestación, la optimización de más largo plazo y los modelos de aprendizaje.

De ahí sale la primera conclusión práctica: la escala de tiempo decide dónde puede vivir una función, no la preferencia arquitectónica del proveedor. Una función que necesita reaccionar en milisegundos no puede ser un rApp, por bueno que sea el modelo que lleve dentro.

Y conviene insistir en algo que se pierde en las presentaciones: el SON distribuido no desapareció. 3GPP sigue especificando ANR, MRO, optimización de RACH, configuración de PCI y Load Balancing Optimisation en la TS 28.313, dedicada a SON para redes 5G. En la práctica, buena parte de eso continúa ejecutándose en el propio gNB. O-RAN añadió capas de inteligencia por encima; no vació las que ya estaban abajo.

## La tabla de reubicación: dónde vive hoy cada función que ya conocías

Esta es la tabla que conviene tener a mano cuando alguien te presenta una plataforma de automatización. La columna que más información da no es la segunda, es la cuarta: la interfaz revela el permiso de escritura real de cada función.

| Función | Dónde vivía en SON clásico | Dónde puede vivir hoy | Interfaz por la que observa o actúa | Escala de decisión |
|---|---|---|---|---|
| ANR | D-SON en el eNB o gNB | Sigue en el nodo; un rApp audita y corrige la lista de vecinos | Xn o X2 para el descubrimiento; O1 para la gestión | Segundos a minutos |
| Configuración de PCI | cSON para la asignación, D-SON para conflictos | rApp en el Non-RT RIC para planificar; nodo para mitigar | O1 (CM) | Minutos a horas |
| MRO | D-SON en el nodo | Nodo para el ajuste fino; rApp para el análisis multivendor | O1 (PM y CM) | Horas a días |
| MLB o Load Balancing | D-SON por par de celdas | xApp en el Near-RT RIC por usuario; rApp para fijar umbrales | E2 para la acción; A1 para la política | 10 ms a 1 s, o más de 1 s si la decide un rApp |
| CCO | cSON centralizado | rApp en el Non-RT RIC | O1, más el control remoto de tilt | Horas a días |
| Optimización de RACH | D-SON en el nodo | Sigue en el nodo | O1 para fijar el objetivo | Minutos |
| Ahorro de energía | cSON o temporizadores en el nodo | rApp con predicción de tráfico y política hacia el Near-RT RIC | O1 y A1 | Minutos a horas |
| Traffic steering | No existía como función SON estándar | xApp en el Near-RT RIC | E2 | 10 ms a 1 s |

Dos lecturas que salen de la tabla y que suelen pasar desapercibidas.

La primera: casi ninguna función migró completa. Lo normal es que se parta en dos. La decisión fina se queda abajo, cerca del nodo, y la coordinación entre celdas o entre proveedores sube al Non-RT RIC. Una misma función puede tener, entonces, dos dueños y dos cadencias.

La segunda: cuando una función aparece en dos filas de la arquitectura, aparece también la pregunta de precedencia. Ese es el punto donde una plataforma madura se distingue de un conjunto de aplicaciones sueltas, y es el tema que trataré por separado.

## Qué cambia realmente en un rApp

Si tuviera que resumir la diferencia operativa en una frase, no hablaría de inteligencia ni de modelos. Hablaría de permiso de escritura.

Un rApp vive sobre el Non-RT RIC y conversa con su framework mediante la interfaz R1, que le expone servicios de datos, de gestión y de AI/ML. Observa con la información que llega por O1, decide, y actúa de dos maneras posibles: recomendando acciones de configuración por O1, o emitiendo una política A1 hacia el Near-RT RIC para que sea este el que la ejecute en una escala más corta. La interfaz A1 transporta justamente eso: políticas, información de enriquecimiento y gestión de modelos.

Reconocer esa cadena, de O1 a R1 y de A1 a E2, es lo que te permite colocar un guardarraíl en el lugar correcto. Un rApp que solo recomienda y no escribe tiene un perfil de riesgo completamente distinto al de un xApp que ajusta un parámetro cada cien milisegundos, aunque los dos se presenten en la misma diapositiva bajo la palabra automatización.

## Cómo usar esto al evaluar una arquitectura

Tres preguntas que ordenan cualquier conversación con un proveedor o con un equipo interno:

- Pregunta en qué lazo decide cada función, y verifica que la escala de tiempo sea coherente con lo que la función pretende corregir.
- Pregunta por dónde escribe, no qué algoritmo usa. La interfaz te dice el alcance real del daño posible y la velocidad de reversión.
- Pregunta quién manda cuando dos funciones tocan el mismo parámetro, porque en la tabla anterior hay al menos tres filas donde eso puede ocurrir.

Si estás empezando a construir este mapa, en [SON 101](/insights/son-101/) está la base de las funciones clásicas, en [rApps vs xApps](/insights/rapps-vs-xapps/) el reparto de inteligencia entre los dos RIC, y en [SON Is Not Dead](/insights/son-is-not-dead/) el argumento de por qué la coordinación, y no el algoritmo, fue siempre el problema difícil.

Si estás evaluando una migración de cSON a rApps y quieres una segunda opinión sobre el reparto de funciones, [conversemos](/#contact).

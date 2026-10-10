---
title: "Downtilt: unos pocos grados pueden cambiar toda una red"
pubDate: 2026-10-21
description: "Calcula el impacto del downtilt en cobertura RF: geometría del haz, tilt mecánico vs eléctrico, RET y Massive MIMO con un ejemplo práctico."
coverImage: "./downtilt-antena-geometria-haz.png"
imageAlt: "Geometría de downtilt de antena en sitio celular a 30 metros, comparando 6 grados con huella de cobertura contenida y 4 grados con borde superior del haz extendido varios kilómetros hacia celdas vecinas"
---

# Downtilt: unos pocos grados pueden cambiar toda una red

Pocos parámetros tienen tanto impacto con tan poco cambio. Hagamos números con un caso típico: antena a 30 metros, ancho de haz vertical de 7 grados.

Con 6 grados de downtilt, el borde superior del haz toca el suelo a unos 700 metros del sitio. Si alguien lo reduce a 4 grados para "ganar cobertura", ese borde se va a más de 3 kilómetros. Dos grados movieron la huella casi cinco veces, y ahora la celda escucha y es escuchada por vecinos que no estaban en el diseño.

Por eso cada ajuste de tilt merece más análisis del habitual:

* El tilt mecánico inclina todo el panel, pero deforma el patrón horizontal y los lóbulos laterales quedan menos inclinados que el frente.
* El tilt eléctrico mantiene la forma del patrón y desplaza el haz de manera uniforme, por eso es la herramienta preferida para ajustes finos.
* Con RET, el cambio se aplica en minutos desde el OSS, lo que facilita optimizar y también facilita equivocarse a escala.
* En Massive MIMO el downtilt se vuelve un parámetro del beam, y un offset mal elegido puede afectar al SSB y a los beams de tráfico de forma distinta.

Mi regla práctica: antes de mover un tilt, revisar el perfil de terreno, la altura de los vecinos y la distribución de timing advance de la celda. Ese último dato dice dónde están realmente los usuarios, y muchas veces contradice lo que muestra el mapa de predicción.

Aquí es donde SON y CCO aportan valor real, siempre que trabajen con límites claros y validación posterior de KPI.

El downtilt es de los cambios más baratos en una red. También es de los que más rápido se notan cuando se hacen mal.

#RFOptimization #Downtilt #RANDesign #SON #5G
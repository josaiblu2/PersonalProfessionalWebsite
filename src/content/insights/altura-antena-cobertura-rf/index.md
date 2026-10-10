---
title: "¿Por qué una antena más alta no siempre mejora la cobertura?"
pubDate: 2026-10-14
description: "Analiza cómo la altura de antena afecta la cobertura RF: overshooting, nulos del patrón vertical e interferencia en redes LTE y 5G."
coverImage: "./altura-de-antena-cobertura-rf.png"
imageAlt: "Comparación de altura de antena en dos sitios celulares: torre alta con overshooting e interferencia hacia celdas vecinas frente a torre baja con huella de cobertura RF contenida en entorno urbano denso"
---

# ¿Por qué una antena más alta no siempre mejora la cobertura?


Cuando un sitio no cubre lo que debería, una de las primeras propuestas en la mesa es subir la antena. Tiene lógica: más altura significa más línea de vista y más alcance. En una zona rural plana, muchas veces funciona. En una ciudad densa, puede empeorar las cosas.

Lo que pasa en campo cuando se sube la antena sin revisar el diseño completo:

* El sitio empieza a verse desde mucho más lejos, invade el área de sus vecinos y genera overshooting que baja el SINR del cluster.
* Para controlar ese alcance hay que meter más downtilt, y al hacerlo cambia la forma en que el patrón vertical aterriza en el terreno.
* Justo debajo y cerca del sitio pueden aparecer zonas débiles, porque los nulos del patrón vertical caen donde antes había buena señal.
* La interferencia hacia otros sitios crece más rápido que la cobertura útil, y en LTE o 5G eso se nota en throughput aunque el RSRP luzca bien.

En redes de capacidad la altura rara vez es la palanca correcta. Un sitio más bajo, con su huella bien contenida, suele entregar mejor reutilización espectral que uno alto que intenta cubrirlo todo. En Massive MIMO el tema se vuelve más fino todavía, porque el tilt eléctrico y los beams se diseñan pensando en una altura y un entorno específicos.

Antes de aprobar un cambio de altura, yo revisaría tres cosas: la distancia y altura de los vecinos, el perfil de terreno hacia el área problema, y si el hueco de cobertura es realmente de alcance o es de interferencia.

La altura es una herramienta poderosa, pero mal usada genera problemas que después cuestan semanas de optimización.

#RF #RFOptimization #RANDesign #5G #LTE #Telecom
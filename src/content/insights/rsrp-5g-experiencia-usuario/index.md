---
title: "¿Por qué el mismo RSRP da experiencias opuestas en 5G?"
pubDate: 2026-11-02
description: "Descubre por qué dos celdas con el mismo RSRP en 5G ofrecen experiencias opuestas y qué KPIs revisar: SINR, PRBs, rank, MCS y transporte."
coverImage: "./rsrp-5g-experiencia-usuario.webp"
imageAlt: "Comparación de dos celdas 5G con el mismo nivel de RSRP: una con señal limpia y pocos usuarios, otra saturada de interferencia y tráfico, mostrando el impacto en la experiencia de usuario"
---

# ¿Por qué el mismo RSRP da experiencias opuestas en 5G?

Es un caso que he visto muchas veces: dos celdas con RSRP promedio cercano a -95 dBm, prácticamente iguales en el reporte. Una entrega buena experiencia de forma consistente. La otra acumula quejas todos los días.

La explicación empieza por entender qué mide el RSRP. Es la potencia promedio de las señales de referencia del SSB que recibe el UE. Te dice cuánta señal llega, pero nada sobre su calidad ni sobre con cuántos usuarios hay que compartir la celda.

Lo que normalmente marca la diferencia:

🔹 Una celda puede tener SINR alto mientras la otra recibe interferencia de varios vecinos, y ahí el scheduler baja el MCS una y otra vez.
🔹 Cuando la utilización de PRBs supera el 80% en hora pico, cada usuario recibe apenas una fracción de los recursos.
🔹 Un entorno con más multitrayecto permite un rank mayor, y con la misma potencia se transmiten más capas MIMO.
🔹 Un transporte con poca capacidad limita el throughput en hora pico, aunque la interfaz de radio todavía tenga margen.

Por eso comparar celdas solo con RSRP lleva a decisiones equivocadas. Para entender la experiencia real conviene cruzar SINR o CQI, distribución de MCS, rank, BLER, utilización de PRBs y usuarios activos.

Con SON y rApps esto se vuelve todavía más relevante, porque un algoritmo que persigue el RSRP como objetivo único puede mejorar el mapa y empeorar la experiencia.

𝗟𝗮 𝗲𝘅𝗽𝗲𝗿𝗶𝗲𝗻𝗰𝗶𝗮 𝘀𝗲 𝗱𝗲𝗰𝗶𝗱𝗲 𝗲𝗻 𝗹𝗼 𝗾𝘂𝗲 𝗲𝗹 𝗺𝗮𝗽𝗮 𝗱𝗲 𝗰𝗼𝗯𝗲𝗿𝘁𝘂𝗿𝗮 𝗻𝗼 𝗺𝘂𝗲𝘀𝘁𝗿𝗮.

#5G #RSRP #SINR #RFOptimization #RANOptimization #NetworkPerformance #QoE
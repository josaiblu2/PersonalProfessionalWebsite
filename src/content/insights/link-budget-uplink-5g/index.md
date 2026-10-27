---
title: "Link budget de uplink en 5G: qué es y por qué importa"
pubDate: 2026-10-26
description: "Entiende el link budget de uplink en 5G: por qué el UE limita la cobertura en TDD mid band y cómo cerrarlo con SUL, EN-DC y Massive MIMO."
coverImage: "./link-budget-uplink-5g.webp"
imageAlt: "Diagrama técnico del link budget de uplink en 5G entre un smartphone y una antena Massive MIMO en 3.5 GHz, con pérdidas de penetración, márgenes de fading y potencia del UE"
---

# Link budget de uplink en 5G: qué es y por qué importa

Cuando revisamos una predicción de cobertura casi siempre miramos el downlink: RSRP, SINR, mapas en verde. En campo, muchas veces el problema está del otro lado: el gNB ya no escucha al UE.

El link budget de uplink es la cuenta de cuántos dB tiene el teléfono para llegar a la celda. Parte de la potencia del UE, suma ganancias de antena, resta pérdidas de cuerpo, penetración y márgenes de fading e interferencia, y lo compara con la sensibilidad del gNB.

Lo que lo vuelve crítico en 5G:

🔹 Un UE típico transmite con 23 dBm, mientras la celda usa decenas de watts, así que el downlink casi siempre llega más lejos.
🔹 En TDD mid band, como n78, la mayoría de los slots son de downlink y el UE tiene menos oportunidades para transmitir.
🔹 A 3.5 GHz la penetración indoor castiga más, y el uplink lo resiente primero.
🔹 Si el UE reparte su potencia en muchos PRBs, la densidad espectral baja y el borde de celda se acerca.

El síntoma clásico es un usuario con RSRP aceptable que falla en el RACH, pierde la llamada de VoNR o casi no logra subir datos.

Por eso un diseño serio define el borde de celda por uplink. Para cerrarlo hay opciones: anclar el uplink en banda baja vía EN-DC o carrier aggregation, usar SUL, aprovechar la ganancia de recepción del Massive MIMO y afinar el control de potencia con p0 y alpha.

¿Cuántos de los tickets de "cobertura" abiertos hoy son en realidad problemas de uplink?

#5G #LinkBudget #Uplink #RFDesign #RANOptimization #VoNR #TDD
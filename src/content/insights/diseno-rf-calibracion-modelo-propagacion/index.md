---
title: "El error de diseño RF que empieza antes de instalar la primera antena"
pubDate: 2026-11-06
description: "Evita el error de diseño RF más caro: modelos de propagación sin calibrar, clutter viejo y link budgets solo en downlink antes del despliegue."
coverImage: "./diseno-rf-calibracion-modelo-propagacion.webp"
imageAlt: "Ingeniero de diseño RF frente a una herramienta de planeación comparando un mapa de cobertura predicho contra mediciones CW reales sobre una ciudad, mostrando la diferencia entre modelo de propagación calibrado y sin calibrar"
---

# El error de diseño RF que empieza antes de instalar la primera antena

En muchos proyectos que he revisado, los problemas de cobertura no nacieron en campo. Nacieron meses antes, frente a una herramienta de planeación, con un modelo de propagación que nadie había calibrado.

El diseño RF arranca con supuestos: el modelo de propagación, los datos de clutter y terreno, las pérdidas por penetración en interiores, la altura real de los sitios. Si esos supuestos están mal, todo lo que viene después hereda el error, aunque el mapa de RSRP se vea impecable.

Un ejemplo con números. Con un exponente de pérdida típico de zona urbana, un modelo optimista por solo 6 dB puede reducir el radio real de la celda alrededor de un tercio. En área, eso es perder cerca de la mitad de la cobertura prometida.

Los errores que más veo antes de instalar la primera antena son estos:

🔹 Usar un modelo de propagación genérico, sin calibrarlo con mediciones CW, y sobre mapas de clutter desactualizados.
🔹 Asumir pérdidas de penetración en interiores demasiado bajas, sobre todo en bandas medias como 3.5 GHz.
🔹 Cerrar el link budget solo en downlink y olvidar que el uplink suele ser el que limita el borde de celda.
🔹 Elegir sitios por disponibilidad comercial y forzar después la RF para que encaje.

La optimización post lanzamiento puede corregir mucho, pero hay cosas que ningún ajuste de tilt o potencia arregla, como un sitio mal ubicado o una densidad de red insuficiente.

Hoy, con MDT, trazas y PM de la red existente, no calibrar ya no tiene excusa. 𝗘𝗹 𝗺𝗲𝗷𝗼𝗿 𝗱𝗿𝗶𝘃𝗲 𝘁𝗲𝘀𝘁 𝗲𝘀 𝗲𝗹 𝗾𝘂𝗲 𝘃𝗮𝗹𝗶𝗱𝗮 𝗲𝗹 𝗺𝗼𝗱𝗲𝗹𝗼 𝗮𝗻𝘁𝗲𝘀 𝗱𝗲 𝗰𝗼𝗻𝘀𝘁𝗿𝘂𝗶𝗿.

#DisenoRF #RFPlanning #RAN #5G #LinkBudget #OptimizacionRF
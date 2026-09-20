---
title: "VONR EN 5G SA: LO QUE CAMBIA PARA EL INGENIERO RAN"
pubDate: 2026-09-30
description: "Descubre cómo VoNR en 5G SA convierte la calidad de voz en un tema de RAN: cobertura UL, movilidad a LTE, scheduling, EPS Fallback y KPIs clave."
image: "VoNR-5g-sa.png"
imageAlt: "Arquitectura técnica de voz sobre 5G NR con una celda 5G SA, un flujo de paquetes de voz hacia IMS y una transición hacia LTE en el borde de cobertura, en tonos azul profundo y verde azulado"
---

# VONR EN 5G SA: LO QUE CAMBIA PARA EL INGENIERO RAN

Durante años la voz fue un tema de core e IMS, y en RAN la tratábamos casi como un flujo más de datos. Con VoNR eso cambia. En 5G SA la calidad de la llamada depende directamente de cómo diseñamos y optimizamos el acceso, y se vuelve un KPI de RAN.

Estos son los puntos donde más vale la pena poner atención:

* La cobertura de voz en bandas medias TDD suele quedar limitada por el uplink, así que conviene revisar el patrón TDD, la potencia del equipo y opciones como SUL o agregación en UL.
* La movilidad hacia LTE sigue siendo crítica en los bordes de cobertura SA, por lo que los umbrales de handover inter RAT deben afinarse junto con la configuración de VoLTE.
* El flujo de voz con 5QI 1 necesita un scheduling y un DRX pensados para paquetes pequeños y periódicos, porque una mala configuración se traduce en jitter y pérdida de paquetes.
* El EPS Fallback, donde todavía se usa, agrega tiempo de establecimiento y debe medirse por separado del VoNR nativo.
* Los KPIs deben cubrir accesibilidad, retención, tiempo de establecimiento y calidad de voz extremo a extremo, más allá del éxito de RRC.

Otro detalle que veo seguido es que las fallas de voz se escalan entre RAN, core e IMS sin que nadie tenga la traza completa. El ingeniero que entienda bien cómo se comporta la llamada en el acceso puede llegar al diagnóstico en horas en lugar de días.

VoNR no es solo activar una función. Es una nueva responsabilidad para el equipo RAN, y conviene asumirla desde el diseño.

#VoNR #5G #5GSA #RAN #RFOptimization #IMS #TelecomInnovation
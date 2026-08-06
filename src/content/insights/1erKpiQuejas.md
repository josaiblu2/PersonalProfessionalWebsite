---
title: "El KPI que primero reviso cuando recibo una queja de usuarios"
pubDate: 2026-08-05
description: "Descubre por qué el primer KPI que reviso ante una queja de usuarios no es la cobertura, sino el que mejor refleja la experiencia real del cliente."
image: "fist-kpi-quejas.png"
imageAlt: "Un equipo de ingenieros de telecomunicaciones reunido alrededor de una mesa revisando mapas impresos de cobertura, reportes de rendimiento y gráficos de tráfico móvil mientras analizan la causa raíz de una queja de usuarios, en un ambiente profesional y realista."
---

# El KPI que primero reviso cuando recibo una queja de usuarios

Cuando un operador recibe quejas de los usuarios, la presión por encontrar una respuesta rápida suele ser muy alta.
La primera reacción muchas veces es abrir el mapa de cobertura y revisar el RSRP.
Después de todo, si la señal es baja, parecería lógico pensar que ahí está el problema.

Sin embargo, después de muchos años trabajando en optimización de redes móviles, aprendí que esa no suele ser mi primera parada.
De hecho, el primer KPI que reviso no habla de la red.
Habla del usuario.
Antes de analizar cobertura, me interesa entender si la experiencia del usuario realmente se está viendo afectada.
Por eso, normalmente comienzo revisando indicadores como el throughput experimentado por el usuario, especialmente en percentiles altos (P95), junto con métricas de accesibilidad y retainability.

¿Por qué?
Porque una buena cobertura no garantiza una buena experiencia.

He visto celdas con excelentes niveles de RSRP donde los usuarios sufrían velocidades muy bajas debido a congestión.
También he visto zonas con señales relativamente débiles donde el servicio era completamente satisfactorio gracias a una buena gestión de los recursos de radio.
La cobertura explica una parte de la historia.
Pero rara vez cuenta la historia completa.
Después continúo con otras preguntas:

* ¿La celda presenta altos niveles de utilización de PRB?
* ¿Existe un desbalance de carga con las celdas vecinas?
* ¿Hay problemas de movilidad que estén concentrando usuarios donde no deberían?
* ¿Se observan fallas de accesibilidad o un incremento en las desconexiones?
* ¿El problema es persistente o aparece únicamente durante las horas de mayor demanda?

Responder estas preguntas permite construir una hipótesis antes de empezar a modificar parámetros o planear expansiones.
Con la llegada de plataformas SON y posteriormente de soluciones basadas en SMO y rApps, este análisis ha evolucionado considerablemente.
Hoy podemos correlacionar cientos de métricas casi en tiempo real y detectar patrones que antes requerían horas de investigación manual.

Pero el principio sigue siendo exactamente el mismo.
La tecnología puede acelerar el análisis.
La experiencia sigue guiando las preguntas correctas.

Al final, la optimización no consiste en reaccionar al KPI que se ve peor en un dashboard.
Consiste en identificar cuál de ellos explica realmente el problema.
Porque cuando entendemos la causa raíz, la solución deja de ser una apuesta y se convierte en una decisión técnica fundamentada.
Y muchas veces, esa diferencia es la que separa una optimización temporal de una mejora sostenible.

¿Y ustedes?
Cuando reciben una queja de usuarios, ¿cuál es el primer KPI que revisan y por qué?

#RAN #RANOptimization #KPIs #5G #SON #cSON #SMO #NetworkAutomation #Telecom #ExperienciaDelUsuario #Ingeniería
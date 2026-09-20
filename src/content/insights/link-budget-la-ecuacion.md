---
title: "LINK BUDGET: LA ECUACIÓN QUE DEFINE TU COBERTURA ANTES DE ENCENDER UN SITIO"
pubDate: 2026-09-09
description: "Domina el Link Budget para estimar cobertura, pérdidas, ganancias y márgenes antes de desplegar una red LTE o 5G."
image: "LinkBudgetLaEcuacion.png"
imageAlt: "Diagrama técnico de Link Budget para una red celular LTE y 5G mostrando estación base, EIRP, pérdidas de propagación, ganancias de antena, usuario y potencia recibida."
linkedinUrl: "https://www.linkedin.com/posts/salvador-ibarra-luna_rfengineering-ran-linkbudget-activity-7503474863467212802-pXWA?utm_source=share&utm_medium=member_desktop&rcm=ACoAAAHdUJ4B2MN4INncxmIAgZdmF3VYSr1J55o"
---

# LINK BUDGET: LA ECUACIÓN QUE DEFINE TU COBERTURA ANTES DE ENCENDER UN SITIO

Antes de instalar una antena.
Antes de hacer un drive test.
Antes de revisar RSRP, SINR o throughput.
Ya deberíamos tener una buena idea de hasta dónde puede llegar nuestra cobertura.
¿Cómo?
Con una de las herramientas más básicas y poderosas de RF: el Link Budget.
En términos simples, un Link Budget contabiliza todo lo que ganamos y perdemos desde que la señal sale del transmisor hasta que llega al receptor.
La lógica parece sencilla:
Potencia transmitida + ganancias − pérdidas = potencia recibida.
Pero detrás de esa ecuación hay prácticamente una historia completa de RF.

* La potencia de transmisión determina con cuánta energía comenzamos el enlace.
* La ganancia de antena ayuda a concentrar esa energía en determinadas direcciones.
* Las pérdidas en feeders, conectores y otros elementos reducen parte de esa potencia antes de radiarla.
* La propagación introduce pérdidas por distancia, frecuencia, obstáculos, penetración y características del entorno.
* La sensibilidad del receptor establece finalmente qué tan débil puede ser la señal antes de que la comunicación deje de ser confiable.

Y todavía necesitamos algo más: margen.
Porque una red celular no opera en condiciones ideales.
Hay edificios, vegetación, vehículos, usuarios indoor, fading y muchas otras variables que hacen que una predicción perfecta en papel pueda convertirse en una experiencia muy diferente en campo.
Por eso el Link Budget no debería responder solamente:
"¿Hasta dónde llega mi señal?"
Debería ayudarnos a responder:
"¿Hasta dónde puedo mantener un servicio confiable bajo las condiciones para las que estoy diseñando?"
Y aquí aparece un error importante.
El Link Budget debe analizarse en ambas direcciones.
Puedes tener suficiente potencia desde la estación base hacia el usuario y, aun así, descubrir que el UE no tiene suficiente margen para cerrar correctamente el uplink.
En ese caso, la cobertura real no necesariamente termina donde deja de escucharse el sitio.
Puede terminar donde el sitio deja de escuchar al usuario.
Esta idea sigue siendo fundamental en LTE, 5G y seguirá siéndolo en las generaciones que vengan.
Podemos tener Massive MIMO, beamforming, automatización, AI y herramientas de planificación cada vez más sofisticadas.
Pero ninguna tecnología elimina la física del enlace.
Después de muchos años trabajando en diseño y optimización de redes, sigo considerando el Link Budget una de esas bases que todo ingeniero RAN debería dominar.
Porque antes de optimizar una red...
primero tenemos que entender si el enlace puede existir.

**La cobertura comienza mucho antes del primer drive test.**

#RFEngineering #RAN #LinkBudget #5G #LTE #RANDesign #Telecom
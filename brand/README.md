# Brand

Archivos maestros de la identidad visual de salvadoribarra.tech.
Esta carpeta **no se publica**: queda fuera de `public/`, así que Astro no la sirve.

| Archivo | Qué es |
|---|---|
| `salvador-ibarra-monogram-master.png` | Monograma "SI", 2048x2048, turquesa sobre azul marino. Es el original del que se generó todo el juego de favicons de `public/` (favicon.ico, favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png, favicon.svg). Úsalo como fuente para cualquier logo en alta resolución: presentaciones, tarjetas, perfiles. |
| `favicon-original-con-c2pa.svg` | Copia del `favicon.svg` tal como estaba antes de limpiarlo. Se conserva solo por si hiciera falta revertir. |

## Nota sobre `public/favicon.svg`

El SVG original pesaba 8,825 bytes, de los cuales 7,736 eran un manifiesto C2PA
incrustado en `<metadata>` y solo 1,089 el dibujo. Se eliminó ese bloque porque
era peso muerto en un recurso que carga en todas las páginas del sitio. El
vector quedó intacto: mismo `viewBox` y las mismas dos formas.

Si regeneras los favicons a partir del PNG maestro, revisa que el SVG resultante
no vuelva a traer el bloque `<metadata>`.

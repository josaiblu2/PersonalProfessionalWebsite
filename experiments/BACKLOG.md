# Backlog de Optimizacion -- AI Closed-Loop Website Optimization

Este archivo registra hallazgos y mejoras identificadas que aun no se convierten en un experimento formal (EXP-XXX). Cada item sigue el formato requerido por Work Project Instructions v1.6 (OBSERVATION, EVIDENCE, IMPACT, RECOMMENDATION, PRIORITY, RISK, REUSABILITY), mas Status y fecha de registro. Antes de iniciar cualquier sesion de trabajo, revisar este archivo junto con el ledger de /experiments/ para determinar el estado actual del sistema.

---

## BL-001 -- Proteccion anti-spam en formularios de Netlify Forms

**Status:** Abierto -- agendado para proxima iteracion (no urgente, importante)
**Registrado:** 2026-09-22

**Observation:** Ninguno de los dos formularios en produccion (`contact` y `cv-request`, ambos via Netlify Forms) tiene proteccion anti-spam activa. Ambos son formularios publicos accesibles por cualquier visitante o bot.

**Evidence:** Revision del codigo de ambos formularios (`Contact.astro`, `Hero.astro` / modal de CV) confirma que no se implemento el atributo honeypot nativo de Netlify (`data-netlify-honeypot`) ni ningun otro mecanismo (reCAPTCHA, rate limiting, validacion adicional). Salvador pregunto explicitamente donde se almacenan los correos capturados por `cv-request` (respuesta: en el panel de Netlify Forms, sin base de datos propia), lo cual expuso esta brecha durante la revision.

**Impact:** Riesgo de que envios de spam/bots contaminen la lista de correos capturados en `cv-request` (pensada para generar leads reales de oportunidades profesionales) y el buzon de notificaciones del formulario `contact`. Impacto indirecto en la calidad de datos usada para medir el KPI Tier 1 (descargas de CV / contactos), pudiendo inflar artificialmente los conteos de EXP-002 y EXP-003 si no se corrige antes de que el volumen de spam sea significativo.

**Recommendation:** Agregar el campo honeypot nativo de Netlify Forms (`data-netlify-honeypot="bot-field"` en el `<form>` + campo oculto correspondiente) a ambos formularios. Es la mitigacion mas simple, sin costo, sin dependencias externas, y sin fricción para el usuario real. Evaluar tambien si conviene revisar periodicamente el panel de Forms de Netlify en busca de patrones de spam antes de invertir en algo mas robusto (reCAPTCHA) si el honeypot no fuera suficiente.

**Priority:** Media (importante, no urgente -- confirmado por Salvador).

**Risk:** Bajo. Cambio aislado, no toca la logica de negocio ni los eventos de GA4 ya instrumentados; debe seguir el flujo completo de gobernanza (Proposal -> Aprobacion -> Build local -> Rama -> PR -> Merge) antes de tocar produccion.

**Reusability:** Alta -- el mismo patron (honeypot) aplica igual a cualquier formulario futuro de Netlify Forms en este u otros proyectos con la misma arquitectura (framework reusable segun el Contexto Estrategico del proyecto).

---

## BL-002 -- Tags HTML sin cerrar al final de Contact.astro

**Status:** Abierto -- pendiente de priorizacion
**Registrado:** 2026-09-22 (detectado originalmente durante Fase 1, Tarea 2)

**Observation:** `Contact.astro` presenta una estructura preexistente con un `<div>`/`<section>` sin cerrar correctamente al final del archivo.

**Evidence:** Observado al instrumentar el evento GA4 del formulario de contacto (EXP-002); no se corrigio en ese momento para mantener el diff de esa tarea minimo y enfocado en una sola variable (Causal Discipline).

**Impact:** Bajo riesgo funcional inmediato (los navegadores toleran HTML mal cerrado y el renderizado actual no muestra problemas visibles), pero es deuda tecnica que podria complicar futuras modificaciones de este componente.

**Recommendation:** Corregir en un ciclo futuro de mantenimiento/limpieza tecnica, como cambio aislado de una sola variable, no combinado con cambios funcionales.

**Priority:** Baja.

**Risk:** Bajo.

**Reusability:** N/A (fix especifico de este archivo).

---

## BL-003 -- Cache de build de Netlify para el pipeline de optimizacion de imagenes

**Status:** Abierto -- agendado para proxima iteracion (no urgente, importante)
**Registrado:** 2026-09-23 (detectado durante EXP-004b, migracion de imagenes)

**Observation:** No existe archivo `netlify.toml` en el repositorio, por lo que no hay configuracion explicita de cache de build. A partir de EXP-004a/EXP-004b, cada build de produccion procesa con Sharp las imagenes de los posts que usan el nuevo campo `coverImage` (141 posts tras la migracion), algo que antes no ocurria (0 imagenes procesadas por build).

**Evidence:** Validacion local de EXP-004b: un build limpio (sin cache) con las 141 imagenes reales excede varios minutos de procesamiento solo en la etapa de optimizacion de imagenes (estimado >3 minutos, extrapolado de una muestra real de 3 imagenes pesadas). Sin persistencia del cache de imagenes de Astro entre builds de Netlify, este costo se repetiria en cada deploy futuro, incluso para cambios que no toquen imagenes (ej. una correccion de texto en un solo post).

**Impact:** Incremento en el tiempo de build de Netlify en cada deploy, lo cual consume minutos de build que forman parte del modelo de creditos del proyecto (300 creditos/mes). Si no se cachea, este costo se paga de forma innecesaria y repetida en cada iteracion futura, incluso cuando ninguna imagen cambio.

**Recommendation:** Configurar el cache de build de Netlify (via `netlify.toml`, seccion `[build]` con `cache` o el mecanismo equivalente vigente en la documentacion de Netlify al momento de implementar) para persistir el directorio de cache de imagenes de Astro (tipicamente bajo `.astro/` o `node_modules/.astro/` -- confirmar la ruta exacta segun la version de Astro en uso al implementar) entre builds. Esto evitaria reprocesar imagenes que no cambiaron desde el build anterior.

**Priority:** Media (importante, no urgente -- confirmado por Salvador).

**Risk:** Bajo. Cambio de configuracion de infraestructura de build, no toca codigo de la aplicacion ni contenido. Debe validarse que el cache efectivamente reduce el tiempo de build en un Deploy Preview real antes de confiar en el ahorro de creditos.

**Reusability:** Alta -- aplica a cualquier proyecto Astro/Netlify que use optimizacion de imagenes en build.

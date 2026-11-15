# EXP-001 — Corrección de mailto placeholder en Hero.astro

## Experiment ID
EXP-001

## Observation
El botón "Contact for Collaboration" en Hero.astro usaba un mailto de plantilla nunca reemplazado (contact@example.com), mientras que Footer.astro ya usaba correctamente el correo real.

## Evidence
Hallazgo del Website Baseline Assessment v1.0 (Fase 0), confirmado por inspección directa del código: `grep -rn "contact@example.com" src/` solo arrojaba src/components/Hero.astro:19.

## Hypothesis
Corregir el mailto elimina un punto de fuga de contactos calificados (Tier 1) causado por un error de configuración, sin necesidad de ninguna otra intervención.

## Target KPI
Tier 1 — clics de contacto por correo desde el Hero.

## Guardrail KPI
Ninguno relevante (cambio de un solo atributo href, sin efecto en layout ni en otros flujos).

## Baseline
0 clics de contacto atribuibles al botón del Hero (el mailto no era funcional para contacto real).

## Proposed change
Reemplazar `mailto:contact@example.com` por `mailto:josaiblu2@yahoo.com.mx` en src/components/Hero.astro, línea 19. Cambio de una sola línea.

## Pre-change commit hash
1aacc4159389af4c4597c531110ec49d22b0fb6c

## Risk
Mínimo. Un solo atributo, sin lógica ni dependencias.

## Approval status
Aprobado explícitamente por Salvador en sesión de chat, 2026-09-21 (Fase 1, Tarea 1).

## Implementation reference
Rama: fix/hero-mailto-placeholder

## Measurement window
No aplica ventana de medición formal (corrección de error, no experimento A/B). Verificación cualitativa: confirmar en producción tras el deploy que el enlace abre el cliente de correo con la dirección correcta.

## Result
Pendiente de deploy.

## Decision
Pendiente.

## Learning
Pendiente.

## Cierre documental (auditoria estrategica, 2026-11-14)
Nota aditiva: no modifica ningun campo anterior de este ledger. Fuente: revision critica de EXP-001 a EXP-018 de la auditoria estrategica 2026-11 (detalle en la carpeta de auditoria, fuera de git). La decision final de cada cierre es de Salvador.
- **Estado:** el cambio esta en produccion y corrigio un defecto real (el boton del hero apuntaba a un correo de plantilla). El campo Result "Pendiente de deploy" quedo desactualizado.
- **KPI:** el KPI objetivo (clics de contacto por correo desde el Hero) nunca se instrumento: no existe un evento para ese clic, por lo que no hay medicion posible, ni retroactiva.
- **Cierre propuesto:** cerrar como correccion sin KPI (KEEP). La instrumentacion pasa a BL-018 (`mailto_click`).
- **Learning propuesto:** una correccion cuyo KPI es un clic debe instrumentar ese clic en el mismo cambio.

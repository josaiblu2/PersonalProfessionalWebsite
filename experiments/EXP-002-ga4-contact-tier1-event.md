# EXP-002 — Evento GA4 Tier 1 en envio de formulario de contacto

## Experiment ID
EXP-002

## Observation
El formulario de contacto (Netlify Forms, name="contact") no disparaba ningun evento GA4 al enviarse con exito; solo se registraba un pageview generico en /success/.

## Evidence
Hallazgo del Website Baseline Assessment v1.0 (Fase 0). Confirmado por inspeccion: Contact.astro no contenia ningun <script>, y GoogleAnalytics.astro solo carga gtag.js de forma global sin eventos personalizados.

## Hypothesis
Instrumentar un evento GA4 dedicado y claramente distinguido como conversion Tier 1 en el envio del formulario permite medir de forma confiable el canal de contacto, que es uno de los KPIs Tier 1 primarios del proyecto (contacto/WhatsApp/email).

## Target KPI
Tier 1 — envios del formulario de contacto.

## Guardrail KPI
Tasa de envio exitoso del formulario de contacto (no debe degradarse; el mecanismo de envio nativo no se modifica).

## Baseline
0 eventos GA4 personalizados asociados al envio del formulario de contacto.

## Proposed change
Se agrega un listener al evento 'submit' del formulario en Contact.astro que dispara gtag('event', 'tier1_contact_conversion', {event_category: 'Tier1_Conversion', event_label: 'contact_form', transport_type: 'beacon'}). No se modifica el mecanismo de envio nativo de Netlify Forms (sigue siendo un POST nativo con redireccion del navegador a /success/). Se elige transport_type: 'beacon' (via navigator.sendBeacon) para garantizar que la peticion de analitica se encole antes de que la navegacion la interrumpa, sin necesidad de interceptar el submit.

## Pre-change commit hash
1aacc4159389af4c4597c531110ec49d22b0fb6c

## Risk
Bajo. Una sola variable modificada (instrumentacion), sin tocar el flujo de envio/redireccion existente. Riesgo residual: el evento se dispara en el intento de envio, no en confirmacion explicita post-respuesta de Netlify (aceptado como equivalente en la practica, ya que un POST fallido no llega a /success/).

## Approval status
Aprobado explicitamente por Salvador en sesion de chat, 2026-09-21 (Fase 1, Tarea 2, Opcion A).

## Implementation reference
Rama: feat/ga4-contact-tier1-event

## Measurement window
Ciclo de revision bisemanal por defecto (2 semanas) a partir del deploy a produccion.

## Result
Pendiente de deploy y medicion.

## Decision
Pendiente. Accion manual requerida de Salvador: marcar 'tier1_contact_conversion' como Key Event en GA4 Admin (el agente no tiene permiso para alterar configuracion de analitica).

## Learning
Pendiente.

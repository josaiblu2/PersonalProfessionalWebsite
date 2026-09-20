---
title: "SON IS NOT DEAD: WHY CLOSED LOOP NEEDS SMO GUARDRAILS"
pubDate: 2026-09-28
description: "Explore why SON still matters and how SMO guardrails, policies, conflict detection and rollback make closed loop automation safe in O-RAN networks."
image: "son-is-not-dead.jpeg"
imageAlt: "Futuristic RAN automation architecture with an SMO orchestration layer governing rApps, xApps and self organizing network loops over a 5G cell grid, with guardrail boundaries, in deep blue and teal tones"
---

# SON IS NOT DEAD: WHY CLOSED LOOP NEEDS SMO GUARDRAILS

Every few months someone tells me SON is old news and that AI and rApps will replace it. I disagree. SON solved real problems in the field, and most of what we call new closed loop automation is SON with better data and a wider scope.

The problem was never the idea. It was coordination. Anyone who ran multiple SON functions in the same cluster has seen this: MRO pushes handover offsets in one direction, MLB pushes them back, energy saving switches off a layer that capacity needed, and the KPIs oscillate for days before anybody understands why.

This is where the SMO changes the game in O-RAN. It gives closed loops a place to be governed as well as executed:

* Policies define the limits for every parameter a rApp or xApp is allowed to change, so no loop can push a cell outside its validated range.
* Conflict detection between rApps and xApps that touch the same objects prevents two optimizers from fighting over one handover parameter.
* Automatic rollback triggered by KPI degradation returns the network to its last stable state before users notice.
* Audit trails record what changed, why and with which data, which is what makes engineers and managers trust the automation.

Distributed SON still has its place for fast local decisions. The SMO adds the layer above it that sets the rules of the game.

My advice to RAN teams: before deploying one more optimization use case, write down what the loop is allowed to touch and what should stop it. That short list is often the most valuable design document of the project.

#SON #SMO #ORAN #RAN #rApps #xApps #NetworkAutomation #TelecomInnovation
---
title: "Closed-Loop Readiness Scorecard: 8 Checks Before a Loop Touches the Live Network"
pubDate: 2026-11-23
description: "A practical scorecard to rate any closed loop, SON function, rApp or AI agent before it gets write access to a live RAN: eight checks, red flags and a 0 to 16 score."
coverImage: "./closed-loop-readiness-scorecard.webp"
imageAlt: "Closed loop diagram around a 5G cell tower with an eight item readiness checklist"
---

A closed loop is only as safe as the questions someone asked before giving it write access to the network. In [SON Is Not Dead](/insights/son-is-not-dead/) I argued that the old SON problem was coordination, not the idea. This scorecard is the practical side of that argument: eight checks I would run on any loop, whether it is a classic SON function, an rApp or an AI agent.

## How to use it

Score each check from 0 to 2:

- **0:** not defined, or the answer is "we will see in production".
- **1:** defined on paper, not yet tested.
- **2:** defined, tested, and someone in operations can explain it.

## The scorecard

| # | Check | The question to ask | Red flag |
|---|---|---|---|
| 1 | Observability | Can the loop see the problem with data operations already trusts (counters, traces, alarms) at the right granularity? | The loop reads KPIs nobody has validated, or with a delay longer than its own decision cycle. |
| 2 | Verification window | How long does the loop wait after acting before it judges the result? | It evaluates the next interval only, so traffic noise looks like success or failure. |
| 3 | Rollback trigger | What exact condition reverts the change, and is the previous value stored? | "We roll back manually if someone complains." |
| 4 | Blast radius | How many cells, carriers or parameters can a single decision touch? | No limit per decision, or a cluster wide change on the first run. |
| 5 | Conflict domain | Which other loops write to the same objects or influence the same KPI? | MRO, MLB and energy saving all act on the same cells and nobody listed it. |
| 6 | Precedence | When two loops want opposite actions, who wins and who waits? | The last writer wins, and the KPIs oscillate. |
| 7 | Audit trail | Can you reconstruct what changed, when, why and with which input data? | The only record is the parameter value in the OSS. |
| 8 | Human override | Can an engineer freeze the loop, or one cell, in one step without a code change? | Stopping the loop needs a ticket to the vendor or a redeploy. |

## Reading your score

| Score | What it means | Where it sits |
|---|---|---|
| 0 to 6 | Not a closed loop yet. Keep it as a recommendation engine with a human approving each change. | Level 2, workflow automation |
| 7 to 11 | Ready for supervised closed loop on a small cluster, with rollback on and a short list of parameters. | Level 3, policy driven |
| 12 to 16 | Ready to scale, with periodic review of thresholds and conflicts. | Level 4, closed loop |

The levels come from [Network Automation Maturity: From Scripts to Closed Loops](/insights/net-automation-maturity/). Any single 0 on checks 3, 5 or 8 should block a production rollout, whatever the total.

## Why checks 5 and 6 matter most

Most of the damage attributed to SON came from loops that were individually correct and collectively unstable. The SON platform I worked with resolved this with an arbiter module: precedence between applications was configured by an administrator, and when two functions wanted the same cell, the losing change was discarded and could only return in a later cycle, once the blocking action had finished. That is checks 5 and 6, implemented.

The SMO gives O-RAN the same place to govern this above the individual rApps: policies, conflict detection and precedence rules. If your scorecard is weak on 5 and 6, start there before improving any model. [Network Slicing: The Ultimate Test for Closed-Loop Automation](/insights/network-slicing-automation/) shows how fast this gets harder when slices compete for the same resources.

If you are rating a loop on your own network and want a second opinion, [get in touch](/#contact).

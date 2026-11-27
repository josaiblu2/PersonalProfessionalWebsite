---
title: "Closed-Loop Verification Window: How Long to Wait Before Trusting a KPI"
pubDate: 2026-11-23
description: "Size the verification window a closed loop needs before trusting a KPI, with the sample size math, two worked cell examples and a table by KPI family."
coverImage: "./closed-loop-verification-window.webp"
imageAlt: "Horizontal timeline of sequential measurement periods next to a 5G cell site, with one span highlighted as the closed-loop verification window"
linkedinUrl: "https://lnkd.in/p/e7jHh4t8"
---

A closed loop has three jobs: see a problem, act on it, and decide whether its own action helped. The third one is where most designs are thin. The question "how long do we wait before reading the KPI" usually gets answered by whatever the reporting period happens to be, and that is how a loop ends up congratulating itself on traffic variation.

In the [Closed-Loop Readiness Scorecard](/insights/closed-loop-readiness-scorecard/) this is check 2, the verification window. What follows is the arithmetic behind that check, including the part that tends to surprise people: for some cells, the honest answer is that no verification window is short enough.

## Why the reporting period is the wrong unit

3GPP performance management collects counters over a granularity period, and the result output period most RAN vendors expose is 15 minutes. The specification allows other values, and 5 minutes is common while troubleshooting. Either way, that period is a decision about how often measurement files get written. It carries no promise that the counts inside one file are enough to support a conclusion.

Two details in the specification make the point sharper.

A measurement record can carry a **suspect flag**, raised when the collection could not be guaranteed for the whole period. 3GPP defines the conditions for setting it, which is itself a signal: the standard anticipated that some records arrive untrustworthy. A loop that averages flagged records alongside clean ones inherits the problem without noticing.

The accuracy requirements also distinguish between a result that covers a whole granularity period and one that covers only part of it, and they require that a procedure started inside a period be counted in that same period even when it finishes in the next one. Rules like that exist because boundary effects were a real source of wrong numbers.

So the reporting period tells you when data arrives. Sample volume tells you when it means something.

## The arithmetic: how many samples before a delta is real

Take a mobility loop that nudges a handover offset and wants to know whether handover success rate changed. That is a comparison of two proportions, and the sample size needed per side is approximately:

```
n = (z_alpha + z_beta)^2 * [ p1(1-p1) + p2(1-p2) ] / (p1 - p2)^2
```

At 95 percent confidence and 80 percent power, `(1.96 + 0.84)^2 = 7.84`. To separate a 98.0 percent success rate from a 97.0 percent one:

```
n = 7.84 * (0.0196 + 0.0291) / (0.01)^2
n = 7.84 * 0.0487 / 0.0001
n = about 3,800 handover attempts per side
```

Now put that number against two real traffic profiles.

| | Busy urban cell | Quiet rural cell |
|---|---|---|
| Handover attempts per 15 min period | 200 | 20 |
| Attempts needed per side, 1 point delta | 3,800 | 3,800 |
| Measurement periods needed | 19 | 190 |
| Elapsed time, counting every hour | about 5 hours | about 48 hours |
| Elapsed time, busy hour only | about 5 busy days | about 7 busy weeks |
| Honest verdict | Supervised closed loop is viable | Recommendation mode only at this granularity |

Three conclusions come out of that table.

First, the loop that evaluates the next period is not being aggressive, it is reading noise. Nineteen periods is already the optimistic case, and only if traffic is comparable across all of them.

Second, the required window scales with the square of the sensitivity. Chasing a 0.5 point delta instead of 1 point multiplies the attempts needed by four, so roughly 15,000 attempts per side. Any loop that advertises fine grained optimization on thin traffic is selling arithmetic it cannot deliver.

Third, low traffic cells are structurally outside autonomous optimization at cell level and at small deltas. That is a property of the traffic, so a better model, more features or a transformer architecture change nothing about it. The fix is aggregation or a bigger threshold, never a smarter algorithm.

## A verification window by KPI family

Different KPI families are limited by different things, so one global timer across a whole rApp portfolio is a design shortcut that costs accuracy.

| KPI family | What actually drives the window | Sensible minimum | The usual trap |
|---|---|---|---|
| Accessibility and retainability | Volume of attempts and of established sessions | Enough attempts for the target delta, by the formula above | Applying a cell level window to cells whose volume differs by an order of magnitude |
| Mobility | Attempt volume per adjacency, not per cell | Several busy hours per relevant neighbour pair | Cell level aggregation hides the one pair that broke |
| Throughput and latency percentiles | Stability of the distribution tail, which needs far more samples than a mean | Several busy hours, compared percentile against percentile | Comparing averages, which stay flat while the tail degrades |
| Energy and sleep features | A complete load cycle | 24 hours minimum, 7 days to separate weekday from weekend | Validating an overnight feature with daytime data |
| Coverage and interference | Geographic sampling, not only time | Days, or a measurement campaign | Treating a counter average as spatial evidence |

## When the window is longer than the loop's cadence

This is the architectural consequence, and it is worth stating plainly: a loop may be structurally unable to verify its own actions, because its decision cadence is shorter than the evidence it would need.

A Near-RT RIC xApp acting in the 10 ms to 1 s range cannot validate a one point KPI delta inside its own cycle. Nothing is broken about that, as long as the design is honest about the division of labour. The fast loop is judged by fast signals, such as queue state or immediate radio conditions, while the slower verification of whether the policy was correct belongs above it, in the Non-RT RIC and the SMO, where a window of hours is natural. If you are still placing functions across those loops, [De SON a rApps](/insights/de-son-a-rapps-mapeo-funciones/) lays out where each one can live.

When the window still does not fit, there are only four honest moves:

- Raise the detection threshold until the delta is measurable in the time you have.
- Aggregate across similar cells and verify at cluster level, accepting that you lose per cell attribution.
- Move verification to a slower loop and let the fast loop act under a policy it does not get to grade.
- Keep the function in recommendation mode for the cells where the arithmetic does not close.

All four are defensible. What is not defensible is a loop with a 15 minute verification window on a cell that needs two weeks, because that loop will keep acting and will keep reporting success. The maturity levels in [Network Automation Maturity](/insights/net-automation-maturity/) stop being descriptive at exactly this point and start being a constraint.

If you are sizing verification windows for a real automation programme and want a second opinion on where the arithmetic closes, [let's talk](/#contact).

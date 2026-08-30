---
title: "How I Decide Whether A Problem Is RF Or Core"
pubDate: 2026-08-10
description: "Learn a structured approach to determine whether a network issue originates in the RAN or the Core by correlating user experience, KPIs, and system behavior."
image: "rf-or-core.jpeg"
imageAlt: "Telecom engineers conducting a cross-functional troubleshooting session around a conference table with printed network topology maps, end-to-end service flow diagrams, KPI reports, and incident timelines, collaboratively identifying whether a performance issue originates in the RAN or the Core network."
linkedinUrl: "https://www.linkedin.com/posts/salvador-ibarra-luna_ran-corenetwork-ranoptimization-activity-7492595662019076096-Kj7k?utm_source=share&utm_medium=member_desktop&rcm=ACoAAAHdUJ4B2MN4INncxmIAgZdmF3VYSr1J55o"
---

# How I Decide Whether A Problem Is RF Or Core

One of the most common mistakes in network troubleshooting is trying to solve the problem before identifying where it actually originates.
A customer reports poor performance.
The alarms start coming in.
The pressure to restore service is high.
And almost immediately, teams begin asking:
"Is it an RF issue or a Core issue?"

After years working in RAN optimization, I've learned that answering this question too quickly often sends the investigation down the wrong path.
Instead of looking for answers first, I look for patterns.
The first question I ask is simple:
"Is the problem tied to a location, or does it follow the user?"
If multiple users experience the issue only within a specific sector or cell, RF immediately becomes a strong candidate.
If the same user encounters the problem across different sites and coverage areas, my attention shifts toward the transport network, the Core, or even the service platform.
The second question is:
"Which services are actually affected?"
If voice, data, and messaging are all degraded simultaneously, the issue may extend beyond the radio layer.
If only one service is impacted while others remain stable, the investigation becomes much more focused.
Next comes correlation.
I compare user complaints with network behavior.

* Are accessibility KPIs degrading?
* Has retainability suddenly changed?
* Is throughput dropping while radio conditions remain healthy?
* Are handover success rates stable?
* Are latency or packet loss increasing even when RF indicators look normal?

Experience has taught me that KPIs should never be analyzed in isolation.
Excellent RSRP doesn't always mean a good user experience.
High PRB utilization doesn't necessarily mean the network needs more capacity.
A successful RRC connection doesn't guarantee an end-to-end healthy session.

The real story appears when multiple indicators begin to align.
That's why technologies like cSON—and today SMO with AI-driven analytics—are so valuable.
They correlate thousands of events, KPIs, and network conditions, dramatically reducing the time needed to identify the most likely root cause.
But one principle hasn't changed.
Automation can accelerate diagnosis.
Engineering judgment determines whether that diagnosis is correct.
The objective isn't simply to identify a faulty KPI.
It's to understand the chain of events that produced it.
Because once you identify the real source of the problem, the solution often becomes much more obvious.

*How do you approach this challenge?*
When network performance degrades, what helps you determine whether you're dealing with an RF issue, a Core issue, or something in between?

#RAN #CoreNetwork #RANOptimization #5G #NetworkAutomation #SMO #cSON #Telecommunications #Troubleshooting #RootCauseAnalysis #EngineeringLeadership
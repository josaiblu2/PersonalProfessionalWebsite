---
title: "Why ANR is not a “set and forget” solution"
pubDate: 2026-03-25
description: "This post explains why Automatic Neighbor Relations (ANR) is not a fully autonomous solution and highlights how improper configuration and lack of supervision can negatively impact mobility and overall network performance."
image: "anr.jpeg"
linkedinUrl: "https://www.linkedin.com/posts/salvador-ibarra-luna_5g-ran-son-share-7441989477612457984-TWDe?utm_source=share&utm_medium=member_desktop&rcm=ACoAAAHdUJ4B2MN4INncxmIAgZdmF3VYSr1J55o"
---

# Why ANR is not a “set and forget” solution

After discussing Dynamic Load Balancing in my previous post, there is one thing that becomes clear very quickly:
DLB is only as good as the neighbor relations it relies on.

And that brings us to one of the most underestimated features in modern RAN: Automatic Neighbor Relations (ANR).
On paper, ANR sounds like a dream. The network automatically discovers, adds, and optimizes neighbor relations. Less manual work, faster deployment, better scalability.

But in reality… ANR is far from being a “set and forget” solution.
Over the years, I have seen networks where ANR was enabled with minimal supervision, under the assumption that automation would take care of everything. The result? A silent degradation of mobility performance.

Here are some common misconceptions:

• * Many assume ANR always adds the “right” neighbors, when in reality it only adds what it detects, not necessarily what is optimal.
• * It is often believed that more neighbors mean better mobility, without considering the increase in signaling and decision complexity.
• * Engineers expect ANR to clean inefficient relations automatically, but stale or suboptimal neighbors often remain active.
• * In multi-vendor environments, ANR behaviors can differ significantly, leading to inconsistencies across the network.

In practice, poorly controlled ANR can introduce subtle but critical issues:

• * It can create missing neighbor scenarios in high-mobility areas, directly impacting handover success rates.
• * It can overload neighbor lists with low-value relations, increasing UE measurement burden.
• * It can degrade DLB effectiveness by providing inaccurate or suboptimal target cells.
• * It can hide underlying design problems, such as poor site placement or incomplete planning.

So what should we expect from ANR?

ANR is not a replacement for RF design. It is an enhancement tool.
From my experience, it works best when:

• * There is a solid baseline of planned neighbors before enabling automation.
• * Clear policies exist to control addition, removal, and prioritization of neighbors.
• * Continuous monitoring is performed to validate mobility KPIs and detect anomalies.
• * It is integrated with a broader optimization strategy, not treated as an isolated feature.

As networks evolve towards O-RAN and SMO-driven automation, ANR will become more sophisticated. But the principle remains unchanged:
Automation does not eliminate the need for engineering judgment.

Because in the end, the network does not understand “good” or “bad” neighbors…
It only understands what we allow it to learn.

#5G #RAN #SON #ANR #RANOptimization #ORAN #Telecom #NetworkOptimization #Mobility
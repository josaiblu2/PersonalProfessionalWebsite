---
title: "Slice Energy: Can we attribute energy costs per S-NSSAI?"
pubDate: 2026-03-20
description: "This post explores whether it’s feasible to attribute energy costs per network slice (S-NSSAI), and explains why it’s more of an allocation problem on shared infrastructure than a simple “measure watts and bill it” approach."
image: "slice-energy.png"
linkedinUrl: "https://www.linkedin.com/posts/salvador-ibarra-luna_5g-networkslicing-snssai-activity-7440781727142264832-K1eO?utm_source=share&utm_medium=member_desktop&rcm=ACoAAAHdUJ4B2MN4INncxmIAgZdmF3VYSr1J55o"
---

# Slice Energy: Can we attribute energy costs per S-NSSAI?

If energy is a KPI now, the next logical question is uncomfortable (and very business-relevant):
Can we assign an energy “cost” to each network slice (S-NSSAI)?
In theory, it sounds simple: measure watts, bill the slice.
In practice, slicing runs on shared infrastructure: radios, DU/CU pools, transport, UPF, and even cooling/power systems. When resources are shared, energy attribution becomes an accounting problem as much as a network problem.

*The key idea:* you don’t “measure slice energy” directly. You estimate it using allocation drivers that represent how much each slice consumes of shared resources.
Here’s a practical way to think about it:

•	* *Start with where energy is burned*, because RAN, compute, transport, and core don’t scale the same way with load.
•	* *Use a “fair” driver per domain*, because one slice may be light in throughput but heavy in signaling, mobility, or low-latency constraints.
•	* *Separate base vs variable cost*, because a big part of energy is “always-on” and must be allocated, not ignored.

Example drivers (not perfect, but useful to start):

•	* RAN: PRB usage, airtime share, or weighted throughput by QoS priority.
•	* DU/CU: CPU cycles, scheduler load, or per-slice processing counters.
•	* Transport/Core: Gbps carried, packets per second, or session counts (PDU sessions).

Why this matters: if you can estimate slice energy, you can build better pricing and better decisions:

•	* Premium slices can be priced with real cost visibility, not assumptions.
•	* Energy-heavy slices can be optimized with intent, not guesswork.
•	* Sustainability KPIs can be tied to products, not only to sites.

My take: slice energy attribution is possible, but it requires clear governance and consistent telemetry. Otherwise, you’ll end up “moving costs” instead of reducing them.

#5G #NetworkSlicing #SNSSAI #EnergyEfficiency #TelecomStrategy #RAN #5GCore #NetworkAutomation #SMO #ORAN
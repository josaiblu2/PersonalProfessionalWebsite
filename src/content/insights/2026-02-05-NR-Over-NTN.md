---
title: "NR Over Non-Terrestrial Networks: Can SON Work When The Network Is Moving?"
pubDate: 2026-02-05
description: "NR over Non-Terrestrial Networks (NTN) changes one of the most fundamental assumptions behind traditional SON."
image: "NROverNonTN.png"
linkedinUrl: "https://www.linkedin.com/feed/update/urn:li:activity:7425199070828273665/"
---

# NR Over Non-Terrestrial Networks: Can SON Work When The Network Is Moving?

NR over Non-Terrestrial Networks (NTN) changes one of the most fundamental assumptions behind traditional SON:
**the network topology is no longer static.**

In terrestrial RAN, cells are fixed, dominance areas are predictable, and mobility is driven mainly by the user. SON logic was built around those premises. NTN breaks all of them.

When satellites become part of the access network, the cell itself is moving. Coverage footprints shift continuously, propagation delays vary over time, and interference patterns evolve in ways that classical SON was never designed to handle.

This raises a critical question: can SON still work when the network is dynamic by nature?

Here is where the real challenges appear:

• Cell dominance and neighbor relations change constantly, making static neighbor lists and handover thresholds ineffective.
• Propagation delay and Doppler effects introduce variability that traditional KPI baselines cannot easily normalize.
• Mobility is no longer only a UE problem, because the access point itself is moving relative to the user.
• Coverage optimization becomes time-dependent, not location-dependent.
• Closed-loop actions risk oscillation if automation reacts without understanding orbital dynamics.

Release 17 makes NR-NTN technically possible, but it also exposes the limits of legacy SON approaches. Applying terrestrial optimization logic to a moving network leads to instability, false alarms, and counterproductive actions.

For SON to work in NTN environments, it must evolve:

• Automation must become predictive, not only reactive, incorporating satellite motion and coverage evolution into decision-making.
• Optimization logic must shift from cell-centric to service-centric behavior.
• Policies and guardrails must account for time-based and geometry-based constraints.
• Human-defined intent becomes more important than raw KPI thresholds.

The answer is not to abandon SON.
The answer is to redesign it for networks that are no longer anchored to the ground.

NR over NTN is not just a coverage extension.
It is a stress test for how intelligent and adaptive our automation frameworks really are.

If SON can operate in a moving network, it can operate anywhere.

#5G #NR #NTN #SON #NetworkAutomation #Release17 #RAN #SatelliteCommunications #TelecomEngineering

---
title: "Handover 101: When Should the Network Let a User Go? 5G Handover Parameters Explained"
pubDate: 2026-11-06
description: "Learn how 5G handover parameters like A3 offset, hysteresis, TTT and CIO decide when a UE should move, and how SON MRO tunes them."
coverImage: "./5g-handover-parameters-a3-event.png"
imageAlt: "Diagram of a 5G NR handover between two cells, showing RSRP curves crossing at the A3 event threshold with hysteresis margin and time-to-trigger window marked, illustrating key 5G handover parameters"
---

# Handover 101: When Should the Network Let a User Go? 5G Handover Parameters Explained


HANDOVER 101: WHEN SHOULD THE NETWORK LET A USER GO?

Anyone who has done drive testing knows this moment. The serving cell is fading, a neighbor is clearly stronger, and the UE hangs on longer than it should. Then the call drops.

On paper, handover is simple: move the user to a better cell. The hard part is deciding when "better" is real and when it is just a few dB of fast fading.

In LTE and 5G NR, most intra-frequency handovers are driven by Event A3. The UE reports when a neighbor becomes stronger than the serving cell by an offset, and that condition must hold for the full time-to-trigger window. Three parameters shape it:

🔹 Offset and hysteresis set how much better the neighbor must be before the UE sends a report.
🔹 Time-to-trigger filters out short fades and reflections by requiring the advantage to last.
🔹 Cell Individual Offset lets you bias one specific neighbor relation, which helps at cluster borders or around a new site.

Tune them too tight and you get ping-pong, with users bouncing between two cells and burning signaling. Tune them too loose and handovers arrive late, after the radio link has already failed. Too early is its own trap: the UE jumps to a target it cannot hold.

*(When the parameters look right but mobility is still poor, the cause is often the coverage itself -- see [Why Good 5G Coverage Can Still Produce Bad Mobility](/insights/5g-mobility-good-coverage/).)*

This is the problem MRO in SON was designed for: collect RLF and handover failure reports, classify them as too early, too late or wrong cell, and adjust offsets per relation. In O-RAN, that same loop can run as an rApp in the SMO, with proper guardrails.

After many years in RAN, my view is that the best handover is the one nobody notices. 𝗟𝗲𝘁𝘁𝗶𝗻𝗴 𝗴𝗼 𝗮𝘁 𝘁𝗵𝗲 𝗿𝗶𝗴𝗵𝘁 𝗺𝗼𝗺𝗲𝗻𝘁 𝗶𝘀 𝗮 𝗱𝗲𝘀𝗶𝗴𝗻 𝗱𝗲𝗰𝗶𝘀𝗶𝗼𝗻.

#5G #Handover #MobilityManagement #RANOptimization #SON #MRO #ORAN #RFOptimization
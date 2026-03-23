---
title: "Latency Myths in 5G: DU vs CU-UP vs “RAN Integrated”"
pubDate: 2026-03-11
description: "This post explains 5G “latency myths” by breaking end-to-end RAN delay into its main contributors (CU-UP vs DU vs integrated RAN), showing why blaming the air interface alone is often wrong."
image: "LatencyMyth.png"
linkedinUrl: "https://www.linkedin.com/posts/salvador-ibarra-luna_5g-ran-latency-activity-7437520239489208322-2VBB?utm_source=share&utm_medium=member_desktop&rcm=ACoAAAHdUJ4B2MN4INncxmIAgZdmF3VYSr1J55o"
---

# Latency Myths in 5G: DU vs CU-UP vs “RAN Integrated”

When people say “5G latency is high,” the first reaction is often: “The air interface must be the problem.”
Not always.

A more useful mental model is to see RAN latency like a relay race: the total time is the sum of multiple runners, not just one.
In 3GPP Rel-17 KPIs, the *“integrated downlink delay in RAN”* is measured from when the IP packet is received in the gNB-CU-UP until the UE receives the last part of the packet (based on HARQ feedback or RLC ACK depending on mode).
And here’s the key detail many miss:

•	* The integrated RAN delay is modeled as the sum of the CU-UP delay plus the DU delay.
So, if you want to “debug latency” without guessing, start by separating the contributors:

•	* *GNB-CU-UP Delay* is the time from receiving the IP packet at CU-UP until the RLC SDU arrives at the DU side (F1-U termination). It includes PDCP-related delay and (when split) the F1 component.
•	* *GNB-DU Delay* is the time from RLC SDU arrival at the DU until the UE receives the last part over the air (including RLC and air-interface delay).
•	* *DU Latency* is a different lens: it looks at the “first-byte” style timing from packet reception at DU until the first part is transmitted over the air, assuming no prior queue. 

One practical takeaway: In a non-split gNB scenario, the standard assumes the F1 delay component is zero (because there is no F1 interface).
*The big lesson:* if you only look at “total latency,” you’ll argue. If you split it into CU-UP vs DU vs integrated, you can act.

#5G #RAN #Latency #5GCore #CloudRAN #ORAN #SMO #NetworkAutomation #TelecomStrategy #RANOptimization

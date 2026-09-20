---
title: "RAPPS VS XAPPS: WHERE INTELLIGENCE LIVES IN O-RAN"
pubDate: 2026-10-05
description: "Learn where intelligence lives in O-RAN by comparing rApps on the Non-RT RIC and xApps on the Near-RT RIC, and how A1 and E2 connect their control loops."
image: "rAppsVsxApps.png"
imageAlt: "Layered O-RAN architecture showing the SMO with Non-RT RIC and rApps above a Near-RT RIC with xApps, connected through A1 and E2 interfaces to a 5G RAN, in deep blue and teal tones"
---

# RAPPS VS XAPPS: WHERE INTELLIGENCE LIVES IN O-RAN

When people ask me whether rApps or xApps are the smarter choice, I answer with another question: how fast does the decision need to be? In O-RAN, intelligence is distributed by time scale, and that is what defines where each app belongs.

rApps run on the Non-RT RIC inside the SMO, with control loops slower than one second. They see the network from above: long term trends, traffic prediction, energy saving plans, coverage and capacity optimization. They also train and update the models that others will use.

xApps run on the Near-RT RIC and act between 10 milliseconds and one second through the E2 interface. They handle things that cannot wait for a slow loop, such as traffic steering, load balancing or interference management during a busy hour.

The two need each other:

- The Non-RT RIC sends policies to the Near-RT RIC over A1, which sets the goals and limits for what xApps are allowed to do.
- Models trained on historical data in the SMO can be deployed as xApps for fast inference close to the RAN.
- Feedback from xApp actions flows back as data, which lets rApps evaluate whether the policy is really working.
- Below both layers, the scheduler in the DU still decides in the millisecond range and remains outside this framework.

My practical advice is to start from the use case, not from the app type. Define the time scale, the data you need and the parameters you are allowed to change. The right home for the logic usually becomes obvious after that.

#ORAN #rApps #xApps #SMO #RAN #AIRAN #NetworkAutomation #TelecomInnovation

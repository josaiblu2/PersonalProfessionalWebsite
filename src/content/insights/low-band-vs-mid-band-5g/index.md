---
title: "Low Band vs Mid Band: The Physics Every RAN Engineer Needs"
pubDate: 2026-10-19
description: "Compare low band and mid band physics in 5G: path loss, penetration, bandwidth, beamforming gain and uplink budget for smarter RAN layer design."
coverImage: "./low-band-vs-mid-band-5g-physics.png"
imageAlt: "Low band vs mid band 5G coverage comparison showing a wide 700 MHz coverage layer reaching deep indoors and a narrower 3.5 GHz Massive MIMO beamforming layer delivering capacity in a dense urban area"
---

# Low Band vs Mid Band: The Physics Every RAN Engineer Needs

Every layer decision in a 5G network ends up coming back to the same few physics rules. Knowing them saves long debates in design reviews.

Start with path loss. Going from 700 MHz to 3.5 GHz adds roughly 14 dB of free space loss, since the frequency term grows with 20 log(f). Add building penetration, which also gets worse as frequency increases, and the same site covers a much smaller indoor area on mid band.

Then the part many people overlook:

* Higher frequency means shorter wavelength, so you can fit 32 or 64 antenna elements in a panel of reasonable size and recover part of that loss with beamforming gain.
* Low band rarely offers more than 10 or 20 MHz per operator, while mid band can bring 100 MHz, and that bandwidth is where the real capacity comes from.
* Uplink is usually the true limit on mid band, because the UE transmits with a fraction of the gNB power and TDD gives it fewer slots.
* Low band reaches deep indoors but its capacity saturates quickly once traffic concentrates in a dense area.

This is why most mature networks treat low band as the coverage and uplink anchor, and mid band as the capacity layer. Carrier aggregation, SUL or EN-DC combinations let the UE keep its signaling and uplink on the robust layer while the downlink data rides on the wide one.

When I see coverage complaints on a new 3.5 GHz rollout, my first question is usually whether the problem is downlink at all. Very often the cell edge is defined by the uplink budget.

Physics does not negotiate. Good design simply puts each band to work where its physics helps you.

#5G #RANDesign #RFOptimization #Spectrum #MassiveMIMO
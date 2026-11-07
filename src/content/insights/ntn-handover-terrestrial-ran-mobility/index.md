---
title: "When Terrestrial RAN Meets NTN: A New Mobility Problem for NTN Handover"
pubDate: 2026-11-06
description: "Explore why NTN handover breaks classic A3 logic and how 3GPP Rel-17 and Rel-18 use time, distance and RACH-less triggers for LEO mobility."
coverImage: "./ntn-handover-leo-terrestrial-ran-mobility.webp"
imageAlt: "LEO satellite beam moving over a terrestrial 5G RAN layer, showing NTN handover between satellite and ground cells with distance-based trigger zones and a group of UEs transferring at once"
---

# When Terrestrial RAN Meets NTN: A New Mobility Problem for NTN Handover


On Monday I wrote about [handover basics and Event A3](/insights/handover-101-5g-handover-parameters/). That logic has served us well on the ground. Put a LEO satellite in the picture and a lot of it starts to break.

In a terrestrial cell, RSRP drops clearly as the UE moves from center to edge, so comparing levels makes sense. Seen from a satellite hundreds of kilometers up, the difference between center and edge can be just a few dB. Pure RSRP triggers lose most of their meaning.

Then there is movement. With LEO the cell itself can move over the user at several kilometers per second, so a phone sitting still on a table may still need a handover every few minutes. Add long propagation delay, Doppler, and timing advance that keeps changing, and mobility becomes a very different job.

3GPP has been responding release by release:

🔹 Release 17 brought NR NTN together with conditional handover triggers based on time and on UE distance to the cell reference point, beyond signal level alone.
🔹 Release 18 went further with NTN to TN mobility improvements and RACH-less handover, which cuts signaling when many users move at once.

That last point worries me most for real deployments. When a satellite beam leaves an area, it can take a whole population of UEs with it at the same time, and the terrestrial layer has to absorb that load gracefully.

For those of us coming from SON, this is a familiar challenge in a new geometry. Neighbor relations, mobility policies and load balancing will need to understand ephemeris and orbit timing, not only radio measurements.

*(For how SON itself has to adapt when the network moves, see [NR Over Non-Terrestrial Networks: Can SON Work When The Network Is Moving?](/insights/2026-02-05-nr-over-ntn/).)*

𝗧𝗵𝗲 𝗻𝗲𝘅𝘁 𝗺𝗼𝗯𝗶𝗹𝗶𝘁𝘆 𝗲𝘅𝗽𝗲𝗿𝘁𝘀 𝘄𝗶𝗹𝗹 𝘁𝗵𝗶𝗻𝗸 𝗶𝗻 𝗼𝗿𝗯𝗶𝘁𝘀.

#NTN #5G #NonTerrestrialNetworks #LEO #Handover #3GPP #RAN #SON
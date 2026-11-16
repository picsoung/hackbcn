---
event: aisummit26
title: Evac Caller
publishedDate: '2026-09-20'
description: Wildfire alerts tell everyone. Evac Caller makes sure the hospital picked up
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - Mastra
  - Nebius
  - SLNG
  - Norrsken - DeepFire
techStack: []
youtubeLink: 'https://www.youtube.com/watch?v=DmkUEfAZCzw'
hackers:
  - name: Mortaza Taghizadeh
    description: ''
    image:
      src: /testimonials/avatars/mortaza-taghizadeh.jpg
    links: {}
links:
  github: 'https://github.com/mrtztg/evac-caller'
  video: 'https://www.youtube.com/watch?v=DmkUEfAZCzw'
---
A wildfire alert today is one-way. ES-Alert sends a message to every phone in an area. Nobody knows who read it. Commercial systems call people with a recording and ask them to press 1.

Evac Caller does the opposite. It works on the small number of places where evacuation is slow and dangerous: hospitals, care homes, schools and nurseries.

1. It replays a real fire (Vall d'Uixó, Castellón, 25 July 2026) from NASA FIRMS satellite hotspots, hour by hour, with real measured wind from the Valencia airport weather station.
2. It draws an estimated danger zone: a cone in the wind direction for 1, 3 and 6 hours. It is clearly labelled an estimate, not a fire simulation.
3. It finds the places inside that zone from OpenStreetMap and ranks them: soonest arrival first, then places with people inside, then the hardest to evacuate.
4. The coordinator gets the ranked list on Telegram and presses **Approve**. No phone call can happen without that approval — this is enforced in code and covered by a test.
5. An AI voice agent phones each place, says how far the fire is and in which direction, and answers questions. It never invents facts: asked "which road should we use?", it says it does not know and gives 112.
6. Every call is classified from its transcript: `CONFIRMED`, `NEEDS_HELP`, `NO_ANSWER` or `UNCLEAR`, with a quote from the caller as evidence. Anything that is not confirmed goes back to the human with **Call again** / **Escalated to 112**.

The dashboard shows the map, the ranked list and every call with its transcript, duration, latency, model and tokens.

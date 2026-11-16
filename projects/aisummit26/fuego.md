---
event: aisummit26
title: Fuego
publishedDate: '2026-09-20'
description: >-
  AI dispatcher that connects early satellite detections with forecasts of
  what’s at risk, and brings that information directly to responders.
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - Norrsken - DeepFire
  - SLNG
  - Mastra
  - Cognition
  - Nebius
techStack: []
youtubeLink: 'https://youtu.be/XvLjZEo0U8s'
hackers:
  - name: Daniel Duhnev
    description: ''
    image:
      src: ''
    links: {}
  - name: Philipp Leihe
    description: ''
    image:
      src: ''
    links: {}
links:
  github: 'https://github.com/lihp99/hackbarna-fuego'
  website: 'https://www.youtube.com/watch?v=SWOD-GCFqsM'
  video: 'https://youtu.be/XvLjZEo0U8s'
---
Wildfire responders need to know where a fire could spread, which communities or sites are in its path, and who needs to be alerted. Turning satellite detections into that picture means connecting several sources of information, often under time pressure.

We built Central, an AI dispatcher that connects early fire detection to response coordination. It combines satellite hotspots, fire spread forecasts, weather and nearby assets into an incident view. Responders can explore a map, ask questions through Telegram, or use a push-to-talk radio interface—for example, “What’s in the fire’s path?”

Deepfire supplies the detections and spread simulations. Our geospatial service identifies potentially exposed sites, while a Mastra agent coordinates tools, conversation context and approval workflows. Fire and exposure figures come from tool results. Responders can also report false alarms, such as industrial heat sources, and Central records those corrections to help reduce repeated alerts. Site notifications require human approval, and operational decisions remain with responders.

We built and tested the prototype using recorded wildfire replays. Our goal is to shorten the path from an early warning to a clear, actionable picture of who and what may be at risk.

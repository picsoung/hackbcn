---
event: aisummit26
title: HackFire
publishedDate: '2026-09-20'
description: >-
  A voice agent that calls residents before a wildfire reaches them, tells them
  how to get out, and shows the emergency coordinator who needs
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - Vonage
  - QualityClouds
  - SLNG
  - Galtea
  - Norrsken - DeepFire
techStack: []
youtubeLink: 'https://www.youtube.com/watch?v=RWvrH6fFc14'
hackers:
  - name: Rosa Vázquez Sánchez
    description: ''
    image:
      src: ''
    links: {}
  - name: Bryan Tito Farez
    description: ''
    image:
      src: ''
    links: {}
  - name: Roger Tito Farez
    description: ''
    image:
      src: ''
    links: {}
links:
  github: 'https://github.com/RogerTito455/hackfire'
  website: 'https://frontend-production-ae2c.up.railway.app/'
  video: 'https://www.youtube.com/watch?v=RWvrH6fFc14'
---
The problem
On 23 July 2026 the Burgohondo wildfire in Ávila ran three kilometres in forty minutes and reached the La Atalaya estate in El Tiemblo. About 1,300 people were evacuated and five homes were destroyed. The warning was an ES-Alert: the same message to every phone, and it cannot listen. The coordinator does not learn who has left, who cannot move, or who never got it, so rescues surface late, through saturated 112 lines.

What we built
HackFire turns a wildfire forecast into a conversation with every household in its path. A voice agent calls each resident, gives them a route out that avoids the fire, and asks whether they can leave on their own. Every answer lands on the emergency coordinator's map as evacuating, no answer or needs rescue, with rescues ranked by how soon the fire reaches them and a route for the crew. A person approves every order before anyone is called.

How it works
1. Deepfire's satellite hotspots (a replay of 23 July, plus live mode on fires burning now) feed a forecast of where the front is heading.
2. The forecast is crossed with towns, care homes, schools and roads from OpenStreetMap, so each place gets a time to impact. From satellite data alone, La Atalaya was flagged about six hours before the first hotspot came within three kilometres.
3. The coordinator approves an evacuation order per zone. Then an English-speaking agent on SLNG calls the residents and records the outcome through our tools.
4. The coordinator sees the answers within two seconds, can ask a second voice agent which rescues come first.

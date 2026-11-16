---
event: aisummit26
title: Ojo de Fuego
publishedDate: '2026-09-20'
description: >-
  Ojo de Fuego turns live satellite fires into evacuation priorities in one
  console.
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - Norrsken - DeepFire
  - Nebius
techStack: []
youtubeLink: 'https://youtu.be/uWhB8fQGJ3k'
hackers:
  - name: Magnus Jonsson
    description: ''
    image:
      src: ''
    links: {}
  - name: Ola Hulleberg
    description: ''
    image:
      src: ''
    links: {}
  - name: Daniel Bentes
    description: ''
    image:
      src: ''
    links: {}
links:
  github: 'https://github.com/eldtechnologies/hackbarna-wildfire/'
  video: 'https://youtu.be/uWhB8fQGJ3k'
---
Ojo de Fuego is one screen for Spain that does three things:

Shows live satellite hotspots grouped into fires, with the perimeter and a spread forecast you can scrub through time
Lists nearby hospitals, schools, towns and power lines inside 5, 10 and 20 km rings, plus the likely spread corridor
Turns that map into a short report with evacuation priorities

How it works

Hotspots come from satellite. We cluster them, draw the fire, and run a spread model we trained on MTG frames. Distances and threat rings are measured from the map, not guessed by a chatbot. A language model only writes the report from those numbers, and if it fails a fixed template still produces the same structure. The demo can replay a real fire if the live feed drops.

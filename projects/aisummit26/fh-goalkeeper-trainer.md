---
event: aisummit26
title: Fh Goalkeeper trainer
publishedDate: '2026-09-20'
description: >-
  FH Trainer helps a goalkeeper coach review a session from on-device pose
  metrics and a Spanish observation draft they must approve  it does
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - Vonage
  - Nebius
  - QualityClouds
techStack: []
youtubeLink: 'https://youtu.be/s-yt1VWwWXg'
hackers:
  - name: mariana marin flor
    description: ''
    image:
      src: ''
    links:
      linkedin: 'https://www.linkedin.com/in/mariana-marin-1b6268348/'
      github: 'https://github.com/marianamarinflor622'
  - name: eva sisalli
    description: ''
    image:
      src: ''
    links:
      linkedin: 'https://www.linkedin.com/in/eva-sisalli-guzman/'
      github: 'https://github.com/miskybox'
links:
  github: 'https://github.com/FH-Goalkeeper/fh-trainer-frontend.'
  website: 'https://github.com/FH-Goalkeeper/fh-trainer-backend'
  video: 'https://youtu.be/s-yt1VWwWXg'
---
The problem. A goalkeeper coach can film a session, but the useful part is slow and messy: watching the clip, guessing at posture, and writing notes with no shared record. Off-the-shelf AI is a poor fit here. It should not diagnose, invent technique, or treat unapproved rules as official FH methodology. Video and names are personal data, so they cannot live on a public model or a public URL.

What we built. FH Trainer is a private workspace for an assigned trainer and adult goalkeepers. The coach captures or uploads a take, sees observable pose metrics, and gets a short Spanish draft. Nothing counts as feedback until the trainer edits, approves, or discards it. Demo data stays labelled and separate from any future pilot.

How it works. Pose runs in the browser with MediaPipe; the API never needs raw landmarks to draft text. The backend (FastAPI) owns login, organisation and assignment checks, consent gates, audit events, and time-limited access to the original clip. Nebius Token Factory may draft the Spanish notes from structured metrics and capture quality, with a local fallback if the provider fails. Insufficient quality blocks technical feedback. Personal data can be erased in the store; HTTP erasure and real Storage are still out of this demo.

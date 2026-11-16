---
event: aisummit26
title: Kommotion
publishedDate: '2026-09-20'
description: >-
  Kommotion lets streamers create recurring story universes and direct live
  AI-generated episodes where the audience votes to shape what happe
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - Fal.ai
  - Vonage
  - Cognition
  - Galtea
techStack: []
youtubeLink: 'https://youtu.be/wk0ihPy0E8g'
hackers:
  - name: Katya Dominguez
    description: ''
    image:
      src: ''
    links: {}
  - name: Edouard Foussier
    description: ''
    image:
      src: ''
    links: {}
links:
  github: 'https://github.com/edouardfoussier/hackbarna'
  website: 'https://kommotion.tv/'
  video: 'https://youtu.be/wk0ihPy0E8g'
---
The problem
Streamers live off audience interaction, but their content is bounded by what they can physically do on camera. Interactive formats (polls, chat games) are shallow, and producing actual serialized story content is out of reach for a solo creator. Generative video exists, but it's offline, one-shot and disconnected from a live audience — nobody has turned it into a live, community-driven show format.

What we built
Kommotion: a live-show platform where a streamer creates a recurring universe (cast, setting, rules, visual references) and directs live AI-generated episodes with their community. During a 120–180s episode, MiniMax H3 Max Director on fal generates the video and audio in real time while the audience votes on their phones (QR/link) to decide what happens next. Each episode is recorded, gets an automatic "Previously in…" recap, and its final frame can seed the sequel — so the story continues across episodes. It's deployed at kommotion.tv with a Gallery of 16 template universes, including realistic creator- and brand-inspired concepts (e.g. Norrsken Barcelona, CUPRA, Vueling).

How it works

Studio — the creator builds a universe (up to 8 characters with appearance/personality/voice direction, setting, logo) and prepares an episode: story intent, selected cast, optional private "surprise" twist. A planner generates a scene plan with upcoming vote points; an opening frame is composed with Nano Banana Pro from uploaded references.
Live direction — the host opens the control room, shows the audience QR lobby, then launches. A typed adapter streams prompts to the Director model with monotonic prompt versions; video/audio is relayed to spectators via WebRTC. Votes go over WebSockets to a server-authoritative tally; while the current scene plays, the next choices are pre-computed in the background ("anticipation") so the winning option is injected without a gap. An optional TypeSafe "Jev" layer checks proposed choices for continuity contradictions.
Memory & recording — the server separates requested, generated and host-confirmed events, keeps private plans/prompts out of public data, records the stream in-browser, and runs FFmpeg jobs to produce the MP4, the branded recap and the reusable last frame for the next episode.
Stack — TypeScript end to end: React/Vite frontend, Node/Express backend with a fal proxy (credentials never reach the browser), atomic versioned JSON storage, single Docker container on a VM. 100 regression tests pass, including a 100-simulated-phone vote rehearsal.

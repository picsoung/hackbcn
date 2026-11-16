---
event: aisummit26
title: MIRA
publishedDate: '2026-09-20'
description: >-
  Mira turns your TV into someone you can talk to — say what you're in the mood
  for, and she finds it, shows it, and presses play.
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - Titan OS
  - SLNG
  - Nebius
  - Fal.ai
  - QualityClouds
techStack: []
youtubeLink: 'https://www.youtube.com/watch?v=wg9Ofn-OohA'
hackers:
  - name: Arik Kumar Dutta
    description: ''
    image:
      src: ''
    links: {}
  - name: Arnab Dey
    description: ''
    image:
      src: ''
    links: {}
  - name: Igor Kuzmin
    description: ''
    image:
      src: ''
    links: {}
links:
  github: 'https://github.com/arnabdeypolimi/hackbarna_2026'
  video: 'https://www.youtube.com/watch?v=wg9Ofn-OohA'
---
The problem

Browsing on a TV is slow. You sit ten feet away with a remote that has four arrows, so finding something means stepping through rows one tile at a time or typing a title letter by letter. Voice search on most sets is command-and-control. It can't see what's on screen, so "play the second one" fails. It doesn't hold a conversation either, so "something like Sicario, but less violent" goes nowhere. The hardware doesn't help. Our target boards (Titan OS, 2020–2022) run Chrome 84 with 1–1.5 GB of memory shared with the OS, which is far too little to render an avatar locally.

What we built

A talking-head avatar that sits on a transparent overlay above a live TV UI. It listens, answers in a synthesised voice, and drives the UI while it talks. It moves focus, opens details, searches the catalogue, plays and seeks trailers, and slides in a shelf of shoppable products for the title on screen. You can interrupt it mid-sentence. It recommends from a TMDB catalogue and remembers each viewer across sessions. It speaks English, Spanish, French and Catalan. Two extras sit on top: voice-triggered ambient scenes (fireplace, beach, garden) and weather backdrops generated with fal.

There are two applications. The backend (Python, Pipecat, FastAPI) holds the voice loop, the agent, memory and recommendations. The frontend, Titan Browse (React + TypeScript + Vite, two runtime dependencies), is a remote-only browse UI with adult and kids profiles, My List and a trailer player.

How it works

Two planes. Media goes mic → WebRTC → SLNG speech-to-text → LLM on Nebius → SLNG text-to-speech → Anam avatar video → WebRTC back to the TV. The video is rendered in the cloud, so the TV only decodes a stream. A separate control WebSocket carries commands down and screen state up, and a dropped control socket doesn't drop the call.
The TV pushes its own screen state. It sends the current rail, the tiles around focus, and playback. That snapshot is already in memory when the viewer speaks, so "that one" resolves with no extra round trip.
Schema-guided reasoning. Each LLM cycle emits one JSON envelope, {intent, say, actions[]}, under constrained decoding. say streams to TTS sentence by sentence while actions dispatch in parallel, so speech and UI move together. Actions that return data, such as catalogue search and recommendations, feed the next cycle. The cycle cap is enforced by the schema: the final cycle's schema doesn't contain those tools.
One command vocabulary. The 15 verbs are defined once in Pydantic. The prompt's capability list, the JSON Schema and the TV app's TypeScript types are all generated from it, so the TV can't compile a command the backend would reject. Barge-in drops the interrupted turn's unsent commands.
Latency was measured. Qwen3-30B-A3B gives a 0.40 s median time to first token. Reasoning models think for about 1 s first, which is heard as dead air. Turn-taking is Silero VAD plus a 0.5 s silence timer rather than a smart-turn model, because that model can hold a turn open on speaker echo.
Recommendations and memory. A TMDB slice sits in embedded Qdrant with a local multilingual-e5-small model (about 15 ms per query). A SQLite log records what was played, offered and rejected. An LLM-written profile per viewer is rewritten as each session ends.
Observability. Every session is one Langfuse trace over OpenTelemetry, from conversation to turn to agent cycle to action to TV command. It runs off the media path and is off by default.

---
event: aisummit26
title: NebulaAI
publishedDate: '2026-09-20'
description: >-
  AI intelligent movie recommendation agent with multiple input sources
  capabilities: voice, text, remote controller (TV) and smartphone.
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - Nebius
  - SLNG
  - Mastra
  - Titan OS
techStack: []
youtubeLink: 'https://www.youtube.com/watch?v=gAZQerEeDBg'
hackers:
  - name: Sergi Villagrasa Reokarn
    description: ''
    image:
      src: ''
    links:
      linkedin: 'https://www.linkedin.com/in/sergi-villagrasa/'
      github: 'https://github.com/villazzzz'
  - name: Albert Hendrych Saperas
    description: ''
    image:
      src: ''
    links:
      linkedin: 'https://www.linkedin.com/in/albert-hendrych-saperas/'
  - name: Duna Febré Vila
    description: ''
    image:
      src: ''
    links:
      linkedin: 'https://www.linkedin.com/in/duna-febr%C3%A9-vila-981448419/'
links:
  github: 'https://github.com/SergiVillagrasa/HackBarna26'
  video: 'https://www.youtube.com/watch?v=gAZQerEeDBg'
---
This agent is primarily designed to recommend movies and TV shows, but we’ve implemented different ways to interact with it to make it easier and more convenient to find a recommended movie.
The simplest way is to use the arrows on the remote directly, so you can easily answer the questions using just the arrows.
The other method we’ve devised involves a physical button on the remote, similar to the one on Apple TV. When you press this button, an AI agent—which we’ve implemented using SLNG—appears and can help recommend a movie using only your voice.
Finally, for situations where the user doesn’t have the physical remote handy, we’ve designed a solution using just a smartphone—something everyone carries in their pocket—where a Telegram bot connected to Mistra allows you to access the AI agent and receive movie recommendations. This feature is designed to automatically play a movie on the TV using your smartphone.

From an engineering perspective, we thought it would be interesting to see, in some visual way, how the AI works and why it makes these recommendations. That’s why we’ve integrated a feature we’ve called Context Graph, which displays a graph showing movies related to the user’s input, as well as the relationships between these movies. It also includes a dashboard where you can see whether the AI agents are active or not.

The recommendations aren't deterministic; it's an intelligent agent that takes into account viewing history, context, likes, and the user's “Watch Later” list.

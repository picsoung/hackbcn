---
event: aisummit26
title: chezy
publishedDate: '2026-09-20'
description: >-
  Finding a flat, made easy. The AI rental concierge that reads listings like a
  local, spots the traps, and calls the agency for you.
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - Vonage
  - Mastra
  - Nebius
  - Cognition
  - QualityClouds
  - Galtea
  - SLNG
techStack: []
youtubeLink: 'https://youtu.be/5o1GLvkQcxU'
hackers:
  - name: Anabel Frieros Rodríguez
    description: ''
    image:
      src: ''
    links: {}
  - name: Jessie Lee Delgadillo Newman
    description: ''
    image:
      src: ''
    links: {}
  - name: Joaquín Terrasa Moya
    description: ''
    image:
      src: ''
    links: {}
links:
  github: 'https://github.com/espetro/chezy'
  video: 'https://youtu.be/5o1GLvkQcxU'
---
Renting a flat in Barcelona is a race you lose by minutes. Good listings on Idealista get dozens of calls in their first hours, agencies only pick up if you can book a slot in Spanish on the spot, and
 the photos rarely show what the flat actually looks like. The people who win are the ones who call first, so we built the thing that calls first.

 Chezy is an AI rental concierge. You describe what you want in a short conversation (neighborhoods, budget, dealbreakers) and it searches a database of real Idealista listings we scraped for Barcelona.
 Every listing gets a match score plus a forensic read: is the price right for that barrio, does the listing hide its orientation, do the photos look retouched. When a flat clears your bar, an AI voice
 agent phones the agency in Spanish, negotiates a viewing slot with the person who answers, and the confirmed appointment lands in your calendar.

 Under the hood: a Python scraper pulls Idealista into Postgres. A Next.js app runs the conversational onboarding and the scored feed on Nebius AI Studio models (DeepSeek for chat, Qwen for titles, Kimi  for the photo forensics). The outbound call runs on SLNG's voice agent platform over a real SIP trunk, with the Vonage Voice API as a second telephony path, and the booking lands through Google Calendar.

We audited the code with Norma and built a Galtea eval suite that adversarially tests the agent's conversation.

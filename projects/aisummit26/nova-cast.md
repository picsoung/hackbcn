---
event: aisummit26
title: Nova-Cast
publishedDate: '2026-09-20'
description: >-
  An AI news livestream that researches, fact-checks, voices and films itself,
  and refuses to air anything it can't source.
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - SLNG
  - Cognition
  - Fal.ai
techStack: []
youtubeLink: 'https://youtu.be/gvSj4s39rMo'
hackers:
  - name: Nina Haide
    description: ''
    image:
      src: ''
    links:
      linkedin: 'https://www.linkedin.com/in/ninahaide/'
      github: 'https://github.com/N1n4CH'
links:
  github: 'https://github.com/n1n4xyz/nova-cast'
  video: 'https://youtu.be/gvSj4s39rMo'
---
The problem
AI can now produce video content around the clock without a human in the loop. Most of it is unverified: AI news channels hallucinate facts, and the videos rarely say they're synthetic. Since August 2026, the EU AI Act's Article 50 requires AI-generated content to be marked as such. Autonomous content production is easy. Autonomous content production you can trust is not.

What we built
Nova Cast is a livestream of AI news that runs itself. It picks up new stories, writes and fact-checks each segment, and a synthetic presenter delivers it live. Nothing airs unless code has verified it, and every clip leaves the system labeled as AI-generated, with burned-in captions and a source for every claim.

How it works
A producer pulls stories from news feeds and starts parallel Devin sessions through the API, one per story. Devin returns a segment spec: a short script, scene prompts, and a list of claims, each with a source URL and the exact terms that must appear on that page. A validator in code checks every claim against its live source, blocks appearance descriptions so the presenter stays consistent, and enforces house style. Failures go back into the same Devin session with the exact reasons; after three failed attempts, the story is dropped. In our runs, Devin fixed its own mistakes seven times on the second attempt.

Verified scripts are voiced through SLNG (about 8 seconds of TTS per segment), and fal's H3 Max Director generates the presenter live from a reference image, lip-synced to the real voice. Each segment is saved as a reel, ready for social media.

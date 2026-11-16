---
event: aisummit26
title: Unfold
publishedDate: '2026-09-20'
description: >-
  Fact-check any X post in one click — the claim, the evidence, and what's being
  left out.
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - Galtea
  - Nebius
techStack: []
youtubeLink: 'https://youtu.be/mK291ZF-lOE'
hackers:
  - name: Ettore Ciprian
    description: ''
    image:
      src: ''
    links: {}
  - name: Anna Kreise
    description: ''
    image:
      src: ''
    links: {}
  - name: Diana Kreise
    description: ''
    image:
      src: ''
    links: {}
links:
  github: 'https://github.com/ettoreboy/hackbarna2026-cangrejo'
  video: 'https://youtu.be/mK291ZF-lOE'
---
The problem. A post on X mixes a checkable fact, what it leaves out, and rhetoric that carries you past both. Tools that rate the whole post — true/false, trustworthy/not — rate the wrong object.

What we built. A Chrome extension + FastAPI backend. Click Unfold in a post's action bar, a drawer opens inline with five blocks: the main claim, that claim checked against live web evidence, the missing context, the rhetorical signals with the exact words that triggered them, and neutral speaker background from Wikipedia. The verdict is about the claim, never the post.

How it works. Stage one is fast: find every claim, run Wikipedia on the author, search the post text. You pick a claim. Stage two searches that claim, fetches linked pages server-side, and returns a verdict with real sources. gpt-oss-120b on Nebius with strict JSON output.
Why it holds up. The guarantees are in code, not the prompt: quotes are snapped onto the real post or dropped, cited URLs are filtered to evidence actually supplied, no evidence means unverifiable.

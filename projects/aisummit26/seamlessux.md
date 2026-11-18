---
event: aisummit26
title: SeamlessUX
publishedDate: '2026-09-20'
description: Seamless UX turns real users getting stuck into tested fixes.
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - Vonage
  - SLNG
  - Cognition
techStack: []
youtubeLink: 'https://youtu.be/0Ip9KEqeyZA'
hackers:
  - name: Patricio Calderon
    description: ''
    image:
      src: ''
    links:
      linkedin: 'https://www.linkedin.com/in/patriciobcs/'
      github: 'https://github.com/patriciobcs'
  - name: Amina Ben Salem
    description: ''
    image:
      src: ''
    links:
      linkedin: 'https://www.linkedin.com/in/amina-ben-salem/'
      github: 'https://github.com/minasrc'
links:
  github: 'https://github.com/seamlessux/seamlessux'
  website: 'https://seamlessux.patriciobcs.com/'
  video: 'https://youtu.be/0Ip9KEqeyZA'
---
**The problem.** Teams find out users are stuck long after it happens, from analytics that show *what* but never *why*, or from a usability study that costs weeks and ends in a slide deck nobody turns into code. Founders skip it entirely.

**What we built.** Seamless UX is a loop your product runs on its own: detect friction, ask real people, get evidence, ship a fix, retest. One script tag, no recording until a user says yes. Demoed end to end on a real Excalidraw friction: users hunting for "export as image" hit Share (live collaboration) and Save to (a file nobody can open) before finding it in the menu.

**How it works.**
1. **Detect.** The SDK reports semantic events only — no text, no screenshots. Jev screens a bounded window and, above a threshold, proposes a research candidate.
2. **Ask.** The candidate becomes a neutral task. Users are invited inside the product, consent, and think aloud. Vonage records the audio, SLNG transcribes it, and every word lands on the same clock as every click.
3. **Watch.** The owner sees it live: actions, detours, help requests, the recording verifying, the transcript arriving — all persisted state, nothing simulated.
4. **Fix.** A finding becomes a GitHub issue; Devin drafts a fix in an isolated branch; independent checks verify it; fresh participants retest the preview before anything ships.

Next.js · Supabase · Vonage · SLNG · Jev · Devin. A model's read is a signal, not evidence; participants are never fabricated; validation is tied to the exact commit.

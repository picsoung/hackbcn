---
event: skillathon-hacknight-2026
title: OpenClaw Audit
publishedDate: '2026-03-19T18:58:26.784Z'
modifiedDate: '2026-03-19T19:05:56.057Z'
description: Full platform audit skill for OpenClaw instances.
thumbnailUrl: /projects/skillathon-hacknight-2026/openclaw-audit.png
category: Technology
status: published
contentFormat: markdown
tags:
  - Developer Tools
  - Utilities
  - AI/ML
techStack: []
youtubeLink: ''
hackers:
  - name: tomas
    description: ''
    image:
      src: ''
    links: {}
links:
  submission: >-
    https://hackbarna-skillathon.netlify.app/projects/k97ee1gcesj563cyehvsznq881837h5z
  github: 'https://github.com/awaaate/openclaw-audit'
---

Full platform audit skill for OpenClaw instances. Connects via SSH, audits 30+ agents, skills, plugins, security (OWASP ASI Top 10), bindings, and usage — then generates an Excel report and HTML dashboard. Uses parallel subagents (haiku) for maximum speed: 4 data-collection agents run simultaneously, followed by a security analysis pass, then automatic report generation with styled badges, scorecards, and remediation guidance.

## Installation

```sh
npx skills add awaaate/openclaw-audit
```

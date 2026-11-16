---
event: aisummit26
title: Workflow Scout
publishedDate: '2026-09-20'
description: >-
  Workflow Scout interviews your team, prices the work outside their roles, and
  drafts the fix in make.com
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - Make
  - QualityClouds
  - Galtea
techStack: []
youtubeLink: 'https://youtu.be/eyUhCgr1RHk'
hackers:
  - name: Marcus Rodrigues
    description: ''
    image:
      src: ''
    links: {}
  - name: Gerson Montesinos
    description: ''
    image:
      src: ''
    links: {}
links:
  github: 'https://github.com/gmonteskeet/workflow-scout'
  website: 'https://workflow-scout.vercel.app/'
  video: 'https://youtu.be/eyUhCgr1RHk'
---
The problem. Building an automation is easy now. Knowing which one to build next is not. In most firms, and boutique firms most of all, people spend hours on work their role was never meant to include, and nobody can say how much or what it costs. The next automation gets chosen by opinion.

What we built. Workflow Scout, an agent that lives inside a company for a few weeks and answers that question from evidence, then drafts the fix in make.com.

How it works. Scout starts from each role's job description, performance measures and cost rate, and proposes how that role's time should split. The manager approves. Each day it interviews the employee about their last working day. It already knows their calendar and recorded calls, so it only asks about what it cannot explain. The employee sees expected against actual time, corrects their own day and submits. Nothing reaches the manager before that. After the manager approves, Scout reviews weeks of approved days across the team, ranks the work furthest from each role and prices it from real cost rates. One approval creates a real draft scenario in make.com. All of the reasoning runs in make.com scenarios calling Claude.

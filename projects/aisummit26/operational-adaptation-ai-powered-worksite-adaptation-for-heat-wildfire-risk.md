---
event: aisummit26
title: >-
  Operational Adaptation — AI-Powered Worksite Adaptation for Heat & Wildfire
  Risk
publishedDate: '2026-09-20'
description: >-
  Operational Adaptation turns heat and wildfire alerts into validated,
  actionable work plans by automatically adapting tasks, schedules, and
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - Make
  - Norrsken - DeepFire
  - Vonage
techStack: []
youtubeLink: 'https://youtu.be/BoCtXx969l8'
hackers:
  - name: Sabrina
    description: ''
    image:
      src: ''
    links:
      linkedin: 'https://www.linkedin.com/in/sabrina-j-418682172/'
links:
  github: 'https://github.com/Sinteqia/hackbarna-2026-project'
  website: 'https://done-head-consultancy-diversity.trycloudflare.com/'
  video: 'https://youtu.be/BoCtXx969l8'
---
The problem

Heatwaves and wildfire events create real operational risks for outdoor worksites. Existing alert systems can tell teams that conditions are dangerous, but they don't answer the operational question: what exactly needs to change in today's work plan?

What we built

Operational Adaptation transforms environmental signals into concrete operational decisions. It combines weather risk and real wildfire data from Deepfire with worksite context such as zones, tasks, workers, skills and schedules.

How it works

When conditions change, the system identifies which activities are affected and translates the risk into operational constraints. OR-Tools then generates a new feasible schedule, adapting tasks, timing and worker assignments when necessary. An independent validator checks that the proposed plan respects the configured constraints.

If no valid plan exists, the system returns INFEASIBLE instead of inventing a solution. Make and Vonage provide the human-in-the-loop communication layer, connecting workers to operational updates and responses.

The goal is simple: move from environmental alerts to validated operational action.

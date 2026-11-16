---
event: aisummit26
title: nito
publishedDate: '2026-09-20'
description: 'nito is a design reviewer for agent-written code, so slop doesn''t ship'
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - Cognition
  - QualityClouds
techStack: []
youtubeLink: 'https://www.youtube.com/watch?v=MBlfyF7uoXI'
hackers:
  - name: Tair Asim
    description: ''
    image:
      src: ''
    links: {}
links:
  github: 'https://github.com/assimovt/nito'
  website: 'https://usenito.com/'
  video: 'https://www.youtube.com/watch?v=MBlfyF7uoXI'
---
Problem

AI agents can already read your design system through tools like Figma MCP. But context is an input, not evidence: nothing shows the code actually followed it. Agents still rebuild components you already have and introduce styles that drift from approved designs. Code review misses these changes, because a diff shows code, not a Button rendered 12px too tall. Your users see it first.

Solution

nito is design system review for AI-written UI. Think Greptile/CodeRabbit for the design-to-code handoff. It reviews UI changes against your existing components and your approved Figma designs. It then reports drift with source evidence, the design reference and screenshots of the changed component.

It runs in two places. [1] Inside your agent loop: the agent reviews its own working changes and fixes them before a pull request exists. [2] On the pull request: nito keeps one review comment up to date as the code changes for final human approval.

How it works

nito indexes your components from source code and pins the Figma designs you approve. It then runs two kinds of checks:

Deterministic: nito compares supported design values in the code against the approved Figma reference, such as a Button's height. The result is measured, not estimated: for example, 44px in the code against 32px in the design.

Judged: nito checks whether new UI should have used a component you already have. Jev (TypeSafe AI's System One decision model) evaluates whether the existing component covers the new code's purpose and behavior. nito reports a reuse recommendation, no match, or insufficient evidence. It never turns an uncertain answer into a pass.

For visual review, nito renders the exact commit in a headless browser and captures screenshots of the changed component next to its design reference.

The agent side is a local skill and CLI. The pull request side is a GitHub App.

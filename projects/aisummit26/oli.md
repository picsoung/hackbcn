---
event: aisummit26
title: OLI
publishedDate: '2026-09-20'
description: >-
  Personalised marketing targeted to user needs - in the exact style of the
  brand.
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - Nebius
  - QualityClouds
techStack: []
youtubeLink: 'https://www.youtube.com/watch?v=oux5ndaxHcI'
hackers:
  - name: Simona Barankova
    description: ''
    image:
      src: ''
    links: {}
  - name: Alexander Walker
    description: ''
    image:
      src: ''
    links: {}
links:
  github: 'https://github.com/milieere/marketplace'
  website: 'https://marketplace-web-1ylr.vercel.app/'
  video: 'https://www.youtube.com/watch?v=oux5ndaxHcI'
---
OLI is a demo product that shows how two agents turn a brand's raw material into a personalized answer.

The Brand Agent ingests what a hospitality brand actually has — a guidelines PDF, a menu, an offers sheet, photos — and extracts a structured BrandKit: colours, typography, tone of voice, venues and offers. Every field carries the page it came from. Colour conversion happens in code, never in the model, because vision models misread hex values.

The Creative Agent takes a request in natural language — "Friday, 8 friends, two vegans, one celiac, terrace, ~€30 each" — parses the intent, matches it in code against real offers, opening hours and party size, then writes copy in the brand's voice and renders a card from that brand's own kit.

The model chooses and writes; code owns the facts. Prices, hours and conditions are copied from Offering data, every artifact passes a brand-rule check before it ships, and each card's tone stays inside the range the brand's own guidelines declare.

Nine fictive Barcelona brands are ingested — 29 offers across 10 venues. A live run answers in about six seconds and replies in the language it was asked in. Built on Nebius Token Factory (DeepSeek-V4-Pro, Nemotron fallback).

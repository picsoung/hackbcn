---
event: aisummit26
title: TallyTvAI
publishedDate: '2026-09-20'
description: >-
  more than 2 millions movie to watch, to much choices, we reduce the number of
  choices, we reduce the friction, and augment the retention.
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - Vonage
  - Nebius
  - Titan OS
techStack: []
youtubeLink: 'https://youtu.be/jCWKZ41KDn4'
hackers:
  - name: Erwan Molina
    description: ''
    image:
      src: ''
    links: {}
  - name: Thomas Samson
    description: ''
    image:
      src: ''
    links:
      linkedin: 'https://www.linkedin.com/in/thomas-samson/'
      github: 'https://github.com/Thomasjsr'
links:
  github: 'https://github.com/Hellgard/TallyTVAI'
  video: 'https://youtu.be/jCWKZ41KDn4'
---
The problem

A television home screen is a wall of posters ranked by a model that needs an account, a viewing history and a month of watching before it says anything specific about you. On a new box, a hotel television, a friend's sofa, or a Tuesday when you want something you have never wanted before, that model has nothing to go on, so it shows you what is popular and you scroll. Most households spend longer choosing than they would admit, and when there are two of you on the sofa the usual answer is whatever neither of you objects to.

What we built

Tally is a television that works out what you want to watch tonight in about fifteen seconds, with no account and no viewing history, and that also knows what is starting right now on live channels. It asks you a handful of questions, in plain language, and then names three titles and says in one sentence why each one. It runs on a television, a laptop, a tablet and a phone from the same build.

It is six things on one engine. Tally Oracle asks five questions and proposes. Tally Flow gives you one title every eight seconds and you swipe. Tally Radar watches forty two live channels and tells you what is worth switching to in the next few minutes. Tally Recall finds the film you half remember from what you can still describe. Tally Kids is the same engine behind a parent's gate, with a catalogue a parent has agreed to. Tally Together puts two living rooms in one decision, with video, so the pick is one both households will actually enjoy.

How it works

Every title in the catalogue is a row of numbers, and every question is a predicate over that row, so an answer is a filter and a belief update rather than a tag lookup. The engine holds a probability over the whole catalogue, and before each question it works out which one would cut the most, then asks that one. Five answers is usually enough to go from a hundred thousand titles to three. Nothing is fetched at question time, so it is fast on a set top box.

When more than one person is answering, the room is arbitrated rather than averaged. An average is how you get the film nobody hates and nobody wanted, so the pick is the one with the highest floor across everyone in the room, and the screen says so.

The box remembers the household, not the person. What it keeps is a handful of non identifying preferences, it can be wiped from the remote with one key, and nothing leaves the television. The operator console is a separate surface, and a test fails if a single revenue figure ever reaches a television payload.

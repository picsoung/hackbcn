---
event: aisummit26
title: Lumi
publishedDate: '2026-09-20'
description: >-
  An AI coordinator for IVF patients: takes the small questions, escalates the
  serious ones.
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - Vonage
  - Mastra
  - Nebius
  - Make
techStack: []
youtubeLink: 'https://www.youtube.com/watch?v=lffjHbn9BDE'
hackers:
  - name: Valentin Robles Menichelli
    description: ''
    image:
      src: ''
    links:
      linkedin: 'https://www.linkedin.com/in/valentin-robles-menichelli/'
      github: 'https://github.com/valentinrobles'
  - name: Giulia Bono
    description: ''
    image:
      src: ''
    links:
      linkedin: 'https://www.linkedin.com/in/giuliabono/'
  - name: Marta Conde
    description: ''
    image:
      src: /testimonials/avatars/marta-conde.jpg
    links:
      linkedin: 'https://www.linkedin.com/in/martacondedesign/'
      github: 'https://github.com/MartaCondeDesign'
links:
  github: 'https://github.com/valentinrobles/bam-hackers'
  video: 'https://www.youtube.com/watch?v=lffjHbn9BDE'
---
The problem

$28B market. 70% failure rate. But medicine isn't the problem.

IVF patients don't fail because the treatment stops working. They quit because of the lack of care between appointments. Emotional burnout is the #1 reason for dropout after the first failed cycle.

Lumi keeps patients in the process with 24/7 support, a personalized protocol, and a nurse when it matters. More cycles completed = higher success rates = clinics retain +€150K/year.

What we built

Lumi is an AI care coordinator that sits between the patient and her clinic's nurse, inside Telegram.

She answers routine and logistic questions from the patient's own record. Appointment times, medication schedule, what to bring.

She writes first, too. Medication reminders at protocol time, and a follow-up the day after an urgent episode.

Anything clinical, she doesn't answer. It becomes a ticket. The nurse gets a card in her own chat with the patient's record, the question and a suggested reply, then taps approve or writes her own. The patient gets the nurse's words exactly as the nurse wrote them.

On urgent symptoms Lumi replies in under a second with the clinic's emergency phone and a video call link. The nurse gets her own link, and they talk face to face inside Lumi's call page.

Every ticket and call also lands in the clinic's tools through Make.

How it works

Built on Mastra: working memory per patient, tools with human approval, a workflow that suspends on the nurse's decision and resumes later (even after a restart), and a persisted scheduler.

Every message gets classified in code before the model replies. A dedicated triage call on Nebius (Nemotron, temperature 0, forced tool call, closed rules) sorts it into routine, logistic, clinical or urgent, and the tier decides which tools and instructions the agent gets.

A keyword rule can raise a tier but never lower it. If triage fails twice the message defaults to clinical, which means a human sees it. Urgent replies are composed in code, so no model can drop the emergency phone.

Video calls run on the Vonage Video API with a session and tokens per ticket.

On Nebius Token Factory we A/B'd GLM-5.3 against Nemotron-3-Super and switched to Nemotron: zero reasoning tokens, ~1s turns, and no invented data when a field is missing.

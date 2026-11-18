---
event: aisummit26
title: RecoverAI
publishedDate: '2026-09-20'
description: >-
  RecoverAI turns years of hospital data into faster, evidence-backed recovery
  decisions by comparing similar patients case to new cases
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - Vonage
  - Nebius
  - SLNG
techStack: []
youtubeLink: 'https://youtu.be/JizC1YicRLI'
hackers:
  - name: Yassine Chibani
    description: ''
    image:
      src: ''
    links:
      linkedin: 'https://www.linkedin.com/in/ychibani42/'
      github: 'https://github.com/ychibani42'
  - name: Yago Rodriguez-Martos
    description: ''
    image:
      src: ''
    links:
      linkedin: 'https://www.linkedin.com/in/yago-rodr%C3%ADguez-martos/'
  - name: Javier Urrutia
    description: ''
    image:
      src: ''
    links:
      linkedin: 'https://www.linkedin.com/in/javier-urrutia-095079252/'
      github: 'https://github.com/mendikat'
links:
  github: 'https://github.com/ychibani42/RecoverAI'
  website: 'https://recoveria.strategicplatform.com/'
  video: 'https://youtu.be/JizC1YicRLI'
---
Problem :
Comparing a patient's case against similar past cases is slow and manual, so recovery decisions rely on guesswork instead of evidence.

What Was Built
a hybrid-RAG clinical decision tool that embeds X-rays and patient data (age, weight, history, labs) in JSON format, retrieves the most similar historical cases from a vector database, and uses Nebius to generate a grounded recovery report covering treatment, timeline, health habits, you can also use speech to text SLNG Agent to help clinician's speak to fill in the case with SLNG.
and send the appointment and reminders to the patient with Vonage SMS Agent.

How It Works
It combines voice intake, image + text embeddings, and an LLM to retrieve similar cases and produce a grounded report with automatic patient follow-up.

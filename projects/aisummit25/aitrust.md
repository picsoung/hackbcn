---
event: aisummit25
title: AITrust
publishedDate: '2025-10-12'
description: Real-time video claim verification with trusted sources.
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - Linkup
  - Elevenlabs
techStack:
  - Transfomers
  - hugging face
  - linkup
  - eleven labs
  - torch
  - streamlit
  - pydantic
youtubeLink: ''
hackers:
  - name: Marina Palma
    description: ''
    image:
      src: ''
    links: {}
  - name: Oriol Porta
    description: ''
    image:
      src: ''
    links:
      linkedin: 'https://www.linkedin.com/in/oriol-porta-tovar-321b41290/'
links:
  github: 'https://github.com/marinapalma2000/AITrust'
---

AITrust is an AI-powered tool that verifies the truthfulness of statements made in videos in real time. It uses ElevenLabs speech-to-text models to transcribe spoken content and extract key claims, which are then checked against reliable, up-to-date information from trusted sources via the Linkup API — prioritizing governmental, institutional, and reputable media outlets. A transformer-based NLI model evaluates whether each claim is supported or contradicted, generating an intuitive Contradiction Gauge and clear verdicts. Finally, AITrust uses ElevenLabs text-to-speech to produce an audio summary of the verified sources (which are also available in text linked to the source), offering an accessible and engaging experience through an interactive Streamlit app.

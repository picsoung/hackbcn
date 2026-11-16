---
event: aisummit26
title: ByeByeScammer
publishedDate: '2026-09-20'
description: >-
  ByeByeScammer is your AI bodyguard for phone calls, detecting scams in real
  time and stepping in before you get tricked.
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - Nebius
  - QualityClouds
  - SLNG
  - Cognition
  - Galtea
techStack: []
youtubeLink: 'https://www.loom.com/share/ac0ec7b608b84463896757caf79b852a'
hackers:
  - name: Jiantong Wei
    description: ''
    image:
      src: ''
    links:
      linkedin: 'https://www.linkedin.com/in/jiantong-wei-70285b121/'
      github: 'https://github.com/weijt606'
  - name: Francisco Ojeda
    description: ''
    image:
      src: ''
    links:
      linkedin: 'https://www.linkedin.com/in/francisco-ojeda-0a6263205/'
      github: 'https://github.com/franojeda0202'
  - name: Niko Miralles
    description: ''
    image:
      src: ''
    links:
      linkedin: 'https://www.linkedin.com/in/niko-miralles-2a85a0421/'
links:
  github: 'https://github.com/weijt606/ByeByeScammer'
  website: 'https://www.loom.com/share/ac0ec7b608b84463896757caf79b852a'
  video: 'https://www.loom.com/share/ac0ec7b608b84463896757caf79b852a'
---
- The problem
Phone scams remain a major source of fraud, and generative AI makes them easier to scale and harder to recognize. Attackers can spoof trusted numbers, imitate familiar voices, and use social engineering to pressure victims in real time.

Most defenses focus on who is calling: carrier filters and blocklists rely on known bad numbers. But spoofed or newly created numbers can still look legitimate.

Today’s defenses protect the number. ByeByeScammer protects the conversation.

- What we built
ByeByeScammer is an AI bodyguard for phone calls: an iPhone app backed by a real-time protection server and scam-detection agent.

During a call, it continuously assesses risk and warns users about dangerous requests such as OTPs, payments, credentials, or remote access. Users can bring the Guardian voice into the conversation, block and report the caller, or let the system end a confirmed scam call. A paired desktop console provides post-call analysis and reports.

For privacy, no call audio or transcript text is stored. We also built a scam simulator using the same interface as a future carrier integration, allowing us to safely demonstrate real end-to-end scam calls.

How it works
Call audio is transcribed live by SLNG / Unmute. Each sentence passes through a two-stage detection engine: nine deterministic safety rules instantly detect explicit high-risk asks, while Nebius running gpt-oss-120b provides contextual reasoning and structured risk assessment.

The model can raise the risk, but only a concrete high-risk ask can interrupt the call: reducing false positives on legitimate conversations. When risk is detected, the app provides actionable guidance, and the Guardian can intervene through SLNG TTS.

We use Galtea to adversarially evaluate the detection engine, and a Cognition/Devin improvement loop to turn detected failures into backend improvements and re-test them.

In real sessions, we measured 711 ms speech-to-transcript and 935 ms to a full risk decision, at approximately $0.39 STT cost per protected hour. In our Galtea evaluation, the engine scored 96% overall, detected 92% of OTP requests, and interrupted zero legitimate calls.

All people, phone numbers, and organizations used in the demo are fictional.

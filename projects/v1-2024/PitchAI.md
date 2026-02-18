---
title: PitchAI
publishedDate: '2024-06-30'
modifiedDate: '2024-06-30'
description: Multimodal AI feedback for your presentations
thumbnailUrl: '/projects/PitchAI.png'
category: 'Technology'
status: 'published'
youtubeLink: 'https://www.youtube.com/watch?v=JZzgPRxKiFM&t=4140s'
hackers:
  - name: 'Joan Bordonaba'
    job: 'Full Stack Developer'
    image:
      src: '/hackers/joan_bordonaba.jpeg'
    links:
      github: 'https://github.com/joanbr4'
      linkedin: 'https://linkedin.com/in/joanbr4'
  - name: 'Enric Reverter'
    job: 'ML Engineer @ M47 Labs'
    image:
      src: '/hackers/enric_reverter.jpeg'
    links:
      github: 'https://github.com/ereverter'
      linkedin: 'https://www.linkedin.com/in/ereverterlopez'

  - name: 'Albert Vilà'
    job: 'Full Stack Developer'
    image:
      src: '/hackers/albert_vila.jpeg'
    links:
      github: 'https://github.com/avila-ca'
      linkedin: 'https://www.linkedin.com/in/vila-albert/'

techStack: ['numpy', 'hume.ai', 'OpenAi', 'express', 'React', 'penguin']
---

Given a video from a presentation and the reference script (i.e., such as the ones today), we process it from three different perspectives: (1) First, the audio and frames are extracted from the video. (2) Second, the audio is processed with hume.ai, which provides information on the transcript and the emotions. These emotions are extracted from the voice spectrogram, not the text! (3) Then, the frames are analyzed with a VLLM to extract information on the body language. (4) Finally, all the information is analyzed with the help of an LLM to provide constructive feedback at the relevant timestamps!

<YouTube id="JZzgPRxKiFM" timestamp="4140" thumbnail="/projects/PitchAI.png"/>

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
  - name: 'Enric Reverter'
    job: ''
    links:
      github: ''
      linkedin: ''

  - name: 'Joan Bordonaba'
    job: ''
    links:
      github: ''
      linkedin: ''

  - name: 'Albert Vilà'
    job: ''
    links:
      github: ''
      linkedin: ''

techStack:
  [
    'numpy',
    'hume.ai',
    'OpenAi',
    'express',
    'React',
    'penguin',
  ]
---

Given a video from a presentation and the reference script (i.e., such as the ones today), we process it from three different perspectives: (1) First, the audio and frames are extracted from the video. (2) Second, the audio is processed with hume.ai, which provides information on the transcript and the emotions. These emotions are extracted from the voice spectrogram, not the text! (3) Then, the frames are analyzed with a VLLM to extract information on the body language. (4) Finally, all the information is analyzed with the help of an LLM to provide constructive feedback at the relevant timestamps!

<YouTube id="JZzgPRxKiFM" timestamp="4140" thumbnail="/projects/PitchAI.png"/>

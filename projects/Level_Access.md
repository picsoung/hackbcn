---
title: Level Access
publishedDate: '2024-06-30'
modifiedDate: '2024-06-30'
description: Using AI-powered image analysis, we are on a mission to show the true accessibility of locations in cities around the world to provide level access for everyone.
thumbnailUrl: 'https://picsum.photos/seed/picsum/200/300'
category: 'Technology'
status: 'published'
youtubeLink: 'https://www.youtube.com/watch?v=JZzgPRxKiFM&t=0s'
hackers:
  - name: 'Eleanor Pitcher'
    job: ''
    links:
      github: ''
      linkedin: ''

  - name: 'Dora Morolli'
    job: ''
    links:
      github: ''
      linkedin: ''

  - name: 'Ditsuhi Iskandaryan'
    job: ''
    links:
      github: ''
      linkedin: ''

techStack:
  [
    'ReactJS',
    'Javascript',
    'Pytorch',
    'Python',
    'Flask',
    'Replicate',
    'LLaVA',
    'SQL Alchemy',
    'Google Colab',
  ]
---

We identified a common problem in cities: although some locations may claim to have accessible access for people who use wheelchairs (for example, a wheelchair icon on their google maps page), this might not reflect the true reality. Maybe there is a step in front of their shop that they haven't accounted for, or a metro line has a bigger gap between the train and the platform than they realise. Using AI-driven image analysis, we want to solve this problem. Users of the platform are able to search for shops, bars, restaurants, etc. around Barcelona, and the model will output the probability (%) that this location is accessible for people who use wheelchairs. This probability is generated using LLaVA's image comprehension capabilities. The model analyses an image of the location and responds to a prompt which requests information about its accessibility, such as whether it has a step, good lighting, a wheelchair ramp, etc.

<YouTube id="JZzgPRxKiFM" timestamp="0" thumbnail="https://picsum.photos/seed/picsum/200/300"/>

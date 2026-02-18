---
title: Level Access
publishedDate: '2024-06-30'
modifiedDate: '2024-06-30'
description: Using AI-powered image analysis, we are on a mission to show the true accessibility of locations in cities around the world to provide level access for everyone.
thumbnailUrl: '/projects/Level-Access.png'
category: 'Technology'
status: 'published'
youtubeLink: 'https://www.youtube.com/watch?v=JZzgPRxKiFM&t=3000s'
hackers:
  - name: 'Ditsuhi Iskandaryan'
    job: 'Data Scientist @ Idibell'
    image:
      src: '/hackers/ditsuhi_iskandaryan.jpeg'
    links:
      github: 'https://github.com/Ditsuhi'
      linkedin: 'https://www.linkedin.com/in/ditsuhi-iskandaryan-ph-d-1a816993'
  - name: 'Dora Morolli'
    job: 'Senior Software Engineer @ Wētā Fx'
    image:
      src: '/hackers/dora_morolli.jpeg'
    links:
      github: 'https://github.com/doruchan'
      linkedin: 'https://www.linkedin.com/in/doramorolli/'
  - name: 'Eleanor Pitcher'
    job: 'Senior Marketing Specialist @ Gartner'
    image:
      src: '/hackers/eleanor_pitcher.jpeg'
    links:
      github: 'https://github.com/eleanorpitcher'
      linkedin: 'https://www.linkedin.com/in/eleanorpitcher5/'

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

<YouTube id="JZzgPRxKiFM" timestamp="3000" thumbnail="/projects/Level-Access.png"/>

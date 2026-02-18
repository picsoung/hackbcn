---
title: SecAgents
publishedDate: '2024-06-30'
modifiedDate: '2024-06-30'
description: Security Agents for AWS GuardDuty Alerts
thumbnailUrl: '/projects/SecAgents.png'
category: 'Technology'
status: 'published'
youtubeLink: 'https://www.youtube.com/watch?v=JZzgPRxKiFM&t=2100s'
hackers:
  - name: 'Alex Palazón'
    job: 'Founder @ ArmoxAI'
    image:
      src: '/hackers/alex_palazon.jpeg'
    links:
      github: 'https://github.com/palarocks'
      linkedin: 'https://www.linkedin.com/in/alexpalazon/'

  - name: 'Marc Planas Castello'
    job: 'Android Team Lead @ Mobyfox'
    image:
      src: '/hackers/marc_planas.jpeg'
    links:
      github: 'https://github.com/planasmultimedia'
      linkedin: 'https://www.linkedin.com/in/marcplanascastello/'

techStack:
  [
    'ChromaDB',
    'CrewAI',
    'Langchain',
    'fastAPI',
    'Nextjs',
    'GPT-4o ',
    'ExaAI API',
  ]
---

People (and companies) using AWS GuardDuty to monitor malicious activity often find themselves spending a lot of time (about 20 to 50 minutes) on each alert checking for malicious activities. To reduce this time spending, we adopted the open-source framework CrewAI. This allowed us to automate much of the investigation process, essentially cutting out the need for manual checks. With CrewAI, we've been able to create various Agents, Tasks, and Tools, including making API calls to external Cybersecurity sources. We also integrated RAG with relevant documents and playbooks to enrich the final report with remediation steps.

<YouTube id="JZzgPRxKiFM" timestamp="2100" thumbnail="/projects/SecAgents.png"/>

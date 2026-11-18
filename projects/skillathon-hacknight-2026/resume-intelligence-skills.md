---
event: skillathon-hacknight-2026
title: Resume Intelligence Skills
publishedDate: '2026-03-19T18:57:17.555Z'
modifiedDate: '2026-03-19T19:03:14.597Z'
description: >-
  Resume Intelligence Skills is a small set of reusable AI agent skills for
  resume analysis.
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - Data
  - AI/ML
  - Developer Tools
  - Utilities
techStack: []
youtubeLink: ''
hackers:
  - name: Mauro Gioberti
    description: ''
    image:
      src: ''
    links: {}
links:
  submission: >-
    https://hackbarna-skillathon.netlify.app/projects/k979gdpy3xmzarx3bxtfxrqw7h8371b8
  github: 'https://github.com/maurogioberti/skill-a-thon-resume-analyzer'
---

Resume Intelligence Skills is a small set of reusable AI agent skills for resume analysis. It takes raw resume text, extracts structured candidate data, enriches company context, analyzes the profile for seniority and specialization, and generates a short candidate summary for quick review.
The skill pack is built around four reusable steps:
parse_resume reads the resume and extracts name, skills, work experience, and companies.
enrich_company adds local metadata for each company, such as industry and short description.
analyze_resume uses Ollama when available to infer seniority, specialization, and top skills, with a fallback path if the model is unavailable.
summarize_candidate creates a short candidate story that is easy to present in a demo or recruiter workflow.
This project is useful because it turns unstructured resumes into structured signals that an AI agent can use in hiring or resume intelligence workflows.

## Installation

```sh
pip install git+https://github.com/maurogioberti/skill-a-thon-resume-analyzer.git
```

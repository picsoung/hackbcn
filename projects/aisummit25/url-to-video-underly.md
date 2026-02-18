---
title: 'URL to VIDEO (UNDERLY)'
publishedDate: '2025-10-12'
modifiedDate: '2025-10-12'
description: 'Paste a product URL and get a fully automated, on-brand UGC kit: 4 videos, 4 images, captions.'
thumbnailUrl: ''
category: 'Technology'
status: 'published'
challenges: ['Runware', 'Lovable', 'Norssken']
youtubeLink: ''
hackers:
  - name: 'Valery Sharipov'
    job: ''
    image:
      src: ''
    links: {}
  - name: 'Marina Kiseleva'
    job: ''
    image:
      src: ''
    links: {}
techStack: ['Lovable', 'Firecrawl', 'OpenAI 4o mini', 'Runware', 'Veo 3', 'Kling', 'Google OAuth']
links:
  - github: 'https://github.com/valerymalivar/url-to-video-hackbarna'
---

URL to VIDEO is a hackathon-born product we built from scratch this weekend and shipped to production. We're a two-person team (product + design, no pro devs) building on Lovable.

Under the hood, Firecrawl parses the PDP, OpenAI 4o mini extracts benefits, brand cues, and persona/tone, we normalize assets, generate product+avatar stills with Gemini Flash Image 2.5 (Nano Banana, Runware), animate via Veo 3/Kling, and auto-add subtitles/CTA. Fully automated.

This wasn't possible 12 months ago! Two makers couldn't ship this without engineers, production-quality gen-video/images, reliable HTML, structured extraction, and fast/cheap inference only arrived recently.

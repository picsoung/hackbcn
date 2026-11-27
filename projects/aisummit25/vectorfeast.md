---
event: aisummit25
title: VectorFeast
publishedDate: '2025-10-12'
description: Development of a Glovo product recommender using product vectorization
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - Glovo
techStack:
  - e5-mistral-7b
  - Pytorch
youtubeLink: ''
hackers:
  - name: Daniel Bretaudeau
    description: ''
    image:
      src: ''
    links: {}
  - name: Isaac Restrepo
    description: ''
    image:
      src: ''
    links: {}
  - name: Pau Grau
    description: ''
    image:
      src: ''
    links:
      linkedin: 'https://www.linkedin.com/in/pau-grau-sabate-1700442a1/'
  - name: Oriol Josa
    description: ''
    image:
      src: ''
    links: {}
links:
  github: 'https://github.com/DanielBre03/Hackathon-11-12'
---

After scraping the majority of Glovo establishments and their product catalogs, we build a semantic product space by vectorizing all items using transformer-based embeddings extracted from their titles and descriptions. This vector space becomes the core layer that enables multiple applications: the first is a semantic search engine that retrieves the closest products in this space and allows users to input natural language prompts such as ‘I’m craving a cheat meal, but I don’t eat meat or cheese,’ returning matches like a ‘Veggie burger with crunchy onion’ from a certain restaurant—helping users navigate the overwhelming offer, avoid defaulting to the usual choices, and giving smaller establishments more visibility. By operating in vector space, we also enable playful interactions like adding or subtracting products to generate new suggestions and clustering items in a smarter, data-driven way. On top of this, we train a transformer-based recommender that takes product vectors as tokens and predicts the next order in the sequence, going beyond Glovo’s current ‘reorder’ suggestion by leveraging the user’s profile and purchase history to surface new, similar products and facilitate the discovery of new restaurants while remaining highly accurate and resilient to cold starts.

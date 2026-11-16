---
event: aisummit26
title: ARLANDRIA
publishedDate: '2026-09-20'
description: >-
  Eliminate hallucinations expert-domain areas (e.g. science) by limiting LLMs
  to language processing instead of tool usage
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - Nebius
  - QualityClouds
  - Cognition
techStack: []
youtubeLink: 'https://youtu.be/7QPPQsW-s8w'
hackers:
  - name: Caetano Souto Maior
    description: ''
    image:
      src: ''
    links: {}
links:
  github: 'https://github.com/caesoma/arlandria'
  video: 'https://youtu.be/7QPPQsW-s8w'
---
When researching for a knowledge specific and heavy domain, LLMs will bullshit you and generate slop. Scientific review, for insance, moved from manually querying individual and boolean terms to asking LLM deep research tools, but  the former is infeasible in practice due to large volumes of hits and the latter is unreliable and wrong.
A simple solution is restricting LLMs to language processing tasks, that's what ARLANDRIA implements: The CALLIMACHUS command prompts a research question, formulated by the scientist in as much detail as needed; an LLM converts that into any number of queries it finds necessary to cover the topics mentioned, and searches all the databases retrieving the titles and abstracts, summarizing the results to the researcher;  they review and refine the search until it's approved and the LLM adds them to a ledger, downloads the full texts and generates a traceable path for the whole search.
As a follow up, the HYPATIA command summarizes the results, gaps in research and presents it visually.

The actual implementation uses the model-agnostic Pi harness, powered by Nebius Token Factory. It implements 2 skills (`callimachus` adn `hypatia`) using python scripts for API queries of scientific databases (PubMed, Arxiv, OpenAlex, and others) and retrieval of titles/abstracts. Development used the Devin cloud platform for Hypatia development and Norma for quality assessment.

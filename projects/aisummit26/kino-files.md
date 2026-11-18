---
event: aisummit26
title: Kino Files
publishedDate: '2026-09-20'
description: >-
  Find your next favorite film with Kino Files, a conversational agent that
  listens to your group preferences and recommends real movies.
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - SLNG
  - Titan OS
  - Nebius
techStack: []
youtubeLink: 'https://youtu.be/TriAs3C575c'
hackers:
  - name: Anna Falceto Pinyol
    description: ''
    image:
      src: ''
    links: {}
  - name: Martì La Rosa Ramos
    description: ''
    image:
      src: ''
    links:
      linkedin: 'https://www.linkedin.com/in/martilarosaramos/'
      github: 'https://github.com/santo0'
  - name: Manuel Felix Parma
    description: ''
    image:
      src: ''
    links: {}
links:
  github: 'https://github.com/manuelfparma/hackbarna2026'
  website: 'https://kino-files-agent.thebluetonguegiraffe.online/'
  video: 'https://youtu.be/TriAs3C575c'
---
### The Problem

  Finding the right movie often feels like a chore, and deciding what to watch as a group is even harder—it often requires a "neutral" voice to settle the debate. Traditional recommendation engines rely on rigid genre tags, while generic LLMs hallucinate non-existent titles or recommend films you can't watch. Kino Files solves this by blending the conversational fluidity of LLMs with a strict Retrieval-Augmented Generation (RAG) pipeline to keep all suggestions grounded in reality, acting as the perfect mediator for your movie night.

  ### What We Built

  Kino Files is a full-stack, conversational AI movie recommender that solves this by combining the conversational fluidity of LLMs with the reliability of Retrieval-Augmented Generation (RAG). We built:

  1. A Data Pipeline & Vector DB: We processed the Letterboxd dataset to extract the top 1,000 popular films, embedding their unique themes and descriptions using Mistral, and stored them in a Supabase database with pgvector for semantic search.
  2. An AI Orchestrator Agent: A LangGraph-powered stateful agent that manages the multi-turn conversation, classifies user intents, and safely routes queries.
  3. An Interactive UI: A Reflex-based frontend that supports both text and voice (via Deepgram and Aura-2) to provide a seamless user experience, kept simple for a TV interface and easy usage.

  ### How It Works

  Kino Files ensures that the LLM is only used to route, extract criteria, and narrate—it never invents titles. Here is the step-by-step flow:

  1. Classification & Memory: When a user sends a message, the agent classifies the intent (e.g., theme search, direct catalog filter, or factual question) and extracts entities. It remembers constraints across turns, distinguishing between "hard" constraints (e.g., must be a Comedy) and "semantic" constraints (e.g., feels darker).
  2. Hybrid Retrieval: Depending on the intent, the system queries Supabase. For mood-based requests, it performs a two-hop semantic search: it first finds the closest matching themes using cosine similarity, then ranks the movies that carry those themes using a reciprocal rank algorithm. For explicit requests (e.g., "movies by Nolan"), it uses direct SQL filtering.
  3. Conversational Narration: The raw database results are passed to a reply LLM (Nebius Qwen), which acts as the system's "voice." It crafts a natural, short response presenting the curated shortlist.
  4. Refinement: The user can either pick a movie by its number to end the session, or provide feedback ("too much action"). The agent updates its accumulated search criteria and re-queries the database, creating a natural, iterative process until the perfect movie is found.

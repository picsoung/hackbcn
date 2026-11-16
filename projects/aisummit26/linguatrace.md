---
event: aisummit26
title: LinguaTrace
publishedDate: '2026-09-20'
description: >-
  LinguaTrace turns a live language lesson into practice built from the
  learner's own mistakes, without either person taking notes.
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - Vonage
  - Preply
techStack: []
youtubeLink: 'https://www.youtube.com/watch?v=wdozDzfWJfc'
hackers:
  - name: 'Hussein Saad Hasan, Alkhafaji'
    description: ''
    image:
      src: ''
    links: {}
links:
  github: 'https://github.com/HusDev/LinguaTrace'
  website: 'https://linguatrace-e04587.fly.dev/'
  video: 'https://www.youtube.com/watch?v=wdozDzfWJfc'
---
The problem. Learners forget most of what happens in a private language lesson. They write half a page of notes, miss corrections while they're busy speaking, and understand a mistake on the call only to repeat it a week later. Tutors then spend unpaid time after every lesson writing summaries and building exercises. And in a speaking lesson, note-taking is self-defeating: you cannot hold a conversation in a language you're still learning and write about it at the same time.

What we built. LinguaTrace sits inside a one-to-one lesson — video, a shared whiteboard, and a notebook that fills itself as people talk. It answers two different questions for two different people. The tutor sees what they haven't dealt with yet: mistakes still uncorrected, weaknesses recurring across previous lessons, and one concrete drill to run now, while the lesson is still happening. The learner gets the notebook, and afterwards a Lesson Pack — flashcards and gap-fills built from the sentences they personally got wrong. Every lesson is kept, so a learner can reopen one from a fortnight ago and practise it again.

How it works. Each device transcribes its own microphone with Gemini Live, so a turn is attributed structurally rather than by a diarisation model guessing at voices. Each finalised turn is then judged by TypeSafe's Jev in a single round trip: calibrated probabilities on one side (is this addressed to the other person? is it about the app? does it read as a mis-transcription rather than something the learner said? is the tutor correcting, teaching a word, explaining a rule?) and, sent in parallel, a speculative request that selects the exact spans worth quoting.

The rule the whole system is built on is Jev judges, code writes. The model never generates notebook text. Code enumerates candidate spans out of the real transcript and the model only picks one — so a "corrected sentence" is always something the tutor actually said, and the app cannot write up a mistake the learner never made. Uncertainty is shown rather than hidden: above 0.75 a note is confirmed, between 0.45 and 0.75 it is written but marked unsure, below that it is dropped. The one exception is the vocabulary gloss, because a translation cannot be quoted from a lesson — so it is generated, marked, and kept in a field of its own.

When the lesson ends, a reconciliation pass re-pairs corrections against the whole transcript, catching the ones the live window was too early to see. The Lesson Pack is then assembled in code: the gap-fill blanks the word the correction actually changed, found by aligning the learner's sentence against the tutor's.

Quality is measured rather than asserted. A labelled evaluation set scores every signal at the thresholds the app really uses, and separates missed notes from invented ones — because those two failures are not equal.

'use client'

import { useState, type FormEvent } from 'react'
import { btnPrimary, card, filterBtn, input, labelMono, pct } from './ui'

type Result = {
  model: string
  latencyMs: number
  category: {
    choice: string
    confidence: number
    probabilities: Record<string, number>
  }
  decisionPowered: number
  needsHuman: number
  scope: {
    score: number
    legend: Record<string, string>
    probabilities: Record<string, number>
  }
  categoryLabels: Record<string, string>
}

const SAMPLES = [
  {
    name: 'TicketTriage',
    tagline:
      'Reads incoming support emails and routes each one to billing, tech or sales, with an urgency flag.',
  },
  {
    name: 'SafeSpace',
    tagline:
      'Screens comments on a community forum and hides toxic ones before anyone sees them.',
  },
  {
    name: 'WarmLead',
    tagline:
      'Scores every inbound demo request from our website so sales calls the hottest leads first.',
  },
  {
    name: 'Hand-off Harry',
    tagline:
      "A support agent that knows when it's out of its depth and pings a human on Slack.",
  },
  {
    name: 'Tapas Roulette',
    tagline:
      'Tell it your mood and it picks the tapas bar in Gràcia you should go to tonight.',
  },
]

function Bars({ rows }: { rows: [string, number][] }) {
  return (
    <ul className="mt-3 space-y-1.5">
      {rows.map(([label, v]) => (
        <li
          key={label}
          className="grid grid-cols-[9rem_1fr_3rem] items-center gap-3 text-sm"
        >
          <span className="truncate text-screen-dim">{label}</span>
          <span className="h-2 bg-night-indigo">
            <span
              className="block h-full bg-neon-cyan"
              style={{ width: pct(v) }}
            />
          </span>
          <span className="text-right font-mono text-screen">{pct(v)}</span>
        </li>
      ))}
    </ul>
  )
}

function Answer({
  kind,
  question,
  children,
}: {
  kind: string
  question: string
  children: React.ReactNode
}) {
  return (
    <div className={card}>
      <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-neon-pink">
        {kind}
      </h3>
      <p className="mt-1 text-sm text-screen-dim">{question}</p>
      {children}
    </div>
  )
}

export default function JevLab() {
  const [name, setName] = useState(SAMPLES[0].name)
  const [tagline, setTagline] = useState(SAMPLES[0].tagline)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<Result | null>(null)

  async function ask(n = name, t = tagline) {
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/live/jev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: n, tagline: t }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) setError(data.error ?? "Jev didn't answer. Try again.")
      else setResult(data)
    } catch {
      setError("Jev didn't answer. Try again.")
    }
    setBusy(false)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    ask()
  }

  const labels = result?.categoryLabels ?? {}
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={onSubmit} className={card}>
        <label
          htmlFor="j-name"
          className="mb-1.5 block text-sm font-semibold text-screen"
        >
          Project name
        </label>
        <input
          id="j-name"
          required
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`${input} mb-4`}
        />
        <label
          htmlFor="j-tagline"
          className="mb-1.5 block text-sm font-semibold text-screen"
        >
          Pitch
        </label>
        <textarea
          id="j-tagline"
          required
          maxLength={280}
          rows={3}
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          className={`${input} mb-4`}
        />
        <div
          role="group"
          aria-label="Try an example"
          className="mb-4 flex flex-wrap items-center gap-2"
        >
          <span className={labelMono}>Try:</span>
          {SAMPLES.map((s) => (
            <button
              key={s.name}
              type="button"
              className={filterBtn}
              onClick={() => {
                setName(s.name)
                setTagline(s.tagline)
                ask(s.name, s.tagline)
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
        <p role="alert" className="mb-3 text-sm text-neon-pink">
          {error}
        </p>
        <button type="submit" disabled={busy} className={btnPrimary}>
          {busy ? 'Jev is deciding…' : 'Ask Jev'}
        </button>
      </form>

      <div aria-live="polite" className="space-y-4">
        {!result ? (
          <div className={card}>
            <p className="text-lg font-semibold text-screen">
              Answers appear here
            </p>
            <p className="text-screen-dim">
              Four questions, one request: a category choice, two yes/no checks
              and a scope score.
            </p>
          </div>
        ) : (
          <>
            <Answer
              kind="choice · category"
              question="What kind of decision does this hackathon project make?"
            >
              <p className="mt-2 text-3xl font-bold text-screen">
                {labels[result.category.choice] ?? result.category.choice}
              </p>
              <Bars
                rows={Object.entries(result.category.probabilities)
                  .sort((a, b) => b[1] - a[1])
                  .map(([k, v]) => [labels[k] ?? k, v])}
              />
            </Answer>
            <Answer
              kind="noul · decision-powered"
              question="Does this app rely on an AI model to make a decision or a judgement call?"
            >
              <Bars rows={[['Yes', result.decisionPowered]]} />
            </Answer>
            <Answer
              kind="noul · needs a human"
              question="Would a human need to review this app's decisions before they take effect?"
            >
              <Bars rows={[['Yes', result.needsHuman]]} />
            </Answer>
            <Answer
              kind="score · scope"
              question="How big is the scope of this idea for a four-hour hack night?"
            >
              <p className="mt-2 text-3xl font-bold text-screen">
                {result.scope.score.toFixed(2)}{' '}
                <span className="text-sm font-normal text-screen-dim">
                  / {Object.keys(result.scope.legend).length - 1}
                </span>
              </p>
              <Bars
                rows={Object.entries(result.scope.legend).map(([k, label]) => [
                  String(label).split(':')[0],
                  result.scope.probabilities[k] ?? 0,
                ])}
              />
            </Answer>
            <p className="font-mono text-xs text-screen-dim">
              {result.model} · {result.latencyMs} ms round trip · 4 questions in
              1 request
            </p>
          </>
        )}
      </div>
    </div>
  )
}

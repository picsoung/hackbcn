import 'server-only'
import { choice, noul, score, TypeSafeClient } from '@typesafe-ai/sdk'

// Credentials come from Netlify AI Gateway (TYPESAFE_API_KEY / TYPESAFE_BASE_URL are injected at runtime).
function getTypeSafe() {
  return new TypeSafeClient({
    timeout: 6000,
    retry: { maxRetries: 1 },
    // Node 24 enables the SDK's zstd bodies, which AI Gateway currently rejects.
    compression: false,
  })
}

export const JEV_MODEL = 'jev-latest'

/** The categories every project is sorted into. Order is the display order. */
export const CATEGORIES = {
  moderation: { label: 'Trust & safety', description: 'Trust and safety' },
  lead_scoring: { label: 'Sales & growth', description: 'Sales and growth' },
  routing: { label: 'Support & ops', description: 'Support and ops' },
  handoff: { label: 'Agents', description: 'AI agents' },
  personal: { label: 'Recommendations', description: 'Recommendations' },
  health: { label: 'Health & wellbeing', description: 'Health and wellbeing' },
  learning: { label: 'Learning', description: 'Learning and education' },
  money: { label: 'Money', description: 'Money and finance' },
  civic: { label: 'Social good', description: 'Social good and climate' },
  devtools: { label: 'Dev tools', description: 'Developer tools' },
  creative: { label: 'Creative', description: 'Art, music and media' },
  playful: { label: 'Games & fun', description: 'Games and fun' },
  other: { label: 'Something else', description: null },
} as const

export type CategoryKey = keyof typeof CATEGORIES

const categoryCriteria = Object.fromEntries(
  Object.entries(CATEGORIES).map(([k, v]) => [k, v.description]),
) as { [K in CategoryKey]: string | null }

/** Questions asked about every submitted project. Batched into one call. */
function projectQuestions() {
  return {
    category: choice(
      'What kind of decision does this hackathon project make?',
      categoryCriteria,
    ),
    decisionPowered: noul(
      'Does this app rely on an AI model to make a decision or a judgement call?',
    ),
  }
}

/** Extra questions used only on the public Jev playground. */
function playgroundQuestions() {
  return {
    ...projectQuestions(),
    needsHuman: noul(
      "Would a human need to review this app's decisions before they take effect?",
    ),
    scope: score(
      'How big is the scope of this idea for a four-hour hack night?',
      [
        'Tiny: a single prompt or a toy demo',
        'Focused: one clear workflow that works end to end',
        'Ambitious: several moving parts, integrations or users',
        'Moonshot: a whole product that would take weeks',
      ],
    ),
  }
}

export interface ProjectJevResult {
  category: CategoryKey
  confidence: number
  probabilities: Record<string, number>
  decisionPowered: number
  model: string
}

function projectState(p: { name: string; tagline: string; url?: string }) {
  return {
    project_name: p.name,
    pitch: p.tagline,
    ...(p.url ? { link: p.url } : {}),
  }
}

export async function categorizeProject(p: {
  name: string
  tagline: string
  url?: string
}): Promise<ProjectJevResult> {
  const { answers, model } = await getTypeSafe().systemOne({
    model: JEV_MODEL,
    state: projectState(p),
    questions: projectQuestions(),
  })
  return {
    category: answers.category.choice,
    confidence: answers.category.confidence,
    probabilities: { ...answers.category.probabilities },
    decisionPowered: answers.decisionPowered.noul,
    model,
  }
}

export async function playground(input: { name: string; tagline: string }) {
  const started = Date.now()
  const { answers, model, usage } = await getTypeSafe().systemOne({
    model: JEV_MODEL,
    state: projectState(input),
    questions: playgroundQuestions(),
  })
  return {
    model,
    latencyMs: Date.now() - started,
    usage,
    category: {
      choice: answers.category.choice,
      confidence: answers.category.confidence,
      probabilities: answers.category.probabilities,
    },
    decisionPowered: answers.decisionPowered.noul,
    needsHuman: answers.needsHuman.noul,
    scope: {
      score: answers.scope.score,
      confidence: answers.scope.confidence,
      legend: answers.scope.legend,
      probabilities: answers.scope.probabilities,
    },
  }
}

/** The snippet shown on the playground page, kept next to the real code so they don't drift. */
export const PLAYGROUND_SNIPPET = `import "server-only";
import { choice, noul, score, TypeSafeClient } from "@typesafe-ai/sdk";

// Credentials come from Netlify AI Gateway; send plain JSON through the proxy.
const typesafe = new TypeSafeClient({ compression: false });

const { answers } = await typesafe.systemOne({
  model: "jev-latest",
  state: { project_name, pitch },
  questions: {
    category: choice("What kind of decision does this hackathon project make?", {
      moderation: "Flagging, filtering or reviewing user content…",
      lead_scoring: "Qualifying, ranking or prioritising leads…",
      routing: "Triaging tickets, emails or requests…",
      handoff: "Deciding when an AI agent should escalate to a human",
      // …
      other: null,
    }),
    decisionPowered: noul("Does this app rely on an AI model to make a decision?"),
    needsHuman: noul("Would a human need to review this app's decisions?"),
    scope: score("How big is the scope of this idea for a hack night?", [
      "Tiny", "Focused", "Ambitious", "Moonshot",
    ]),
  },
});

answers.category.choice;        // "routing"
answers.category.probabilities; // { routing: 0.81, handoff: 0.09, … }
answers.decisionPowered.noul;   // 0.94`

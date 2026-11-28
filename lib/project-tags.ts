import {
  eventChallengeTags,
  projectChallenges,
  projectTools,
  projectTopics,
  type ProjectTagDefinition,
} from '../data/project-tags'

const nonTagCharacters = new RegExp('[^\\p{L}\\p{N}]+', 'gu')
function key(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(nonTagCharacters, '')
}

function index(definitions: ProjectTagDefinition[]) {
  return new Map(
    definitions.flatMap((definition) =>
      [definition.id, definition.label, ...definition.aliases].map(
        (alias) => [key(alias), definition] as const,
      ),
    ),
  )
}

const topics = index(projectTopics),
  tools = index(projectTools),
  challenges = index(projectChallenges)
const values = (input: unknown): string[] =>
  Array.isArray(input)
    ? input.filter(
        (value): value is string =>
          typeof value === 'string' && Boolean(value.trim()),
      )
    : []
const unique = (labels: string[]) => Array.from(new Set(labels))
const labels = (input: unknown, registry: Map<string, ProjectTagDefinition>) =>
  unique(
    values(input).flatMap((value) => registry.get(key(value))?.label ?? []),
  )
const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Short words such as "make" and "next" are valid exact tool names, but prose is not usage evidence.
const exactOnly = new Set(['make', 'next', 'node', 'git', 'render'])
const shortTools = new Set(['n8n', 'mcp', 'css', 'glm', 'tca', 'bun'])
const caseSensitiveAliases = new Set(['JS', 'TS', 'Git'])
const toolPatterns = projectTools.flatMap((definition) =>
  unique([definition.label, ...definition.aliases])
    .filter(
      (alias) =>
        caseSensitiveAliases.has(alias) ||
        (!exactOnly.has(key(alias)) &&
          (key(alias).length > 3 || shortTools.has(key(alias)))),
    )
    .map((alias) => ({
      definition,
      pattern: new RegExp(
        `(^|[^\\p{L}\\p{N}])(${escape(alias)})(?=$|[^\\p{L}\\p{N}])`,
        caseSensitiveAliases.has(alias) ? 'u' : 'iu',
      ),
    })),
)

const toolCache = new Map<string, string[]>()
export function normalizeProjectTools(input: unknown): string[] {
  return unique(
    values(input).flatMap((value) => {
      const exact = tools.get(key(value))
      if (exact) return [exact.label]
      const source = value.slice(0, 64000)
      const cached = toolCache.get(source)
      if (cached) return cached
      // Descriptive source fields remain in the source. Only recognized names become UI tags.
      const text = source.replace(/https?:\/\/\S+/g, (url) =>
        ' '.repeat(url.length),
      )
      const matches = toolPatterns
        .flatMap(({ definition, pattern }) => {
          const found = pattern.exec(text)
          return found
            ? [
                {
                  label: definition.label,
                  start: found.index + found[1].length,
                  end: found.index + found[0].length,
                },
              ]
            : []
        })
        .sort((a, b) => a.start - b.start || b.end - a.end)
      const accepted: typeof matches = []
      for (const match of matches)
        if (
          !accepted.some(
            (previous) =>
              match.start < previous.end && match.end > previous.start,
          )
        )
          accepted.push(match)
      const result = accepted.map((match) => match.label)
      // Source fields repeat across event, detail, builder and sitemap requests.
      if (toolCache.size >= 256)
        toolCache.delete(toolCache.keys().next().value!)
      toolCache.set(source, result)
      return result
    }),
  )
}

export type ProjectTags = {
  topics: string[]
  tools: string[]
  challenges: string[]
  tags: string[]
}
export type ProjectTagInput = {
  event?: string
  topics?: unknown
  tools?: unknown
  challenges?: unknown
  category?: string | null
  legacyTags?: unknown
  legacyTools?: unknown
}

/** Normalize imports and live submissions at the shared boundary, leaving original source records intact. */
export function normalizeProjectTags(input: ProjectTagInput): ProjectTags {
  const legacy = values(input.legacyTags)
  const challengeIds =
    input.event && Object.hasOwn(eventChallengeTags, input.event)
      ? eventChallengeTags[input.event]
      : undefined
  const topicLabels = labels(
    [
      ...values(input.topics),
      ...(input.category ? [input.category] : []),
      ...(!challengeIds ? legacy : []),
    ],
    topics,
  )
  const toolLabels = normalizeProjectTools([
    ...values(input.tools),
    ...values(input.legacyTools),
    ...(!challengeIds ? legacy.filter((value) => !topics.has(key(value))) : []),
  ])
  const challengeLabels = labels(
    [...values(input.challenges), ...(challengeIds ? legacy : [])],
    challenges,
  ).filter(
    (label) =>
      !challengeIds || challengeIds.includes(challenges.get(key(label))!.id),
  )
  return {
    topics: topicLabels,
    tools: toolLabels,
    challenges: challengeLabels,
    tags: unique([...topicLabels, ...toolLabels]),
  }
}

const searchIndex = new Map<string, string[]>()
for (const definition of [
  ...projectTopics,
  ...projectTools,
  ...projectChallenges,
]) {
  const aliases = [definition.id, definition.label, ...definition.aliases]
  for (const alias of aliases)
    searchIndex.set(
      key(alias),
      unique([...(searchIndex.get(key(alias)) ?? []), ...aliases]),
    )
}
export function projectTagSearchTerms(labels: string[]) {
  return labels.flatMap((label) => searchIndex.get(key(label)) ?? [label])
}

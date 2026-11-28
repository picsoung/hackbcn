# Project tags

Every event uses one shared taxonomy from `data/project-tags.ts`. Stable IDs identify tags. Canonical labels and aliases control display and search. The projection in `lib/project-tags.ts` is shared by event cards, the project archive, builder pages and project details.

## Three groups

| Group            | Meaning                                               | Examples                                          |
| ---------------- | ----------------------------------------------------- | ------------------------------------------------- |
| Topics           | What a project is about                               | Developer tools, Productivity, Health & wellbeing |
| Built with       | Explicitly supplied technologies                      | Next.js, TypeScript, PyTorch, ElevenLabs, n8n     |
| Event challenges | Challenges selected in that edition's submission form | Nebius, Norrsken / DeepFire, TravelPerk           |

Selecting a sponsor challenge does not prove that its tool was used. These labels never populate the technology list. Generic categories such as Technology and Other, and choices such as None of the above, do not become chips.

Cards show at most four topic/tool labels. Details show every known label under the appropriate group, with translated headings in EN/ES/CA/FR. The archive search indexes canonical labels and aliases in all three groups, so NextJS finds Next.js and fast api finds FastAPI. Structured project data includes the same canonical keywords.

## Existing sources

| Source                             | Original `tags`                       | Original `techStack`                            |
| ---------------------------------- | ------------------------------------- | ----------------------------------------------- |
| AI Summit 2025 and 2026            | Event challenges                      | Technologies where supplied                     |
| Skill-a-thon and Netlify HackNight | Explicit topics and technologies      | Technologies where supplied                     |
| First edition                      | No topic list                         | Technologies                                    |
| Live Jev-a-thon                    | The existing category maps to a topic | The submitted usedLovable flag supplies Lovable |

Source records remain intact. Normalization happens after public visibility is resolved. No private project details, emails or attendee fields enter the taxonomy or search index. Existing hidden-project totals and account permissions are unaffected.

Historical technology fields contain spelling variants and prose. Exact aliases normalize to one label: NextJS becomes Next.js, Node JS becomes Node.js, fast api becomes FastAPI and Pytorch becomes PyTorch. Recognized product names are extracted from longer tooling answers; paragraphs and unknown filler never become chips. URLs alone do not establish a technology. Ambiguous short words such as make, next and render are accepted as exact tool names, rather than matched inside ordinary prose. Unknown terms remain in the original source for review. Topics are not guessed from project descriptions or the event theme.

## New curated records

Use registered IDs in the explicit fields:

```yaml
topics: [devtools, productivity]
tools: [typescript, nextjs, supabase]
challenges: [lovable]
```

Omit a group when there is no supporting submission information. Historical `tags` and `techStack` still work through the compatibility projection. The existing account editor does not accept taxonomy fields; this change does not introduce an unreviewed editing path.

Before adding a new tag, check the registry for an existing concept. Add an alias for alternate casing, spelling or a renamed label; keep its ID stable. Add a genuinely new concept with an explicit ID and a short canonical label. Challenge IDs must also be configured for the edition in `eventChallengeTags` when importing its historical `tags` field. Do not classify a sponsor as a used technology without explicit evidence.

CI checks alias collisions, registered IDs in curated metadata, event challenge configuration, cross-event normalization, tag search, and the rendered groups in all four languages.

```sh
node --test tests/project-tags.test.cjs
node tests/project-tags-routes.integration.mjs http://localhost:8888
```

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { renderProfileClaimInvitation } from '../lib/email/profile-claim-invitation.mjs'
import { emailLocales } from '../lib/email/copy.mjs'

// Rendering has no provider credentials or sending capability.
const root = fileURLToPath(new URL('../', import.meta.url))
const { values } = parseArgs({
  options: {
    input: { type: 'string' },
    out: { type: 'string' },
    locale: { type: 'string' },
    all: { type: 'boolean', default: false },
  },
})
if (values.all && values.locale) throw new Error('Choose --all or --locale')
const input = values.input
  ? JSON.parse(await readFile(resolve(values.input), 'utf8'))
  : {
      firstName: 'Nicolas',
      projects: [
        { event: 'Skill-a-thon HackNight', name: 'Royal Crown Lingo' },
      ],
      manageUrl:
        'http://localhost:8888/en/account/projects?project=archive%3Askillathon-hacknight-2026%2Froyal-crown-lingo',
      preview: true,
    }
// Embed the public logo in the local HTML so previewing never requires a deploy.
const logo = await readFile(
  resolve(root, 'public/email/hackbarna-wordmark.png'),
)
const baseOutput = resolve(
  values.out ?? resolve(root, 'docs/email-previews/profile-claim-test.html'),
)
if (!baseOutput.endsWith('.html'))
  throw new Error('Output must be an HTML file')
const locales = values.all
  ? [null, ...emailLocales]
  : [values.locale ?? input.locale ?? null]
for (const locale of locales) {
  const email = renderProfileClaimInvitation({
    ...input,
    locale,
    logoSrc: 'data:image/png;base64,' + logo.toString('base64'),
  })
  const suffix =
    locale && locale !== 'all' && (values.all || !values.out)
      ? `.${locale}`
      : ''
  const output = baseOutput.replace(/\.html$/, `${suffix}.html`)
  await mkdir(dirname(output), { recursive: true })
  await writeFile(output, email.html, { mode: 0o600 })
  await writeFile(output.replace(/\.html$/, '') + '.txt', email.text, {
    mode: 0o600,
  })
  console.log(
    `Rendered ${locale ?? 'all languages'} HTML and plain-text invitation at ${output}. No email sent.`,
  )
}

const assert = require('node:assert/strict')
const path = require('node:path')
const { registerHooks } = require('node:module')
const { test } = require('node:test')
require('ts-node').register({
  skipProject: true,
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
    esModuleInterop: true,
    jsx: 'react-jsx',
  },
})
const root = path.resolve(__dirname, '..')
const aliases = registerHooks({
  resolve(specifier, context, next) {
    return next(
      specifier.startsWith('@/')
        ? path.join(root, specifier.slice(2))
        : specifier,
      context,
    )
  },
})
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const ProjectAward =
  require('../app/components/projects/ProjectAward.tsx').default
const ProjectGrid =
  require('../app/components/projects/ProjectGrid.tsx').default
const { projectPageCopy } = require('../data/project-page.ts')
const { getProjects } = require('../app/helpers/projects.ts')
const { archivedProjectCard } = require('../lib/project-cards.ts')
aliases.deregister()

const card = {
  key: 'archive:sample',
  name: 'Team demo',
  description: 'A working prototype.',
  href: '/en/projects/sample',
  creator: 'Ada, Sam',
  hackers: [{ name: 'Ada' }, { name: 'Sam' }],
  image: '/projects/demo.jpg',
  eventName: 'HackBarna 2024',
  eventDate: 0,
  tags: [],
}

test('archived prize labels remain authoritative and sponsor challenges never become awards', () => {
  const projects = getProjects()
  for (const project of projects) {
    assert.equal(
      archivedProjectCard(project, 'en').award,
      project.data.winner?.text,
    )
  }
  assert.equal(
    archivedProjectCard(
      projects.find((p) => p.slug === 'candit'),
      'en',
    ).award,
    'Grand prize',
  )
  const ordinary = archivedProjectCard(
    projects.find((p) => p.slug === 'aisummit26/ai-meeting-moderator'),
    'en',
  )
  assert.ok(ordinary.challenges.length)
  assert.equal(ordinary.award, undefined)
  assert.doesNotMatch(
    renderToStaticMarkup(
      React.createElement(ProjectGrid, { projects: [ordinary] }),
    ),
    /data-project-award/,
  )
})

test('both prize treatments localize recognition while preserving the actual award and event names', () => {
  for (const locale of ['en', 'es', 'ca', 'fr']) {
    for (const variant of ['card', 'detail']) {
      const html = renderToStaticMarkup(
        React.createElement(ProjectAward, {
          award: 'Hookdeck',
          eventName: 'HackBarna 2024',
          locale,
          variant,
        }),
      )
      assert.ok(
        html.includes(projectPageCopy(locale).prizeWinner),
        `${locale}: ${variant}`,
      )
      assert.ok(html.includes('Hookdeck'))
      assert.equal(html.includes('HackBarna 2024'), variant === 'detail')
      assert.doesNotMatch(html, /Grand prize|1st|First place/)
    }
  }
})

test('winning cards lead with recognition and expose it in the localized accessible link name', () => {
  const html = renderToStaticMarkup(
    React.createElement(ProjectGrid, {
      projects: [{ ...card, award: 'Grand prize' }],
      locale: 'fr',
    }),
  )
  assert.match(html, /aria-label="Voir Team demo\. Projet primé: Grand prize"/)
  assert.ok(html.indexOf('data-project-award="card"') < html.indexOf('<img'))
  assert.ok(html.indexOf('data-project-award="card"') < html.indexOf('<h3'))
  assert.ok(html.includes('Ada, Sam'))
  assert.equal((html.match(/data-project-award=/g) || []).length, 1)
})

test('empty awards render nothing and long award labels remain complete on both variants', () => {
  for (const award of [undefined, '', '   '])
    assert.equal(
      renderToStaticMarkup(
        React.createElement(ProjectAward, { award, locale: 'en' }),
      ),
      '',
    )
  const award =
    'Community favourite for accessible multilingual collaboration and developer tools'
  for (const variant of ['card', 'detail']) {
    const html = renderToStaticMarkup(
      React.createElement(ProjectAward, { award, locale: 'en', variant }),
    )
    assert.ok(html.includes(award))
    assert.doesNotMatch(html, /truncate|line-clamp|whitespace-nowrap/)
  }
})

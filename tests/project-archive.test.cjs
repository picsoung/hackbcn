const assert = require('node:assert/strict')
const { test } = require('node:test')
require('ts-node').register({
  skipProject: true,
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
    esModuleInterop: true,
  },
})
const { getProjects } = require('../app/helpers/projects.ts')

test('existing Markdown publication dates remain valid for sitemap generation', () => {
  const projects = getProjects()
  assert.ok(projects.length > 0)
  for (const project of projects) {
    assert.ok(
      Number.isFinite(project.data.publishedDate.getTime()),
      project.slug,
    )
    if (project.data.modifiedDate)
      assert.ok(
        Number.isFinite(project.data.modifiedDate.getTime()),
        project.slug,
      )
  }
})

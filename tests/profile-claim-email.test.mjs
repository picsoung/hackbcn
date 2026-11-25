import assert from 'node:assert/strict'
import { test } from 'node:test'
import { renderProfileClaimInvitation } from '../lib/email/profile-claim-invitation.mjs'

const fixture = {
  firstName: 'Ada',
  projects: [{ event: 'HackNight', name: 'My project' }],
  preview: true,
}

test('unknown language produces one invitation containing all three complete versions and one signature', () => {
  const email = renderProfileClaimInvitation(fixture)
  for (const locale of ['en', 'es', 'ca']) {
    assert.ok(email.html.includes(`<div lang="${locale}"`))
    assert.match(email.html, new RegExp(`/${locale}/account/projects`))
  }
  assert.equal(email.text.match(/Fem communitat, hackejem\nNico/g)?.length, 1)
  assert.equal(email.html.match(/Fem communitat, hackejem<br>/g)?.length, 1)
  assert.ok(email.text.includes('English\n\nHi Ada,'))
  assert.ok(email.text.includes('Castellano\n\nHola Ada,'))
  assert.ok(email.text.includes('Català\n\nHola Ada,'))
})

test('unreviewed names and project text cannot inject HTML into an invitation', () => {
  const email = renderProfileClaimInvitation({
    ...fixture,
    firstName: '<img src=x onerror=alert(1)>',
    projects: [{ event: 'A & B', name: '</p><script>alert(1)</script>' }],
  })
  assert.doesNotMatch(email.html, /<script>|<img src=x/)
  assert.match(email.html, /&lt;script&gt;/)
  assert.match(email.html, /A &amp; B/)
  assert.match(email.text, /A & B/)
})

test('claim actions remain on HackBarna and local-only links require preview mode', () => {
  for (const manageUrl of [
    'javascript:alert(1)',
    'https://attacker.example/en/account/projects',
    'https://www.hackbarna.com@attacker.example/en/account/projects',
    'https://www.hackbarna.com/en/projects/some-project',
  ])
    assert.throws(() => renderProfileClaimInvitation({ ...fixture, manageUrl }))
  assert.throws(() =>
    renderProfileClaimInvitation({
      ...fixture,
      preview: false,
      manageUrl: 'http://localhost:8888/en/account/projects',
      optOutUrl: 'https://www.hackbarna.com/invitations/stop',
      postalAddress: 'Organiser address',
    }),
  )
})

test('a participant version cannot render until the opt-out and organiser address are provided', () => {
  assert.throws(() =>
    renderProfileClaimInvitation({ ...fixture, preview: false }),
  )
  const email = renderProfileClaimInvitation({
    ...fixture,
    preview: false,
    optOutUrl: 'https://www.hackbarna.com/invitations/stop?token=example',
    postalAddress: 'Organiser address',
  })
  assert.match(email.html, /Stop profile invitations/)
  assert.doesNotMatch(email.html, /localhost|Test preview/)
  assert.equal(email.reply_to, 'nico@hackbarna.com')
})

test('each language routes to its matching account and Digest pages without losing project selection', () => {
  const project = 'archive:skillathon-hacknight-2026/royal-crown-lingo'
  for (const locale of ['en', 'es', 'ca']) {
    const email = renderProfileClaimInvitation({
      ...fixture,
      locale,
      manageUrl: `http://localhost:8888/en/account/projects?project=${encodeURIComponent(project)}`,
    })
    assert.match(email.html, new RegExp(`<html lang="${locale}">`))
    const expected = `http://localhost:8888/${locale}/account/projects?project=${encodeURIComponent(project)}`
    assert.ok(email.html.includes(`href="${expected}"`))
    assert.ok(email.text.includes(expected))
    const digest = `https://digest.hackbarna.com/${locale === 'en' ? '' : locale}`
    assert.ok(email.html.includes(`href="${digest}"`))
    assert.ok(email.text.includes(digest))
    assert.match(
      email.html,
      /Fem communitat, hackejem<br><strong>Nico<\/strong>/,
    )
    assert.match(email.text, /Fem communitat, hackejem\nNico/)
    assert.doesNotMatch(email.text, /See you at the next one/)
  }
  assert.throws(() =>
    renderProfileClaimInvitation({ ...fixture, locale: 'unknown' }),
  )
})

import {
  emailBrand,
  emailButton,
  emailUrl,
  escapeHtml,
  renderBrandEmail,
} from './brand-template.mjs'
import { emailLocales, emailSignOff, getEmailCopy } from './copy.mjs'

function safeText(value, maximum = 300) {
  if (
    typeof value !== 'string' ||
    !value.trim() ||
    value.length > maximum ||
    /[\u0000-\u001f\u007f]/.test(value)
  )
    throw new Error('Invalid invitation text')
  return value.trim()
}

function accountLink(value, preview, locale) {
  const url = new URL(value)
  const allowed = [
    'https://www.hackbarna.com',
    'https://hackbarna.com',
    ...(preview ? ['http://localhost:8888', 'http://127.0.0.1:8888'] : []),
  ]
  if (
    !allowed.includes(url.origin) ||
    !/^\/(en|es|ca|fr)\/account(?:\/|$)/.test(url.pathname)
  )
    throw new Error('Invalid account link')
  emailUrl(value, { localPreview: preview })
  url.pathname = url.pathname.replace(
    /^\/(en|es|ca|fr)(?=\/account)/,
    `/${locale}`,
  )
  return url.href
}

/** Pure rendering only: this module never sends mail or changes subscriptions. */
function renderSingleInvitation({
  locale = 'en',
  firstName,
  projects,
  manageUrl,
  preview = false,
  logoSrc,
  optOutUrl,
  postalAddress,
}) {
  const copy = getEmailCopy(locale)
  const name = firstName ? safeText(firstName, 120) : ''
  if (!Array.isArray(projects) || !projects.length || projects.length > 100)
    throw new Error('Expected credited projects')
  const groups = new Map()
  for (const project of projects) {
    const event = safeText(project.event),
      title = safeText(project.name)
    const items = groups.get(event) ?? []
    items.push(title)
    groups.set(event, items)
  }
  const accountUrl = accountLink(
    manageUrl ?? `https://www.hackbarna.com/${locale}/account/projects`,
    preview,
    locale,
  )
  if (!preview && (!optOutUrl || !postalAddress))
    throw new Error(
      'Campaign emails need an opt-out link and organiser address',
    )
  const address = postalAddress ? safeText(postalAddress, 500) : ''
  const optOut = optOutUrl ? emailUrl(optOutUrl) : ''
  const { subject, introduction, invitation, accountHelp, review } = copy
  const listed = projects.length === 1 ? copy.listedOne : copy.listedMany
  const digestUrl = `https://digest.hackbarna.com/${locale === 'en' ? '' : locale}`
  const accountHelpHtml = escapeHtml(accountHelp).replace(
    'HackBarna Digest',
    `<a href="${digestUrl}" style="color:${emailBrand.pink};text-decoration:underline">HackBarna Digest</a>`,
  )
  const projectHtml = Array.from(
    groups,
    ([event, titles]) =>
      `<tr><td style="padding:15px 0;border-top:1px solid ${emailBrand.edge}"><p style="margin:0 0 5px;color:${emailBrand.dim};font-size:13px">${escapeHtml(event)}</p>${titles.map((title) => `<p class="hb-project" style="margin:4px 0;color:${emailBrand.screen};font-size:20px;line-height:1.4;font-weight:700">${escapeHtml(title)}</p>`).join('')}</td></tr>`,
  ).join('')
  const bodyHtml = `<p style="margin:0 0 20px">${escapeHtml(copy.greeting(name))}</p>
<p style="margin:0 0 20px">${escapeHtml(introduction)}</p>
<p style="margin:0 0 6px">${escapeHtml(listed)}</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 22px">${projectHtml}</table>
<p style="margin:0 0 20px">${escapeHtml(invitation)}</p>
${emailButton(copy.action, accountUrl, { localPreview: preview })}
<p style="margin:0 0 20px">${accountHelpHtml}</p>
<p style="margin:0 0 16px;color:${emailBrand.dim};font-size:13px;line-height:1.7">${review}</p>`
  const footerHtml = preview
    ? escapeHtml(copy.previewFooter)
    : `${escapeHtml(copy.footer)}<br><a href="${optOut}" style="color:${emailBrand.dim};text-decoration:underline">${escapeHtml(copy.optOut)}</a><br>${escapeHtml(address)}`
  const previewNote = preview ? copy.previewNote : ''
  const html = renderBrandEmail({
    locale,
    title: subject,
    previewText: copy.previewText,
    bodyHtml,
    footerHtml,
    previewNote,
    logoSrc,
  })
  const bodyText = [
    copy.greeting(name),
    introduction,
    listed,
    Array.from(
      groups,
      ([event, titles]) =>
        `${event}\n${titles.map((title) => '• ' + title).join('\n')}`,
    ).join('\n\n'),
    invitation,
    copy.action + ': ' + accountUrl,
    accountHelp.replace('HackBarna Digest', `HackBarna Digest (${digestUrl})`),
    review,
  ].join('\n\n')
  const footerText = preview
    ? copy.previewFooter
    : `${copy.footer}\n${copy.optOut}: ${optOutUrl}\n${address}`
  const text = [
    ...(preview ? [copy.previewPrefix + ' ' + previewNote] : []),
    bodyText,
    emailSignOff + '\nNico',
    copy.reply + ' nico@hackbarna.com.',
    footerText,
  ].join('\n\n')
  return {
    // Keep the sender that was verified in the previous test. Reply-To can be
    // personal without changing the provider's sending-domain configuration.
    from: `${copy.from} <digest@hackbarna.com>`,
    reply_to: 'nico@hackbarna.com',
    subject: preview ? copy.previewPrefix + ' ' + subject : subject,
    html,
    text,
    bodyHtml,
    bodyText,
    footerHtml,
    footerText,
    previewNote,
  }
}

/** Unknown preference is deliberately multilingual, never inferred from a page locale. */
export function renderProfileClaimInvitation(input) {
  const { locale } = input
  if (locale !== undefined && locale !== null && locale !== 'all') {
    const {
      bodyHtml,
      bodyText,
      footerHtml,
      footerText,
      previewNote,
      ...email
    } = renderSingleInvitation(input)
    return email
  }
  const labels = { en: 'English', es: 'Castellano', ca: 'Català' }
  const sections = emailLocales.map((language) => ({
    language,
    email: renderSingleInvitation({ ...input, locale: language }),
  }))
  const bodyHtml = sections
    .map(
      ({ language, email }, i) =>
        `<div lang="${language}" style="${i ? `margin-top:40px;padding-top:28px;border-top:1px solid ${emailBrand.edge}` : ''}"><h2 style="margin:0 0 24px;color:${emailBrand.cyan};font-size:20px;line-height:1.4">${labels[language]}</h2>${email.bodyHtml}</div>`,
    )
    .join('')
  const footerHtml = sections
    .map(
      ({ language, email }) =>
        `<p lang="${language}" style="margin:0 0 12px">${email.footerHtml}</p>`,
    )
    .join('')
  const subject = 'Your HackBarna projects / Tus proyectos / Els teus projectes'
  const previewNote = input.preview
    ? sections.map(({ email }) => email.previewNote).join('\n')
    : ''
  return {
    from: sections[0].email.from,
    reply_to: sections[0].email.reply_to,
    subject: (input.preview ? '[TEST] ' : '') + subject,
    html: renderBrandEmail({
      title: subject,
      previewText: 'English · Castellano · Català',
      bodyHtml,
      footerHtml,
      previewNote,
      previewLabel: 'Test / Prueba / Prova',
      logoSrc: input.logoSrc,
      replyLabel: 'Reply / Responde / Respon',
    }),
    text: [
      ...(input.preview ? ['TEST / PRUEBA / PROVA\n' + previewNote] : []),
      ...sections.map(
        ({ language, email }) => labels[language] + '\n\n' + email.bodyText,
      ),
      emailSignOff + '\nNico',
      'Reply / Responde / Respon: nico@hackbarna.com',
      ...sections.map(({ email }) => email.footerText),
    ].join('\n\n'),
  }
}

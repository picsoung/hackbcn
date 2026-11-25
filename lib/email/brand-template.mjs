// Email clients need inline sRGB colours and raster logos. These values come
// from DESIGN.md; browser-only OKLCH, SVG and clip-path are not dependable here.
import { emailSignOff, getEmailCopy } from './copy.mjs'

export const emailBrand = {
  ink: '#06060E',
  raised: '#0B0A16',
  indigo: '#140F26',
  edge: '#40405A',
  pink: '#FF3D9A',
  cyan: '#4DE3E8',
  screen: '#E6E8F2',
  dim: '#9AA0BF',
  logo: 'https://www.hackbarna.com/email/hackbarna-wordmark.png',
}

export function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        character
      ],
  )
}

export function emailUrl(value, { localPreview = false } = {}) {
  const url = new URL(value)
  const local =
    localPreview &&
    url.protocol === 'http:' &&
    ['localhost', '127.0.0.1'].includes(url.hostname)
  if ((!local && url.protocol !== 'https:') || url.username || url.password)
    throw new Error('Invalid email link')
  return escapeHtml(url.href)
}

// The inner table adds a two-step corner without relying on clip-path.
export function emailButton(label, url, { localPreview = false } = {}) {
  const href = emailUrl(url, { localPreview })
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0 24px">
    <tr><td width="4"></td><td bgcolor="${emailBrand.pink}" height="4" style="height:4px;font-size:0;line-height:0">&nbsp;</td><td width="4"></td></tr>
    <tr><td bgcolor="${emailBrand.pink}" width="4"></td><td bgcolor="${emailBrand.pink}" style="mso-padding-alt:14px 20px"><a class="hb-button" href="${href}" style="display:block;padding:14px 20px;color:${emailBrand.ink};font-size:16px;line-height:1.4;font-weight:700;text-decoration:none">${escapeHtml(label)}</a></td><td bgcolor="${emailBrand.pink}" width="4"></td></tr>
    <tr><td width="4"></td><td bgcolor="${emailBrand.pink}" height="4" style="height:4px;font-size:0;line-height:0">&nbsp;</td><td width="4"></td></tr>
  </table>`
}

/** bodyHtml/footerHtml are trusted markup from an email renderer, not user input. */
export function renderBrandEmail({
  locale = 'en',
  title,
  previewText,
  bodyHtml,
  footerHtml,
  previewNote = '',
  logoSrc = emailBrand.logo,
  replyTo = 'nico@hackbarna.com',
  replyLabel,
  previewLabel,
}) {
  const copy = getEmailCopy(locale)
  if (replyTo !== 'nico@hackbarna.com') throw new Error('Unknown reply address')
  const logo =
    /^(?:cid:[a-zA-Z0-9._-]+|data:image\/png;base64,[A-Za-z0-9+/=]+)$/.test(
      logoSrc,
    )
      ? escapeHtml(logoSrc)
      : emailUrl(logoSrc)
  const brand = emailBrand
  return `<!doctype html>
<html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>${escapeHtml(title)}</title>
<style>
  a:focus-visible{outline:2px solid ${brand.screen};outline-offset:4px}
  .hb-button:focus-visible{outline:2px solid ${brand.ink};outline-offset:-4px}
  @media(max-width:600px){.hb-gutter{padding-left:24px!important;padding-right:24px!important}.hb-shell{width:100%!important}.hb-logo{width:200px!important;height:auto!important}.hb-button{padding-left:14px!important;padding-right:14px!important}.hb-project{font-size:18px!important}}
</style></head>
<body style="margin:0;padding:0;background-color:${brand.ink};color:${brand.screen}">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${escapeHtml(previewText)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="${brand.ink}"><tr><td align="center" style="padding:28px 12px">
<!--[if mso]><table role="presentation" width="600" cellspacing="0" cellpadding="0"><tr><td><![endif]-->
<table class="hb-shell" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;font-family:Inter,Arial,Helvetica,sans-serif;font-size:16px;line-height:1.7">
  <tr><td class="hb-gutter" bgcolor="${brand.pink}" style="padding:32px 36px"><a href="https://www.hackbarna.com/${locale}" style="display:inline-block;color:${brand.ink};text-decoration:none"><img class="hb-logo" src="${logo}" alt="HackBarna" width="230" height="43" style="display:block;width:230px;height:43px;max-width:100%;border:0"></a></td></tr>
  ${previewNote ? `<tr><td class="hb-gutter" bgcolor="${brand.indigo}" style="padding:14px 36px;color:${brand.dim};font-size:12px;line-height:1.6"><strong style="color:${brand.screen}">${escapeHtml(previewLabel ?? copy.previewLabel)}</strong><br>${escapeHtml(previewNote).replace(/\n/g, '<br>')}</td></tr>` : ''}
  <tr><td class="hb-gutter" bgcolor="${brand.raised}" style="padding:36px 36px 12px;color:${brand.screen}">${bodyHtml}</td></tr>
  <tr><td class="hb-gutter" bgcolor="${brand.raised}" style="padding:8px 36px 32px;color:${brand.screen}"><p style="margin:0">${escapeHtml(emailSignOff)}<br><strong>Nico</strong></p></td></tr>
  <tr><td class="hb-gutter" bgcolor="${brand.cyan}" style="padding:20px 36px;color:${brand.ink};font-size:14px;line-height:1.6">${escapeHtml(replyLabel ?? copy.reply)} <a href="mailto:${replyTo}" style="color:${brand.ink};text-decoration:underline">${replyTo}</a>.</td></tr>
  <tr><td class="hb-gutter" style="padding:18px 36px 4px;color:${brand.dim};font-size:12px;line-height:1.65">${footerHtml}</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`
}

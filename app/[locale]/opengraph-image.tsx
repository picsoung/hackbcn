import { ImageResponse } from 'next/og'
import i18nConfig from '../../i18n.json'

export const runtime = 'edge'
export const alt = 'HackBarna — AI Hackathons & Events in Barcelona'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

async function loadLocaleData(locale: string) {
  const finalLocale = [
    i18nConfig.locale.source,
    ...i18nConfig.locale.targets,
  ].includes(locale)
    ? locale
    : i18nConfig.locale.source

  const localeData = await import(`@/i18n/${finalLocale}.json`)
  return localeData.default as Record<string, string>
}

export default async function Image({
  params,
}: {
  params: { locale: string }
}) {
  const localeData = await loadLocaleData(params.locale)

  // Title is "HackBarna — <tagline>"; split the tagline off the wordmark.
  const title = localeData['meta.title'] ?? 'HackBarna'
  const [wordmark, ...rest] = title.split('—')
  const tagline = rest.join('—').trim()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '90px',
          background:
            'radial-gradient(900px circle at 80% 0%, #C70039 0%, transparent 55%), radial-gradient(1000px circle at 0% 110%, #FF5733 0%, transparent 45%), linear-gradient(135deg, #1a0033 0%, #2a0a45 100%)',
          fontFamily: 'sans-serif',
          color: '#ffffff',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: '#FF5733',
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background: '#FF5733',
              marginRight: 18,
            }}
          />
          Barcelona
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 132,
            fontWeight: 800,
            lineHeight: 1,
            marginTop: 28,
            letterSpacing: -2,
          }}
        >
          {wordmark.trim()}
        </div>

        {tagline ? (
          <div
            style={{
              display: 'flex',
              fontSize: 46,
              fontWeight: 500,
              marginTop: 28,
              color: '#f3e9ff',
              maxWidth: 900,
            }}
          >
            {tagline}
          </div>
        ) : null}

        <div
          style={{
            display: 'flex',
            fontSize: 30,
            fontWeight: 400,
            marginTop: 44,
            color: '#cbb8e6',
          }}
        >
          A community of builders · hands-on hackathons & workshops
        </div>
      </div>
    ),
    { ...size },
  )
}

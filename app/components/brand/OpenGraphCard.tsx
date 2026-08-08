import type { CSSProperties } from 'react'

const COLORS = {
  ground: '#06060E',
  raised: '#0B0A16',
  violet: '#241242',
  pink: '#FF3D9A',
  cyan: '#4DE3E8',
  ink: '#E6E8F2',
  dim: '#9AA0BF',
  paper: '#EFEADF',
}

function PixelCorners({ color }: { color: string }) {
  const corner: CSSProperties = {
    position: 'absolute',
    width: 14,
    height: 14,
    backgroundColor: color,
  }

  return (
    <>
      <div style={{ ...corner, left: 0, top: 0 }} />
      <div style={{ ...corner, right: 0, top: 0 }} />
      <div style={{ ...corner, left: 0, bottom: 0 }} />
      <div style={{ ...corner, right: 0, bottom: 0 }} />
    </>
  )
}

export function formatOgDate(startDate: string, endDate?: string) {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : start
  const month = new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' })
  const sameDay = start.toISOString().slice(0, 10) === end.toISOString().slice(0, 10)
  const sameMonth = start.getUTCMonth() === end.getUTCMonth()
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear()

  if (sameDay) return `${month.format(start)} ${start.getUTCDate()}, ${start.getUTCFullYear()}`
  if (sameMonth && sameYear) return `${month.format(start)} ${start.getUTCDate()}–${end.getUTCDate()}, ${end.getUTCFullYear()}`
  if (sameYear) return `${month.format(start)} ${start.getUTCDate()} – ${month.format(end)} ${end.getUTCDate()}, ${end.getUTCFullYear()}`
  return `${month.format(start)} ${start.getUTCDate()}, ${start.getUTCFullYear()} – ${month.format(end)} ${end.getUTCDate()}, ${end.getUTCFullYear()}`
}

export default function OpenGraphCard({
  title,
  eyebrow,
  date,
  location,
  imageUrl,
  wordmarkUrl,
  footer = 'hackbarna.com',
}: {
  title: string
  eyebrow?: string
  date?: string
  location?: string
  imageUrl?: string
  wordmarkUrl?: string
  footer?: string
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        padding: '54px 58px 48px 72px',
        backgroundColor: COLORS.ground,
        color: COLORS.ink,
      }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, width: 14, height: '100%', backgroundColor: COLORS.pink }} />
      <div style={{ position: 'absolute', left: 14, top: 0, width: 6, height: '100%', backgroundColor: COLORS.cyan }} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '57%',
          height: '100%',
          paddingRight: 42,
        }}
      >
        {wordmarkUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={wordmarkUrl}
            alt="HackBarna"
            width="270"
            height="50"
            style={{ width: 270, height: 50, objectFit: 'contain', objectPosition: 'left center' }}
          />
        ) : null}

        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 68 }}>
          {eyebrow ? (
            <div
              style={{
                display: 'flex',
                alignSelf: 'flex-start',
                padding: '8px 13px',
                backgroundColor: COLORS.cyan,
                color: COLORS.ground,
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              {eyebrow}
            </div>
          ) : null}

          <div
            style={{
              display: 'flex',
              marginTop: eyebrow ? 20 : 0,
              maxWidth: 600,
              color: COLORS.ink,
              fontSize: title.length > 32 ? 50 : 60,
              fontWeight: 700,
              lineHeight: 1.04,
              letterSpacing: '-0.035em',
            }}
          >
            {title}
          </div>

          {date ? (
            <div style={{ display: 'flex', marginTop: 34, color: COLORS.ink, fontSize: 24, fontWeight: 700 }}>
              <span style={{ display: 'flex', marginRight: 12, color: COLORS.pink }}>■</span>
              {date}
            </div>
          ) : null}

          {location ? (
            <div style={{ display: 'flex', marginTop: 11, color: COLORS.dim, fontSize: 23, fontWeight: 600 }}>
              <span style={{ display: 'flex', marginRight: 12, color: COLORS.cyan }}>■</span>
              {location}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 'auto',
            color: COLORS.dim,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          {footer}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '43%',
          height: '100%',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: 4,
            top: 92,
            width: 406,
            height: 406,
            backgroundColor: COLORS.violet,
          }}
        />
        <div
          style={{
            display: 'flex',
            position: 'relative',
            width: 430,
            height: 430,
            padding: 13,
            paddingBottom: 48,
            backgroundColor: COLORS.paper,
          }}
        >
          <PixelCorners color={COLORS.ground} />
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              backgroundColor: COLORS.raised,
            }}
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                width="404"
                height="369"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  color: COLORS.pink,
                  fontSize: 132,
                  fontWeight: 700,
                }}
              >
                H
              </div>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              left: 34,
              right: 34,
              bottom: 15,
              justifyContent: 'space-between',
              color: COLORS.ground,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            <span>Barcelona</span>
            <span style={{ color: COLORS.pink }}>build / ship / repeat</span>
          </div>
        </div>
      </div>
    </div>
  )
}

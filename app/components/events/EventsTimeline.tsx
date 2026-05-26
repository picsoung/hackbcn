type Marker = {
  label: string
  x: number
  variant: 'past' | 'now' | 'soon'
}

// Positions on a 1200-unit horizontal canvas. Hand-tuned so they read evenly
// while leaving room for the "now" caret above 2026 and the "soon" tick on the right.
const MARKERS: Marker[] = [
  { label: '2024', x: 120, variant: 'past' },
  { label: '2025', x: 420, variant: 'past' },
  { label: '2026', x: 720, variant: 'now' },
  { label: 'soon', x: 1060, variant: 'soon' },
]

const INK = 'oklch(0.22 0.02 50)'
const CORAL = 'oklch(0.62 0.18 33)'
const MUTED = 'oklch(0.55 0.01 50 / 0.6)'

export default function EventsTimeline({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 80"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Timeline from 2024 through 2026 and beyond, marking when HackBarna events have happened and what's still to come."
      className={`block w-full ${className}`}
    >
      {/* Hand-drawn baseline: a path with subtle vertical jitter so it doesn't read as a ruler. */}
      <path
        d="M 40 38 C 200 36, 360 41, 520 38 S 840 35, 1000 39 L 1160 37"
        fill="none"
        stroke={INK}
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Tick marks + year labels */}
      {MARKERS.map((m) => {
        const isNow = m.variant === 'now'
        const isSoon = m.variant === 'soon'
        return (
          <g key={m.label}>
            {/* Tick */}
            <line
              x1={m.x}
              y1={isNow ? 30 : 32}
              x2={m.x}
              y2={isNow ? 46 : 44}
              stroke={isNow ? CORAL : INK}
              strokeWidth={isNow ? 2 : 1.4}
              strokeLinecap="round"
              strokeDasharray={isSoon ? '3 3' : undefined}
            />
            {/* Label */}
            <text
              x={m.x}
              y={64}
              textAnchor="middle"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              fontSize="11"
              fontWeight={isNow ? '700' : '500'}
              fill={isNow ? CORAL : isSoon ? MUTED : INK}
              style={{ letterSpacing: '0.18em', textTransform: 'uppercase' }}
            >
              {m.label}
            </text>
          </g>
        )
      })}

      {/* "now" caret + label above the 2026 tick */}
      <g>
        <text
          x={720}
          y={14}
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="9"
          fontWeight="700"
          fill={CORAL}
          style={{ letterSpacing: '0.28em', textTransform: 'uppercase' }}
        >
          now
        </text>
        <path
          d="M 720 18 L 716 24 L 724 24 Z"
          fill={CORAL}
        />
      </g>
    </svg>
  )
}

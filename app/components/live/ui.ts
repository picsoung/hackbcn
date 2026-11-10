/** Shared Tailwind class strings for the live wall. Night register tokens from tailwind.config.ts. */
export const btn =
  'hb-px hb-px-sm inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset disabled:opacity-60'
export const btnPrimary = `${btn} bg-neon-pink text-night-ink hover:bg-neon-cyan focus-visible:ring-night-ink`
export const btnSecondary = `${btn} bg-night-violet text-screen hover:bg-night-indigo focus-visible:ring-neon-cyan`
export const btnSm = 'px-3 py-2 text-xs'
export const kicker =
  'mb-4 block font-mono text-xs uppercase tracking-[0.3em] text-neon-pink'
export const labelMono =
  'mb-2 block font-mono text-xs uppercase tracking-[0.3em] text-screen-dim'
export const chip =
  'hb-px hb-px-sm inline-block bg-neon-cyan px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-night-ink'
export const chipDim =
  'hb-px hb-px-sm inline-block bg-night-violet px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-screen-dim'
export const card = 'hb-px bg-night-raised p-6'
export const input =
  'w-full bg-night-ink px-3 py-2.5 text-screen placeholder:text-screen-dim/60 outline outline-1 outline-night-violet focus-visible:outline-2 focus-visible:outline-neon-cyan aria-[invalid=true]:outline-neon-pink'
export const filterBtn =
  'border border-night-violet px-3 py-1.5 font-mono text-xs text-screen-dim hover:text-screen aria-pressed:border-neon-cyan aria-pressed:bg-neon-cyan aria-pressed:text-night-ink'

export const pct = (n: number | null | undefined) =>
  `${Math.round((n ?? 0) * 100)}%`

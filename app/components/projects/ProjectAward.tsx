import { TrophyIcon } from '@heroicons/react/24/outline'
import { projectPageCopy } from '@/data/project-page'

export default function ProjectAward({
  award,
  locale,
  variant = 'card',
  tone = 'night',
  eventName,
}: {
  award?: string
  locale: string
  variant?: 'card' | 'detail'
  tone?: 'night' | 'light'
  eventName?: string
}) {
  if (!award?.trim()) return null
  const detail = variant === 'detail'
  const colors =
    tone === 'light' ? 'bg-slate-900 text-slate-50' : 'bg-accent text-ground'

  return (
    <div
      data-project-award={variant}
      className={`flex items-start ${colors} ${detail ? 'hb-px max-w-3xl gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5' : 'gap-3 px-5 py-3'}`}
    >
      <TrophyIcon
        className={`shrink-0 ${detail ? 'mt-0.5 h-8 w-8 sm:h-9 sm:w-9' : 'mt-0.5 h-5 w-5'}`}
        aria-hidden="true"
      />
      <div className="min-w-0 [overflow-wrap:anywhere]">
        <p className={`font-semibold ${detail ? 'text-sm' : 'text-xs'}`}>
          {projectPageCopy(locale).prizeWinner}
        </p>
        <p
          className={`mt-1 font-bold leading-snug ${detail ? 'text-xl sm:text-2xl' : 'text-base'}`}
        >
          {award}
        </p>
        {detail && eventName && (
          <p className="mt-2 text-sm leading-relaxed">{eventName}</p>
        )}
      </div>
    </div>
  )
}

import Link from 'next/link'
import { organiserCopy } from '@/data/organiser'
import { accountSecondary } from './account-styles'

export interface PendingReviewItem {
  id: string
  name: string
  eventName: string
  href: string
  kind: 'projectEdit' | 'ownershipRequest'
}

export default function PendingReviews({
  locale,
  items,
}: {
  locale: string
  items: PendingReviewItem[]
}) {
  if (!items.length) return null
  const copy = organiserCopy(locale)
  const edits = items.filter((item) => item.kind === 'projectEdit').length
  return (
    <section
      aria-labelledby="pending-reviews-title"
      data-pending-reviews
      className="mb-8 rounded-pixel border border-accent/40 bg-ground-raised px-5 py-5 sm:px-6"
    >
      <h2 id="pending-reviews-title" className="text-xl font-semibold">
        {copy.pendingReviews} ({items.length})
      </h2>
      <p className="mt-2 text-sm text-ink-dim">
        {copy.projectEdits}: {edits} · {copy.ownershipRequests}:{' '}
        {items.length - edits}
      </p>
      <ul className="mt-4 divide-y divide-ink/15">
        {items.slice(0, 5).map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className="flex min-h-14 flex-wrap items-center justify-between gap-x-5 gap-y-1 py-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              <span className="min-w-0 basis-48 grow">
                <span className="break-words font-semibold underline decoration-ink/30 underline-offset-4">
                  {item.name}
                </span>
                <span className="mt-1 block text-ink-dim">
                  {item.eventName}
                </span>
              </span>
              <span className="text-ink-dim">{copy[item.kind]}</span>
            </Link>
          </li>
        ))}
      </ul>
      {items.length > 5 && (
        <Link
          href={`/${locale}/account/review`}
          className={`${accountSecondary} mt-4`}
        >
          {copy.allReviews} ({items.length})
        </Link>
      )}
    </section>
  )
}

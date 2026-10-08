import type { Testimonial } from '@/data/testimonials'

const platformLabels = {
  linkedin: 'LinkedIn',
  x: 'X',
  press: 'Press',
}

export default function TestimonialCard({
  post,
  light = false,
}: {
  post: Testimonial
  light?: boolean
}) {
  const label = platformLabels[post.platform]

  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Read ${post.author}'s ${label} post`}
      className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className={`hb-px hb-px-shadow h-full overflow-hidden ${
        light ? 'bg-white text-slate-900' : 'bg-ground-raised text-ink'
      }`}>
        {post.image ? (
          <img
            src={post.image}
            alt={`${post.author}'s ${label} post about HackBarna`}
            loading="lazy"
            decoding="async"
            className="h-auto w-full"
          />
        ) : (
          <div className="flex h-full min-h-48 flex-col justify-between gap-8 p-5 sm:p-6">
            <p className="text-lg leading-relaxed">{post.excerpt}</p>
            <div className={`flex items-center justify-between gap-3 border-t pt-4 text-sm ${
              light ? 'border-slate-200 text-slate-600' : 'border-band-2 text-ink-dim'
            }`}>
              <span className="font-semibold">{post.author}</span>
              <span className="shrink-0 font-mono text-xs uppercase tracking-wide group-hover:underline">
                {label} ↗
              </span>
            </div>
          </div>
        )}
      </div>
    </a>
  )
}

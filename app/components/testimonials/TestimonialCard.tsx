import Image from 'next/image'
import { FaLinkedin, FaLink, FaSquareXTwitter } from 'react-icons/fa6'
import type { Testimonial } from '@/data/testimonials'

const platformLabels = {
  linkedin: 'LinkedIn',
  x: 'X',
  press: 'Press',
}

const platformIcons = {
  linkedin: FaLinkedin,
  x: FaSquareXTwitter,
  press: FaLink,
}

export default function TestimonialCard({
  post,
  light = false,
}: {
  post: Testimonial
  light?: boolean
}) {
  const label = platformLabels[post.platform]
  const PlatformIcon = platformIcons[post.platform]

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
            <div className={`flex items-center gap-3 border-t pt-4 text-sm ${
              light ? 'border-slate-200 text-slate-600' : 'border-band-2 text-ink-dim'
            }`}>
              {post.avatar ? (
                <Image
                  src={post.avatar}
                  alt=""
                  width={post.avatarKind === 'logo' ? 72 : 48}
                  height={48}
                  className={`h-12 shrink-0 border ${
                    post.avatarKind === 'logo'
                      ? 'w-[72px] rounded-md border-band-2 bg-white p-1.5 object-contain'
                      : 'w-12 rounded-full border-band-2 object-cover'
                  }`}
                />
              ) : (
                <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/15 font-semibold text-accent">
                  {post.author.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className={`block font-semibold ${light ? 'text-slate-900' : 'text-ink'}`}>{post.author}</span>
                {post.position && <span className="mt-0.5 block text-xs leading-snug">{post.position}</span>}
              </span>
              <span className={`shrink-0 text-xl transition-transform group-hover:-translate-y-0.5 ${
                light ? 'text-[#0A66C2]' : 'text-[#70B5F9]'
              }`}>
                <PlatformIcon aria-hidden="true" />
              </span>
            </div>
          </div>
        )}
      </div>
    </a>
  )
}

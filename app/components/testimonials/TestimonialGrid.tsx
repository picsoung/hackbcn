import type { Testimonial } from '@/data/testimonials'
import TestimonialCard from './TestimonialCard'

export default function TestimonialGrid({
  posts,
  light = false,
}: {
  posts: Testimonial[]
  light?: boolean
}) {
  const imageOnly = posts.every((post) => post.image)

  return (
    <div className={imageOnly
      ? 'columns-1 gap-5 sm:columns-2 lg:columns-3'
      : 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'}>
      {posts.map((post) => (
        <div key={post.url} className={imageOnly ? 'mb-5 break-inside-avoid' : 'h-full'}>
          <TestimonialCard post={post} light={light} />
        </div>
      ))}
    </div>
  )
}

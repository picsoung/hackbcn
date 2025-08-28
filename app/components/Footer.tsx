'use client'
import { useIntl } from './Intl'
import { events } from '@/lib/events'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function Footer({ padding = false }) {
  const intl = useIntl()
  const pathname = usePathname()
  
  // Extract current event slug from pathname
  const pathParts = pathname.split('/')
  const currentEventSlug = pathParts.length >= 3 ? pathParts[2] : null

  return (
    <footer>
      <div style={{ display: 'none' }}>
        {/* <script
          id="formless_embed"
          src="https://embed.formless.ai/embed.js"
          async={true}
          style={{display: 'none'}}
          data-type="trigger"
          data-trigger-type="banner"
          data-trigger-title={intl.t('footer.form.title')}
          data-trigger-subtitle={intl.t('footer.form.subtitle')}
          data-conversation-id="a1DBrrA9bUXA" 
        ></script> */}
      </div>
      
      {/* Events Section */}
      <div className="border-t border-white/20">
        <div className={`mx-auto max-w-7xl ${padding ? 'px-6 lg:px-8' : ''} py-8`}>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-4">
              Our Events
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              {[...events].reverse().map((event) => (
                <Link
                  key={event.slug}
                  href={`/${intl.locale}/${event.slug}`}
                  className={`${
                    event.slug === currentEventSlug
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  } px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex flex-col items-center min-w-[120px]`}
                >
                  <span className="font-semibold">{event.name}</span>
                  <span className="text-xs opacity-90">{event.year}</span>
                  {event.active && (
                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full mt-1">
                      Latest
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div
        className={`mx-auto max-w-7xl ${
          padding ? 'px-6 lg:px-8' : ''
        } py-6 md:flex md:items-center md:justify-between`}
      >
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-lg leading-5 text-white">
            &copy; 2024. {intl.t('footer.signature')}{' '}
            <span style={{ color: 'red' }}>&#x2764;</span>.
          </p>
        </div>
      </div>
    </footer>
  )
}

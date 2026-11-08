import Image from 'next/image'
import Link from 'next/link'

type PastPartner = {
  name: string
  logo: string
  eventPath: string
  eventName: string
}

export default function SponsorLogos({
  id,
  title,
  logos,
  locale,
}: {
  id: string
  title: string
  logos: PastPartner[]
  locale: string
}) {
  return (
    <div className="sponsor-logo-group">
      <h3 id={id}>{title}</h3>
      <ul className="sponsor-logo-list" aria-labelledby={id}>
        {logos.map((partner) => (
          <li key={partner.name}>
            <Link
              href={`/${locale}${partner.eventPath}`}
              className="sponsor-logo-link"
              aria-label={`${partner.name}: ${partner.eventName}`}
              title={`${partner.name}: ${partner.eventName}`}
            >
              <span className="sponsor-logo-plate hb-px">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  unoptimized
                  width={116}
                  height={40}
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

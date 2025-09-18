import { Sponsor } from '@/data/sponsors'

export default function CommunitySponsors({
  communitySponsors,
}: {
  communitySponsors: Sponsor[]
}) {
  return (
    <div id="community-sponsors" className="py-10 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <h2 className="mt-2 text-3xl sm:text-5xl font-cal font-semibold text-neutral-100">
          Community Partners
        </h2>
        <h3 className="mt-4 text-lg sm:text-lg font-cal font-semibold text-neutral-200">
          Making the local ecosystem stronger
        </h3>
        <div className="flex flex-col flex-wrap justify-center items-center mx-auto mt-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 items-center justify-items-center max-w-6xl">
            {communitySponsors.map((sponsor) => (
              <a
                key={sponsor.name}
                href={sponsor.url}
                target="_blank"
                rel="noopener"
                className="flex items-center justify-center p-4 hover:scale-105 transition-transform duration-200"
              >
                <img
                  className="h-24 min-h-[96px] w-auto object-contain max-w-[240px]"
                  src={sponsor.logo}
                  alt={`${sponsor.name} logo"}`}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

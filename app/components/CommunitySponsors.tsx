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
          Community Sponsors
        </h2>
        <h3 className="mt-4 text-lg sm:text-lg font-cal font-semibold text-neutral-200">
          Making the local ecosystem stronger
        </h3>
        <div className="flex flex-col flex-wrap justify-center items-center mx-auto gap-4 mt-12">
          <div className="flex flex-wrap gap-4 items-center">
            {communitySponsors.map((sponsor, index) => (
              <a key={index} href={sponsor.url} target="_blank">
                <img
                  className="h-auto max-h-40 object-contain hover:cursor-pointer"
                  src={sponsor.logo}
                  alt={`${sponsor.name} logo`}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

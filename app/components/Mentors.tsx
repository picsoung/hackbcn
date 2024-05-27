import { useIntl } from "./Intl";

const members = (intl: ReturnType<typeof useIntl>) => [
  {
    name: intl.t('mentors.item.0.name'),
    description: intl.t('mentors.item.0.description'),
    image: {
      src: `https://pbs.twimg.com/profile_images/1784295597228335104/dQY2N4zt_400x400.jpg`,
    },
    twitter: "https://twitter.com/okuiux",
    website: "https://float.build/",
  }
];

export default function Mentors() {
  const intl = useIntl();
  return (
    <div id="judges" className="bg-white py-10 sm:py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="mt-2 text-3xl sm:text-5xl font-cal font-semibold text-indigo-600">
            {intl.t('judges.title')}
          </h2>
        </div>
        <div className="mx-auto mt-16 max-w-2xl lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {members(intl).map((member) => (
              <div key={member.name} className="flex flex-col align-middle">
                <dt className="flex items-center gap-x-3 text-xl sm:text-2xl font-bold leading-7 text-gray-900">
                  <span
                    className="h-5 w-12 flex-none text-indigo-600"
                    aria-hidden="true"
                  />
                  {member.name}
                </dt>
                <dd className="mt-2">
                  <div>
                    <img
                      className="rounded-full aspect-square object-cover"
                      src={member.image.src}
                      alt={member.name}
                      width="230"
                      height="230"
                      style={{ border: "2px solid black" }}
                    />
                  </div>
                  <div className="mt-4 flex flex-auto flex-col text-lg leading-7 text-gray-800">
                    <p className="flex-auto">{member.description}</p>
                  </div>
                  <div></div>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

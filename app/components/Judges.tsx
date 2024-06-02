import Link from "next/link";
import { useIntl } from "./Intl";
import { FaSquareXTwitter, FaLinkedin, FaLink,FaMedium } from "react-icons/fa6";

const members = (intl: ReturnType<typeof useIntl>) => [
  {
    name: "Linus Ekenstam",
    description: "AI Gardener & Designer",
    image: {
      src: `https://pbs.twimg.com/profile_images/1584806710769762304/qCu_Jaox_400x400.jpg`,
    },
    links: {
      twitter: "https://twitter.com/LinusEkenstam",
      website: "https://insidemyhead.ai/",
    },
  },
  {
    name: "Anna Via",
    description:`ML Product Manager @ Adevinta`,
    image: {
      src: `/judges/annavia.jpeg`,
    },
    links: {
      linkedin: "https://www.linkedin.com/in/anna-via/",
      medium: "https://annaviaba.medium.com/",
    },
  },
  // {
  //   name: intl.t("judges.item.2.name"),
  //   description: intl.t("judges.item.2.description"),
  //   image: {
  //     src: `https://picsum.photos/200`,
  //   },
  // },
];

export default function Judges() {
  const intl = useIntl();
  return (
    <div id="judges" className="bg-white py-10 sm:py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="mt-2 text-3xl sm:text-5xl font-cal font-semibold text-indigo-600">
            {intl.t("judges.title")}
          </h2>
        </div>
        <div className="mx-auto mt-16 max-w-2xl lg:max-w-none">
          <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {members(intl).map((member) => (
              <div
                key={member.name}
                className="flex flex-col items-center gap-2"
              >
                <img
                  className="rounded-full aspect-square object-cover"
                  src={member.image.src}
                  alt={member.name}
                  width="230"
                  height="230"
                  // style={{ border: "2px" }}
                />
                <span className="mb-2 text-xl font-medium leading-tight">
                  {member.name}
                </span>
                <p className="text-neutral-500 dark:text-neutral-400">
                  {member.description}
                </p>
                <div className="flex flex-row gap-4">
                  {member.links &&
                    Object.keys(member.links).map((linkType: string) => {
                      console.log("liiinktype", linkType);
                      return (
                        <Link href={member.links[linkType]}>
                          {linkType === "twitter" && (
                            <FaSquareXTwitter className="text-3xl" />
                          )}
                          {linkType === "linkedin" && (
                            <FaLinkedin className="text-3xl" />
                          )}
                          {linkType === "website" && (
                            <FaLink className="text-3xl" />
                          )}
                          {linkType === "medium" && (
                            <FaMedium className="text-3xl" />
                          )}
                        </Link>
                      );
                    })}
                </div>
                {/* <dt className="flex items-center gap-x-3 text-xl sm:text-2xl font-bold leading-7 text-gray-900">
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
                </dd> */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

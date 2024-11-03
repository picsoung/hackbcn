import { Person } from "@/app/helpers/projects"

export interface EventJudges {
    [key: string]: {
        judges: Person[]
    }
}

export const eventJudges: EventJudges = {
    'v1-2024': {
        judges: [
            {
                name: 'Linus Ekenstam',
                description: 'AI Gardener & Designer',
                image: {
                    src: `https://pbs.twimg.com/profile_images/1584806710769762304/qCu_Jaox_400x400.jpg`,
                },
                links: {
                    twitter: 'https://twitter.com/LinusEkenstam',
                    website: 'https://insidemyhead.ai/',
                },
            },
            {
                name: 'Anna Via',
                description: `ML Product Manager @ Adevinta`,
                image: {
                    src: `/judges/annavia.jpeg`,
                },
                links: {
                    linkedin: 'https://www.linkedin.com/in/anna-via/',
                    medium: 'https://annaviaba.medium.com/',
                },
            },
            {
                name: 'Pavel Pratyush',
                description: `Head of Engineering @ Acai Travel`,
                image: {
                    src: `/judges/pavel.png`,
                },
                links: {
                    linkedin: 'https://www.linkedin.com/in/akpratyush/',
                    website: 'https://www.acaitravel.com',
                },
            },
            {
                name: 'Tanya Van Gastel',
                description: `Co-founder/CMO @ Multiverse AI`,
                image: {
                    src: `/judges/tanya.png`,
                },
                links: {
                    linkedin: 'https://www.linkedin.com/in/tanyavangastel/',
                    website: 'https://www.themultiverse.ai',
                },
            },
            // ... other judges
        ]
    },
    'mwc25': {
        judges: [
            {
                name: 'John Smith',
                description: 'AI Research Director @ Tech Corp',
                image: {
                    src: `https://avatar.iran.liara.run/public`,
                },
                links: {
                    linkedin: 'https://www.linkedin.com/in/johnsmith/',
                    twitter: 'https://twitter.com/johnsmith',
                },
            },
            {
                name: 'Maria Garcia',
                description: 'ML Engineering Lead @ Innovation Labs',
                image: {
                    src: `https://avatar.iran.liara.run/public`,
                },
                links: {
                    linkedin: 'https://www.linkedin.com/in/mariagarcia/',
                    website: 'https://example.com',
                },
            },
            {
                name: 'David Chen',
                description: 'Founder @ AI Startups Inc',
                image: {
                    src: `https://avatar.iran.liara.run/public`,
                },
                links: {
                    linkedin: 'https://www.linkedin.com/in/davidchen/',
                    website: 'https://example.com',
                },
            }
        ]
    }
}

// export const getAllEventSlugs = () => {
//     return Object.keys(eventJudges)
// }

export const getJudgesByEvent = (eventSlug: string) => {
    return eventJudges[eventSlug] || { judges: [] }
}
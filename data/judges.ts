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
                    src: `/judges/linus.jpeg`,
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
    'aisummit25': {
        judges: [
            {
                name: 'Igor Sakhankov',
                description: 'Principal Software Engineer @  Glovo',
                image: {
                    src: `https://media.licdn.com/dms/image/v2/C5603AQEU6njmIYURMQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1606599514435?e=1762992000&v=beta&t=HNW2Amdr5ed8IBhMECzc4n0cM22jWhO9w3Voe1sgj_w`,
                },
                links: {
                    linkedin: 'https://www.linkedin.com/in/igor-sakhankov/'
                },
            },
            {
                name: 'Elena Zangeeva',
                description: 'Founder @ Kvistly',
                image: {
                    src: `https://media.licdn.com/dms/image/v2/D4D03AQGocZH222houg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1715716389872?e=1762992000&v=beta&t=ct9ni7t4hcsWXB9h2xP-WlAyBaVoaLbdX55gCDwQFcQ`,
                },
                links: {
                    linkedin: 'https://www.linkedin.com/in/elenazangeeva/',
                    website: 'https://kvistly.com/',
                },
            },
            {
                name: 'Vincent Jong',
                description: 'Founder & CEO at Poolside Ventures',
                image: {
                    src: `https://media.licdn.com/dms/image/v2/D4D03AQHQZeuuBGJ-Xg/profile-displayphoto-shrink_800_800/B4DZcGVPw0G0Ac-/0/1748157922834?e=1762992000&v=beta&t=fAXjBXlWczMTU_0t4wYlWd5KakCFcy15PXJqyuqK7Hg`,
                },
                links: {
                    linkedin: 'https://www.linkedin.com/in/vincentjong',
                    website: 'www.poolside.ventures',
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
import { Person } from "@/app/helpers/projects"

export interface EventMentors {
    [key: string]: {
        mentors: Person[]
    }
}

export const eventMentors: EventMentors = {
    'v1-2024': {
        mentors: [
            {
                name: 'Eric Bellet',
                description: 'AI & Data Engineer @ Adevinta',
                image: {
                    src: `/mentors/ericbellet.jpeg`,
                },
                links: {
                    linkedin: 'https://www.linkedin.com/in/belleteric/',
                    twitter: 'https://x.com/eric_bellet',
                },
            },
            {
                name: 'Javier López-Nieto',
                description: 'Founding Software Engineer @ Açai Travel',
                image: {
                    src: `/mentors/javierlopez.jpeg`,
                },
                links: {
                    linkedin: 'https://www.linkedin.com/in/javier-lopez-nieto/',
                    website: 'https://www.acaitravel.com/',
                },
            },
            {
                name: 'David Okuniev',
                description: 'Co-founder of Float, Co-Founder of Typeform',
                image: {
                    src: `/mentors/davidokuniev.jpeg`,
                },
                links: {
                    linkedin: 'https://www.linkedin.com/in/david-okuniev-a845b66',
                    website: 'https://supercut.video/',
                },
            },
            {
                name: 'Joan Gomez',
                description: 'Senior Software Engineer @ eDreams ODIGEO',
                image: {
                    src: `/mentors/joangomez.jpeg`,
                },
                links: {
                    linkedin: 'https://www.linkedin.com/in/joangomezalvarez/',
                },
            },
            {
                name: 'Manuel Alba',
                description: 'Data Scientist @ eDreams ODIGEO',
                image: {
                    src: `/mentors/manuelalba.jpeg`,
                },
                links: {
                    linkedin: 'https://www.linkedin.com/in/manuel-alba-aviles/',
                },
            },
        ]
    },
    'aisummit25': {
        mentors: [
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

export const getMentorsByEvent = (eventSlug: string) => {
    return eventMentors[eventSlug] || { mentors: [] }
}
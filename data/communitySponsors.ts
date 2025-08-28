export interface Sponsor {
    name: string
    logo: string
    url: string
    tier?: 'gold' | 'silver' | 'bronze'
}

export interface CommunitySponsors {
    [key: string]: {
        communitySponsors: Sponsor[]
    }
}

export const communitySponsors: CommunitySponsors = {
    'v1-2024': {
        communitySponsors: [
            {
                url: "https://techfems.org/",
                logo: "/logos/community/techfems.png",
                name: "TechFems"
            },
            {
                url: "https://www.saturdays.ai/online",
                logo: "/logos/community/saturdaysai.png",
                name: "SaturdaysAI"
            },
            {
                url: "https://www.camarafrancesa.es/",
                logo: "/logos/community/ccibcn.png",
                name: "Chambre de Commerce Francaise à Barcelone"
            },
            {
                url: "https://www.meetup.com/ai-engineers-barcelona/",
                logo: "/logos/community/aibcn.png",
                name: "AI Engineers Barcelona meetup logo"
            },
            {
                url: "https://pybcn.org/pyladies_bcn/meetups/",
                logo: "/logos/community/pyladies-bcn.jpeg",
                name: "PyLadies BCN"
            },
            {
                url: "https://pybcn.org",
                logo: "/logos/community/pybcn.png",
                name: "PyBCN"
            },
            {
                url: "https://www.youtube.com/@rivela_",
                logo: "/logos/community/RivelaLogo.png",
                name: "Rivela youtube"
            },
            {
                url: "https://www.youtube.com/@la_inteligencia_artificial/",
                logo: "/logos/community/intelligencia_artificial_logo.jpeg",
                name: "Artificial Intelligence youtube"
            }
        ]
    },
    'aisummit25': {
        communitySponsors: [
            {
                url: "https://example-community1.com",
                logo: "https://unsplash.it/300/80",
                name: "Community Partner 1"
            },
            {
                url: "https://example-community2.com",
                logo: "https://unsplash.it/300/80",
                name: "Community Partner 2"
            },
            {
                url: "https://example-community3.com",
                logo: "https://unsplash.it/300/80",
                name: "Community Partner 3"
            }
        ]
    }
}

// export const getAllEventSlugs = () => {
//     return Object.keys(eventJudges)
// }

export const getCommunitySponsorsByEvent = (eventSlug: string) => {
    return communitySponsors[eventSlug] || { communitySponsors: [] }
}
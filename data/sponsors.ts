export interface Sponsor {
    name: string
    logo: string
    url: string
    width?: number
    height?: number
    className?: string,
    tier?: 'gold' | 'silver' | 'bronze'
}

export interface EventSponsors {
    [key: string]: {
        sponsors: Sponsor[]
    }
}

export const eventSponsors: EventSponsors = {
    'v1-2024': {
        sponsors: [
            {
                name: 'Mistral AI',
                logo: '/logos/mistral.svg',
                url: 'https://mistral.ai/',
            },
            {
                name: 'Hugging Face',
                logo: '/logos/hf.png',
                url: 'https://huggingface.co/',
            },
            {
                name: 'Algolia',
                logo: '/logos/algolia.png',
                url: 'https://algolia.com/',
            },
            {
                name: 'Replexica',
                logo: '/logos/replexica.png',
                url: 'https://replexica.com/',
            },
            {
                name: 'InnoIT',
                logo: '/logos/community/innoit_black.png',
                url: 'https://www.inno-it.es',
            },
            {
                name: 'Hookdeck',
                logo: '/logos/hookdeck.svg',
                url: 'https://hookdeck.com',
            },
            {
                name: 'eDreams',
                logo: '/logos/edreams.svg',
                url: 'https://www.edreamsodigeocareers.com',
            },
            {
                name: 'Resend',
                logo: '/logos/resend.png',
                url: 'https://www.resend.com',
            },
            {
                name: 'Le Wagon',
                logo: '/logos/lewagon.png',
                url: 'https://www.lewagon.com/barcelona',
            },
            {
                name: 'xarxardi-ia',
                logo: '/logos/logo_xRDI-IA.png',
                url: 'https://xarxardi-ia.cat/convocatories/ai-accelerator-24',
            },
            // ... other judges
        ]
    },
    'aisummit25': {
        sponsors: [
            {
                name: 'Glovo',
                logo: '/logos/glovo.svg',
                url: 'https://www.glovoapp.com/',
            },
            {
                name: 'Anthropic',
                logo: '/logos/anthropic.svg',
                url: 'https://www.anthropic.com/',
            },
            {
                name: 'n8n',
                logo: '/logos/n8n.svg',
                url: 'https://n8n.io/',
            },
            {
                name: 'ElevenLabs',
                logo: '/logos/elevenlabs.svg',
                url: 'https://elevenlabs.io/',
            },
            {
                name: 'OVH',
                logo: '/logos/ovh.svg',
                url: 'https://www.ovhcloud.com/',
            },
            {
                name: 'Norrsken',
                logo: '/logos/norrsken.svg', // Placeholder logo - replace with official Norrsken logo
                url: 'https://www.norrsken.org/',
            },
        ]
    }
}

// export const getAllEventSlugs = () => {
//     return Object.keys(eventJudges)
// }

export const getSponsorsByEvent = (eventSlug: string) => {
    return eventSponsors[eventSlug] || { sponsors: [] }
}
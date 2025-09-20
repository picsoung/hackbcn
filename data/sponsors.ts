export interface Sponsor {
  name: string
  logo: string
  url: string
  width?: number
  height?: number
  className?: string
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
    ],
  },
  aisummit25: {
    sponsors: [
      {
        name: 'Glovo',
        logo: '/logos/glovo.svg',
        url: 'https://www.glovoapp.com/',
        tier: 'gold',
      },
      {
        name: 'Acai',
        logo: '/logos/acai.png',
        url: 'https://acaitravel.com/',
        tier: 'gold',
      },
      {
        name: 'Linkup',
        logo: '/logos/linkup.svg',
        url: 'https://linkup.so/',
        tier: 'gold',
      },
      {
        name: 'Lingo.dev',
        logo: '/logos/lingodotdev.svg',
        url: 'http://lingo.dev/',
        tier: 'silver',
      },
      {
        name: 'Hookdeck',
        logo: '/logos/hookdeck.svg',
        url: 'https://hookdeck.com',
        tier: 'silver',
      },
      {
        name: 'n8n',
        logo: '/logos/n8n.svg',
        url: 'https://n8n.io/',
        tier: 'silver',
      },
      {
        name: 'slng',
        logo: '/logos/slng.jpg',
        url: 'https://slng.ai/',
        tier: 'silver',
      },
      {
        name: 'Anthropic',
        logo: '/logos/anthropic.svg',
        url: 'https://www.anthropic.com/',
      },
      {
        name: 'ElevenLabs',
        logo: '/logos/elevenlabs.svg',
        url: 'https://try.elevenlabs.io/e2lh0if9af8w',
      },
      {
        name: 'Hugging Face',
        logo: '/logos/hf.png',
        url: 'https://huggingface.co/',
      },
      {
        name: 'Lovable',
        logo: '/logos/lovable-dark.png',
        url: 'https://lovable.dev/?via=picsoung',
      },
      {
        name: 'Norrsken',
        logo: '/logos/norrsken.svg', // Placeholder logo - replace with official Norrsken logo
        url: 'https://www.norrsken.org/',
      },
    ],
  },
}

// export const getAllEventSlugs = () => {
//     return Object.keys(eventJudges)
// }

export const getSponsorsByEvent = (eventSlug: string) => {
  return eventSponsors[eventSlug] || { sponsors: [] }
}

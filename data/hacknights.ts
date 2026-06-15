import type { ScheduleItem, Partner } from '@/types/events'

export type HackNight = {
  id: string
  slug: string
  name: string
  date: string
  endDate: string
  location: string
  topic: string
  description: { [locale: string]: string }
  registrationUrl?: string
  imageUrl?: string
  gallery?: string[]
  projectLinks?: string[]
  sponsor?: string
  capacity?: number
  past: boolean
  recapVideoUrl?: string // long-form aftermovie (landscape)
  shorts?: string[] // vertical clips / YouTube Shorts
  schedule?: { [locale: string]: ScheduleItem[] }
  faq?: { [locale: string]: { q: string; a: string }[] }
  partners?: Partner[]
}

export const hackNights: HackNight[] = [
  {
    id: 'hn-2024-09',
    slug: 'hacknight-edreams-2024',
    name: 'Hack Night @ eDreams ODIGEO',
    date: '2024-09-26T18:00:00+02:00',
    endDate: '2024-09-26T22:00:00+02:00',
    location: 'eDreams ODIGEO, Barcelona',
    topic: 'Lightning Talks & Open Hacking',
    description: {
      en: 'An evening hackathon at eDreams ODIGEO where developers and makers collaborated on personal projects and startup ideas. Featured lightning talks, open networking, hacking sessions, and demos.',
      es: 'Un hackathon nocturno en eDreams ODIGEO donde desarrolladores y makers colaboraron en proyectos personales e ideas de startup. Con charlas relámpago, networking, sesiones de hacking y demos.',
    },
    registrationUrl: 'https://luma.com/6xew9jdf',
    imageUrl: 'https://images.lumacdn.com/event-covers/41/f4b95409-4ae0-4c6d-8cc8-7ca32c4368fc',
    sponsor: 'eDreams ODIGEO',
    capacity: 50,
    past: true,
  },
  {
    id: 'hn-2026-02',
    slug: 'vibecode-hacknight-2026',
    name: 'Vibecode Hack Night',
    date: '2026-02-11T18:00:00+01:00',
    endDate: '2026-02-11T22:00:00+01:00',
    location: 'Le Wagon, Barcelona',
    topic: 'Building with Brandfetch API & Lovable',
    description: {
      en: 'An evening of rapid prototyping with the Brandfetch API. ~40 builders came together to explore structured brand data, with a live intro from Brandfetch co-founder and free Lovable credits for all attendees.',
      es: 'Una noche de prototipado rápido con la API de Brandfetch. ~40 builders se reunieron para explorar datos de marca estructurados, con una intro en directo del cofundador de Brandfetch y créditos gratuitos de Lovable.',
    },
    registrationUrl: 'https://luma.com/z84bmxx9',
    imageUrl: 'https://images.lumacdn.com/event-covers/aq/bd85e9c5-339a-46ca-b4d3-59da49f643c6.png',
    sponsor: 'Brandfetch & Lovable',
    capacity: 72,
    past: true,
    shorts: ['https://www.youtube.com/shorts/oUSlr2JpvVU'],
  },
  {
    id: 'hn-2026-03',
    slug: 'skillathon-hacknight-2026',
    name: 'Skill-a-thon HackNight',
    date: '2026-03-19T17:00:00+01:00',
    endDate: '2026-03-19T20:45:00+01:00',
    location: 'Itnig, Barcelona',
    topic: 'Building AI Agent Skills',
    description: {
      en: 'Focused on building AI agent skills — reusable functions for platforms like Claude Code, Codex, and Cline. Attendees created skills, demoed their work, and prepared submissions for emerging skill marketplaces.',
      es: 'Enfocado en crear skills para agentes de IA — funciones reutilizables para plataformas como Claude Code, Codex y Cline. Los asistentes crearon skills, demostraron su trabajo y prepararon envíos para los marketplaces emergentes.',
    },
    registrationUrl: 'https://luma.com/0y5sebvx',
    imageUrl: 'https://images.lumacdn.com/event-covers/ro/c43bde0a-23b8-4231-a81b-5f66a3f5efaa.png',
    sponsor: 'Happy Operators',
    capacity: 124,
    past: true,
  },
  {
    id: 'hn-2026-04',
    slug: 'hacknight-3-linkup-2026',
    name: 'HackNight #3 — Powered by Linkup',
    date: '2026-04-29T17:30:00+02:00',
    endDate: '2026-04-29T21:30:00+02:00',
    location: 'Itnig, Barcelona',
    topic: 'Building with Real-time Data APIs',
    description: {
      en: 'Builders prototyped apps and agents using Linkup\'s real-time data API for live web data enrichment and structured information extraction — all in a single evening at Itnig.',
      es: 'Los builders prototiparon apps y agentes usando la API de datos en tiempo real de Linkup para enriquecimiento de datos web en vivo y extracción de información estructurada — todo en una sola noche en Itnig.',
    },
    registrationUrl: 'https://luma.com/mn8cdwcp',
    imageUrl: 'https://images.lumacdn.com/event-covers/2s/47338d9f-91de-417d-b96b-6c78be64dc73.png',
    sponsor: 'Linkup',
    capacity: 107,
    past: true,
    shorts: ['https://www.youtube.com/shorts/R_C-_ji9nS4'],
  },
  {
    id: 'hn-2026-06',
    slug: 'hacknight-june-2026',
    name: 'HackNight #4: Build with Netlify',
    date: '2026-06-30T17:00:00+02:00',
    endDate: '2026-06-30T21:15:00+02:00',
    location: 'Itnig, Barcelona',
    topic: 'Building & deploying full-stack apps with Netlify',
    description: {
      en: 'An evening of building and shipping full-stack apps with Netlify. A 90-minute workshop on Netlify’s AI agent and Claude Code — deploying with functions, environment variables, and databases — followed by 90 minutes of open hacking. Bring an idea and ship it live with the Barcelona community.',
      es: 'Una noche para construir y desplegar apps full-stack con Netlify. Un taller de 90 minutos sobre el agente de IA de Netlify y Claude Code — desplegando con funciones, variables de entorno y bases de datos — seguido de 90 minutos de hacking abierto. Trae una idea y publícala en vivo con la comunidad de Barcelona.',
    },
    registrationUrl: 'https://luma.com/37ddi2n0',
    imageUrl: '/netlify-hacknight.png',
    sponsor: 'Netlify',
    schedule: {
      en: [
        {
          title: 'June 30 · 17:00–21:15',
          sections: [
            {
              name: 'Agenda',
              items: [
                '17:00 — Doors open. Meet people, grab a drink',
                '17:30 — Intro: building & deploying with Netlify + live examples',
                '19:00 — Hack time',
                '20:30 — Demos',
                '21:15 — Wrap-up',
              ],
            },
          ],
        },
      ],
      es: [
        {
          title: '30 de junio · 17:00–21:15',
          sections: [
            {
              name: 'Agenda',
              items: [
                '17:00 — Apertura de puertas. Conoce gente, toma algo',
                '17:30 — Intro: construir y desplegar con Netlify + ejemplos en directo',
                '19:00 — Tiempo de hacking',
                '20:30 — Demos',
                '21:15 — Cierre',
              ],
            },
          ],
        },
      ],
    },
    faq: {
      en: [
        {
          q: 'Who should attend?',
          a: 'Product builders, bootstrappers, founders, vibe coders, hobbyists, and any developer who wants to build with AI. All experience levels are welcome.',
        },
        {
          q: 'What should I bring?',
          a: "Just a laptop and your ideas — we'll help with the rest.",
        },
        {
          q: 'Do I need to register?',
          a: 'Yes, an RSVP on Luma is required for entry.',
        },
        {
          q: 'What will I build?',
          a: "You'll go from prompt to deployed site using Netlify's AI agent and Claude Code — building beyond the frontend with functions, environment variables, and databases.",
        },
        {
          q: 'Are there prizes?',
          a: 'Drinks, snacks, and Netlify credits for everyone, plus 10,000 Netlify credits for the most-voted project.',
        },
      ],
      es: [
        {
          q: '¿Quién debería asistir?',
          a: 'Product builders, bootstrappers, founders, vibe coders, hobbyistas y cualquier developer que quiera construir con IA. Todos los niveles son bienvenidos.',
        },
        {
          q: '¿Qué debo traer?',
          a: 'Solo un portátil y tus ideas — del resto nos encargamos nosotros.',
        },
        {
          q: '¿Necesito registrarme?',
          a: 'Sí, es obligatorio reservar plaza en Luma para entrar.',
        },
        {
          q: '¿Qué voy a construir?',
          a: 'Irás del prompt a una web desplegada usando el agente de IA de Netlify y Claude Code — yendo más allá del frontend con funciones, variables de entorno y bases de datos.',
        },
        {
          q: '¿Hay premios?',
          a: 'Bebidas, snacks y créditos de Netlify para todos, además de 10.000 créditos de Netlify para el proyecto más votado.',
        },
      ],
    },
    partners: [
      { name: 'Netlify', role: 'Main sponsor', url: 'https://www.netlify.com/', logo: '/logos/netlify.svg' },
      { name: 'Itnig', role: 'Venue', url: 'https://itnig.net/', logo: '/logos/itnig.svg' },
      { name: 'Happy Operators', role: 'Co-organizer', logo: '/logos/happy-operators.png' },
    ],
    past: false,
  },
]

export const getUpcomingHackNights = () => {
  const now = new Date()
  return hackNights
    .filter(hn => new Date(hn.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export const getPastHackNights = () => {
  const now = new Date()
  return hackNights
    .filter(hn => new Date(hn.endDate) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export const getHackNightBySlug = (slug: string) => {
  return hackNights.find(hn => hn.slug === slug)
}

export const getAllHackNights = () => {
  return [...hackNights].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

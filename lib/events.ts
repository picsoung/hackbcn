import { Event } from "@/types/events"

export const events: Event[] = [
  {
    id: '1',
    slug: 'v1-2024',
    year: '2024',
    name: 'HackBarna v1',
    active: false,
    eventType: 'hackathon',
    startDate: '2024-06-29T09:00:00+02:00',
    endDate: '2024-06-30T09:00:00+02:00',
    location: 'Le Wagon, Barcelona',
    timeZone: 'Europe/Madrid',
    imageUrl: '/summerhack.png',
    description: {
      en: 'The inaugural HackBarna hackathon — 50+ hackers exploring GPT, Llama, and RAG in the heart of Barcelona.',
      es: 'El primer hackathon HackBarna — más de 50 hackers explorando GPT, Llama y RAG en el corazón de Barcelona.',
    },
    schedule: {
      en: [
        {
          title: "Saturday - June 29th",
          sections: [
            {
              name: "Morning",
              items: [
                "09:00 AM | Registration & Breakfast",
                "10:00 AM | Opening Speeches",
                "11:00 AM | Hacking starts & team formation"
              ]
            },
            {
              name: "Hack Time",
              items: [
                "01:00 PM | Lunch",
                "02:00 PM | Workshops",
                "10:00 PM | Prompt Battle Game 👾",
                "11:00 PM | Doors close"
              ]
            },
            {
              name: "Periodically",
              items: [
                "Guest lectures by mentors and sponsors",
                "Snacks and surprises"
              ]
            }
          ]
        },
        {
          title: "Sunday - June 30th",
          sections: [
            {
              name: "Morning",
              items: [
                "09:00 AM | Breakfast",
                "10:00 AM | Keep pushing"
              ]
            },
            {
              name: "Midday",
              items: [
                "01:00 PM | Lunch",
                "01:00 PM | Submit repos and prepare for final presentations"
              ]
            },
            {
              name: "Afternoon",
              items: [
                "04:00 PM | Final Demos"
              ]
            },
            {
              name: "Wrap-up",
              items: [
                "06:00 PM | Deliberation & Awards"
              ]
            }
          ]
        }
      ],
      es: [
        {
          title: "Sábado - 29 de Junio",
          sections: [
            {
              name: "Mañana",
              items: [
                "09:00 | Registro y Desayuno",
                "10:00 | Charlas de Apertura",
                "11:00 | Inicio del Hackathon y formación de equipos"
              ]
            },
            {
              name: "Tiempo de Hack",
              items: [
                "01:00 PM | Almuerzo",
                "02:00 PM | Talleres",
                "10:00 PM | Juego Prompt Battle 👾",
                "11:00 PM | Cierre de puertas"
              ]
            }
          ]
        },
        {
          title: "Domingo - 30 de Junio",
          sections: [
            {
              name: "Mañana",
              items: [
                "09:00 | Desayuno",
                "10:00 | Continuar desarrollando"
              ]
            },
            {
              name: "Tarde",
              items: [
                "04:00 PM | Demos Finales",
                "06:00 PM | Deliberación y Premios"
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: '2',
    slug: 'aisummit25',
    year: '2025',
    name: 'HackBarna v2 - AI Summit 25',
    active: false,
    eventType: 'hackathon',
    startDate: '2025-10-11T09:00:00+02:00',
    endDate: '2025-10-12T09:00:00+02:00',
    location: 'Glovo Yellow Park, Barcelona',
    timeZone: 'Europe/Madrid',
    imageUrl: '/beyond_prompting.png',
    description: {
      en: 'The most ambitious AI hackathon in Barcelona. Connect with leading AI researchers, engineers, and innovators at Glovo Yellow Park.',
      es: 'El hackathon de IA más ambicioso de Barcelona. Conecta con investigadores, ingenieros e innovadores de IA en Glovo Yellow Park.',
    },
    schedule: {
      en: [
        {
          title: "Saturday - October 11th",
          sections: [
            {
              name: "Morning",
              items: [
                "09:00 AM | Registration & Breakfast",
                "10:00 AM | AI Summit Opening Keynote",
                "11:00 AM | Hackathon Launch & Team Formation"
              ]
            },
            {
              name: "Afternoon",
              items: [
                "01:00 PM | Lunch & Networking",
                "02:00 PM | AI Workshops & Technical Sessions",
                "02:00 PM | AmazonDeveloper Workshop",
                "03:00 PM | Acai Workshop",
                "04:00 PM | Vonage Workshop",
                "05:00 PM | n8n Workshop",
              ]
            },
            {
              name: "Evening",
              items: [
                "08:00 PM | Dinner",
                "11:00 PM | Doors closing for the night"
              ]
            }
          ]
        },
        {
          title: "Sunday - October 12th",
          sections: [
            {
              name: "Morning",
              items: [
                "09:00 AM | Breakfast & Final Push",
                "11:00 AM | Code Submission Deadline"
              ]
            },
            {
              name: "Afternoon",
              items: [
                "01:00 PM | Lunch",
                "02:00 PM | Project Demos & Presentations",
                "04:00 PM | Top 10 Demoers announced"
              ]
            },
            {
              name: "Awards",
              items: [
                "04:00 PM | Top 10 demos Judging & Deliberation",
                "06:00 PM | Awards Ceremony & Closing"
              ]
            }
          ]
        }
      ],
      es: [
        {
          title: "Sábado - 11 de Octubre",
          sections: [
            {
              name: "Mañana",
              items: [
                "09:00 AM | Registro y Desayuno",
                "10:00 AM | Keynote de Apertura AI Summit",
                "11:00 AM | Lanzamiento del Hackathon y Formación de Equipos"
              ]
            },
            {
              name: "Tarde",
              items: [
                "01:00 PM | Almuerzo y Networking",
                "02:00 PM | Talleres de IA y Sesiones Técnicas",
                "02:00 PM | Taller AmazonDeveloper",
                "03:00 PM | Taller Acai",
                "04:00 PM | Taller Vonage",
                "05:00 PM | Taller n8n"
              ]
            },
            {
              name: "Noche",
              items: [
                "08:00 PM | Cena",
                "11:00 PM | Cierre de puertas por la noche"
              ]
            }
          ]
        },
        {
          title: "Domingo - 12 de Octubre",
          sections: [
            {
              name: "Mañana",
              items: [
                "09:00 AM | Desayuno y Sprint Final",
                "10:00 AM | Fecha límite de entrega del código"
              ]
            },
            {
              name: "Tarde",
              items: [
                "01:00 PM | Almuerzo",
                "02:00 PM | Demos de Proyectos y Presentaciones",
                "04:00 PM | Anuncio de los 10 mejores demos"
              ]
            },
            {
              name: "Premios",
              items: [
                "05:30 PM | Top 10 proyectos demos",
                "06:00 PM | Ceremonia de Premios y Clausura"
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: '3',
    slug: 'aisummit26',
    year: '2026',
    name: 'HackBarna AI Summit 26',
    active: true,
    eventType: 'hackathon',
    registrationUrl: 'https://lu.ma/hackbarna',
    startDate: '2026-09-19T09:00:00+02:00',
    endDate: '2026-09-20T18:00:00+02:00',
    location: 'Barcelona',
    timeZone: 'Europe/Madrid',
    description: {
      en: 'The third edition of HackBarna is coming! Join 100+ builders for a weekend of hacking, workshops, and demos. Location and sponsors to be announced soon.',
      es: 'La tercera edición de HackBarna llega pronto. Únete a más de 100 builders para un fin de semana de hacking, talleres y demos. Ubicación y patrocinadores por confirmar.',
    },
    schedule: {
      en: [
        {
          title: "Saturday - September 19th",
          sections: [
            {
              name: "Morning",
              items: [
                "09:00 AM | Registration & Breakfast",
                "10:00 AM | Opening Keynote",
                "11:00 AM | Hackathon Launch & Team Formation"
              ]
            },
            {
              name: "Afternoon",
              items: [
                "01:00 PM | Lunch & Networking",
                "02:00 PM | Workshops & Technical Sessions",
                "06:00 PM | Dinner"
              ]
            },
            {
              name: "Evening",
              items: [
                "08:00 PM | Hacking continues",
                "11:00 PM | Doors close for the night"
              ]
            }
          ]
        },
        {
          title: "Sunday - September 20th",
          sections: [
            {
              name: "Morning",
              items: [
                "09:00 AM | Breakfast & Final Push",
                "11:00 AM | Code Submission Deadline"
              ]
            },
            {
              name: "Afternoon",
              items: [
                "01:00 PM | Lunch",
                "02:00 PM | Project Demos & Presentations",
                "04:00 PM | Judging & Deliberation"
              ]
            },
            {
              name: "Awards",
              items: [
                "05:30 PM | Awards Ceremony",
                "06:00 PM | Closing & Networking"
              ]
            }
          ]
        }
      ],
    }
  },
]

export const getAllEventSlugs = () => {
  return events.map(event => event.slug)
}

export const getEventBySlug = (slug: string) => {
  return events.find(event => event.slug === slug)
}

export const getCurrentEvent = () => {
  return events.find(event => event.active)
}

export const getUpcomingEvents = () => {
  const now = new Date()
  return events
    .filter(event => new Date(event.startDate) > now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
}

export const getPastEvents = () => {
  const now = new Date()
  return events
    .filter(event => new Date(event.endDate) < now)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
}

export const getEventsByType = (type: Event['eventType']) => {
  return events.filter(event => event.eventType === type)
}

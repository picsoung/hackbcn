import { Event } from "@/types/events"

export const events: Event[] = [
  {
    id: '1',
    slug: 'v1-2024',
    year: '2024',
    name: 'HackBarna',
    active: false,
    startDate: '2024-06-29',
    endDate: '2024-06-30',
    location: 'Le Wagon Barcelona',
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
    name: 'HackBarna AI Summit 25',
    active: true,
    startDate: '2025-10-11',
    endDate: '2025-10-12',
    location: 'Glovo HQ, Barcelona',
    schedule: {
      en: [
        {
          title: "Friday - October 11th",
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
                "04:00 PM | Mentor Speed Dating",
                "06:00 PM | AI Panel Discussion"
              ]
            },
            {
              name: "Evening",
              items: [
                "08:00 PM | Welcome Reception",
                "10:00 PM | Late Night Hacking"
              ]
            }
          ]
        },
        {
          title: "Saturday - October 12th",
          sections: [
            {
              name: "Morning",
              items: [
                "09:00 AM | Breakfast & Final Push",
                "10:00 AM | Code Submission Deadline"
              ]
            },
            {
              name: "Afternoon",
              items: [
                "01:00 PM | Lunch",
                "02:00 PM | Project Demos & Presentations",
                "04:00 PM | AI Industry Leaders Panel"
              ]
            },
            {
              name: "Awards",
              items: [
                "05:30 PM | Judging & Deliberation",
                "06:30 PM | Awards Ceremony & Closing"
              ]
            }
          ]
        }
      ],
      es: [
        {
          title: "Viernes - 11 de Octubre",
          sections: [
            {
              name: "Mañana",
              items: [
                "09:00 | Registro y Desayuno",
                "10:00 | Keynote de Apertura AI Summit",
                "11:00 | Lanzamiento del Hackathon"
              ]
            },
            {
              name: "Tarde",
              items: [
                "01:00 PM | Almuerzo y Networking",
                "02:00 PM | Talleres de IA",
                "06:00 PM | Panel de Discusión sobre IA"
              ]
            }
          ]
        },
        {
          title: "Sábado - 12 de Octubre",
          sections: [
            {
              name: "Mañana",
              items: [
                "09:00 | Desayuno y Sprint Final",
                "10:00 | Fecha límite de entrega"
              ]
            },
            {
              name: "Tarde",
              items: [
                "02:00 PM | Demos de Proyectos",
                "06:30 PM | Ceremonia de Premios"
              ]
            }
          ]
        }
      ]
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

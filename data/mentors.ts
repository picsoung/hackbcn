import { Person } from '@/app/helpers/projects'

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
    ],
  },
  aisummit25: {
    mentors: [
      {
        name: 'Guillermo Blasco',
        description: 'CEO @ Mankind Technology',
        image: {
          src: `/mentors/guillermo_mankind.jpeg`,
        },
        links: {
          linkedin: 'https://www.linkedin.com/in/guillermoblascojimenez/',
        },
      },
      {
        name: 'Antonio Hernandez',
        description: 'Tech Advisor @ Mankind Technology',
        image: {
          src: `/mentors/antonio_mankind.jpeg`,
        },
        links: {
          // linkedin: 'https://www.linkedin.com/in/mariagarcia/',
        },
      },
      {
        name: 'Pavel Pratyush',
        description: 'Co-founder & CTO @ Acai Travel',
        image: {
          src: `/judges/pavel.png`,
        },
        links: {
          linkedin: 'https://www.linkedin.com/in/pppb/',
        },
      },
      {
        name: 'Enric Reverter López',
        description: 'Senior Machine Learning Engineer @ Acai Travel',
        image: {
          src: `/hackers/enric_reverter.jpeg`,
        },
        links: {
          linkedin: 'hhttps://www.linkedin.com/in/ereverterlopez/',
        },
      },
      {
        name: 'Nicolás Pascual',
        description: 'Senior Software Engineer @ Travelperk',
        image: {
          src: `https://media.licdn.com/dms/image/v2/C4E03AQEUFaB1X0wyiA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1517433229134?e=1762387200&v=beta&t=i0C3gW3tBd-CqhFfIVJ2szQTRPq7tOs-Ye_8cY_8SvE`,
        },
        links: {
          linkedin:
            'http://www.linkedin.com/in/nicol%C3%A1s-pascual-gonz%C3%A1lez-875496a6/',
          website: 'http://nicolas-pascual.com/',
        },
      },
      {
        name: 'Alejandro Cabello Jiménez',
        description: 'Staff Software Engineer @ Travelperk',
        image: {
          src: `https://media.licdn.com/dms/image/v2/C4E03AQEUFaB1X0wyiA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1517433229134?e=1762387200&v=beta&t=i0C3gW3tBd-CqhFfIVJ2szQTRPq7tOs-Ye_8cY_8SvE`,
        },
        links: {
          linkedin: 'https://www.linkedin.com/in/alejandrocabello/',
          website: 'http://nicolas-pascual.com/',
        },
      },
      {
        name: 'Irina Ichim',
        description: 'Full Stack Developer',
        image: {
          src: `https://media.licdn.com/dms/image/v2/D4E03AQEEH_dBfFZMiA/profile-displayphoto-crop_800_800/B4EZnC02kiIQAI-/0/1759910259585?e=1762992000&v=beta&t=6gd3aRNgzGuslw6lBwiD4igQGwQ2w3bJfjO-SR8yY2w`,
        },
        links: {
          linkedin: 'https://www.linkedin.com/in/irina-ichim-desarrolladora/',
        },
      },
      {
        name: 'Kristian Gosvig',
        description: 'Founding Engineer @ Misogi Labs',
        image: {
          src: `https://media.licdn.com/dms/image/v2/D5603AQE7DC2TXnMyUg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1674509918791?e=1762992000&v=beta&t=MoMgLp_gJCw04jZaaL4SRWLErjL9ARoZ0thzJhNuu18`,
        },
        links: {
          linkedin: 'https://www.linkedin.com/in/kristian-gosvig/',
        },
      },
      {
        name: 'Moses Roth',
        description: 'Developer Evangelist @ Amazon',
        image: {
          src: `https://media.licdn.com/dms/image/v2/D5603AQEld_jviQZGTA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1703614859769?e=1762992000&v=beta&t=AhNrRG4s7xCdWxz0FS7DURC81C8ylkSQkA8yjfmTfvo`,
        },
        links: {
          linkedin: 'https://www.linkedin.com/in/mosesroth/',
        },
      },
      {
        name: 'Nashaat Soliman',
        description: 'Product Manager @ Amazon',
        image: {
          src: `https://media.licdn.com/dms/image/v2/C4E03AQGge3HTHlsALA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1573620001886?e=1762992000&v=beta&t=MOzvKeYtxXLFCFx0RIdJaej8hsAkh2OatkwUZCBo8U4`,
        },
        links: {
          linkedin: 'https://www.linkedin.com/in/nashaatsoliman/',
        },
      },
      {
        name: 'Boris Toledano',
        description: 'COO @ Linkup',
        image: {
          src: `https://media.licdn.com/dms/image/v2/D5603AQHGJRkEALfjzw/profile-displayphoto-shrink_800_800/B56ZO6rzHyG4Ac-/0/1734003864556?e=1762992000&v=beta&t=54-W-5ELiIGKNJPeOxzDqa_yjBT2ZdCF3UbEnG0RaJs`,
        },
        links: {
          linkedin: 'https://www.linkedin.com/in/boris-toledano-7b53a496/',
        },
      },
      {
        name: 'Dwane Hemmings',
        description: 'Developer Advocate @ Vonage',
        image: {
          src: `https://media.licdn.com/dms/image/v2/C5603AQEjjoKJQ1MGVg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1517731760954?e=1762992000&v=beta&t=q3bq1yp9HdQT5txdXnPxymsLG8glRGi45zUYynYbGos`,
        },
        links: {
          linkedin: 'https://www.linkedin.com/in/dwane-hemmings/',
        },
      },

      // {
      //     name: 'David Chen',
      //     description: 'Founder @ AI Startups Inc',
      //     image: {
      //         src: `https://avatar.iran.liara.run/public`,
      //     },
      //     links: {
      //         linkedin: 'https://www.linkedin.com/in/davidchen/',
      //         website: 'https://example.com',
      //     },
      // }
    ],
  },
}

// export const getAllEventSlugs = () => {
//     return Object.keys(eventJudges)
// }

export const getMentorsByEvent = (eventSlug: string) => {
  return eventMentors[eventSlug] || { mentors: [] }
}

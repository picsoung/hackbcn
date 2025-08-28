'use client'

import HideEmail from './HideEmail'
import { useIntl } from './Intl'
import { useTheme } from '@/app/contexts/ThemeContext'

export default function Team() {
  const intl = useIntl()
  const { theme } = useTheme()

  return (
    <div id="about" className="bg-white py-10 sm:py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2
            className={`mt-1 text-3xl sm:text-5xl font-cal font-semibold ${theme.colors.accentOnWhite}`}
          >
            {intl.t('team.title')}
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row mt-6 text-gray-800 text-lg">
          <div className="w-full sm:w-1/2 mr-8">
            <div>{intl.t('team.intro')}</div>
            <br />
            <div>
              <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                {[
                  {
                    firstName: 'Nicolas',
                    lastName: 'Grenié',
                    link: 'https://www.linkedin.com/in/nicolasgrenie/',
                    image: '/mentors/nico.jpeg',
                  },
                  {
                    firstName: 'The',
                    lastName: 'Technation',
                    link: 'https://www.linkedin.com/company/the-technation',
                    image: '/mentors/thetechnation.jpeg',
                  },
                ].map((member, index) => (
                  <li
                    key={index}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '60px 1fr',
                      alignItems: 'center',
                      gap: '1rem',
                      marginBottom: '1rem',
                      marginLeft: '5rem',
                    }}
                  >
                    <img
                      src={member.image}
                      alt={`${member.firstName} ${member.lastName}`}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />
                    <a href={member.link}>
                      {member.firstName} {member.lastName}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <br />
            {intl.t('team.thanks')}
          </div>
          <div className="w-full sm:w-1/2 mt-6 sm:mt-0">
            {intl.t('team.contact')}
            <br />
            <HideEmail emailAddr="team@hackbarna.com" />
          </div>
        </div>
      </div>
    </div>
  )
}

export type Theme = {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    navbar: string
    text: string
    textSecondary: string
    button: string
    buttonHover: string
    badge: string
    badgeText: string
    hero: string
    gradient: string
  }
  gradients: {
    primary: string
    secondary: string
    hero: string
  }
}

export const themes: Record<string, Theme> = {
  'aisummit25': {
    id: 'aisummit25',
    name: 'AI Summit',
    colors: {
      primary: 'rgb(0, 0, 0)', // Pure black
      secondary: 'rgb(31, 31, 31)', // Dark gray
      accent: 'text-white', // Pure white for text accents
      background: 'from-black via-gray-900 to-black',
      navbar: 'bg-black',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      button: 'bg-white text-black hover:bg-gray-200',
      buttonHover: 'hover:bg-white hover:bg-opacity-10',
      badge: 'bg-white',
      badgeText: 'text-black',
      hero: 'bg-black',
      gradient: 'bg-gradient-to-tr from-gray-600 to-gray-400'
    },
    gradients: {
      primary: 'bg-gradient-to-r from-black to-gray-900',
      secondary: 'bg-gradient-to-r from-gray-900 to-black',
      hero: 'bg-black'
    }
  },
  'v1-2024': {
    id: 'v1-2024',
    name: 'HackBarna Classic',
    colors: {
      primary: 'rgb(99, 102, 241)', // indigo-500
      secondary: 'rgb(147, 51, 234)', // purple-500
      accent: 'text-amber-600', // amber accent for classic theme
      background: 'from-purple-900 via-indigo-900 to-blue-900',
      navbar: 'bg-gradient-to-r from-purple-800 to-indigo-900',
      text: 'text-purple-50',
      textSecondary: 'text-purple-200',
      button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      buttonHover: 'hover:bg-purple-50 hover:bg-opacity-10',
      badge: 'bg-purple-500',
      badgeText: 'text-white',
      hero: 'bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900',
      gradient: 'bg-gradient-to-tr from-[#ffb580] to-[#fcb589]'
    },
    gradients: {
      primary: 'bg-gradient-to-r from-purple-500 to-indigo-600',
      secondary: 'bg-gradient-to-r from-indigo-500 to-purple-600',
      hero: 'bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900'
    }
  }
}

export const getThemeByEventSlug = (eventSlug: string | null): Theme => {
  if (!eventSlug || !themes[eventSlug]) {
    // Default to latest event theme (aisummit25)
    return themes['aisummit25']
  }
  return themes[eventSlug]
}
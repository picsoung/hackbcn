export type Theme = {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    accentOnWhite: string // For sections with white backgrounds
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
  aisummit25: {
    id: 'aisummit25',
    name: 'AI Summit',
    colors: {
      primary: 'oklch(.21 .006 285.885)',
      secondary: 'ai-red', 
      accent: 'text-white', // White accent text on dark backgrounds
      accentOnWhite: 'text-ai-orange', // Orange accent text on white backgrounds
      background: 'bg-white',
      navbar: 'bg-gray-900', // Darker navbar for better contrast
      text: 'text-white', // White text on orange background
      textSecondary: 'text-gray-100', // Light gray text
      button: 'bg-white text-ai-orange hover:bg-gray-100 border border-white',
      buttonHover: 'hover:bg-gray-100',
      badge: 'bg-white',
      badgeText: 'text-ai-orange',
      hero: 'bg-gradient-to-br from-ai-orange to-ai-red',
      gradient: 'bg-gradient-to-br from-ai-orange via-ai-red to-ai-burgundy'
    },
    gradients: {
      primary: 'bg-gradient-to-r from-ai-orange to-ai-red',
      secondary: 'bg-gradient-to-r from-ai-red to-ai-burgundy',
      hero: 'bg-gradient-to-br from-ai-orange via-ai-red to-ai-burgundy'
    }
  },
  'v1-2024': {
    id: 'v1-2024',
    name: 'HackBarna Classic',
    colors: {
      primary: 'rgb(99, 102, 241)', // indigo-500
      secondary: 'rgb(147, 51, 234)', // purple-500
      accent: 'text-amber-600', // amber accent for classic theme
      accentOnWhite: 'text-indigo-600', // indigo accent on white backgrounds
      background: 'from-purple-900 via-indigo-900 to-blue-900',
      navbar: 'bg-gradient-to-r from-purple-800 to-indigo-900',
      text: 'text-purple-50',
      textSecondary: 'text-purple-200',
      button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      buttonHover: 'hover:bg-purple-50 hover:bg-opacity-10',
      badge: 'bg-purple-500',
      badgeText: 'text-white',
      hero: 'bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900',
      gradient: 'bg-gradient-to-tr from-[#ffb580] to-[#fcb589]',
    },
    gradients: {
      primary: 'bg-gradient-to-r from-purple-500 to-indigo-600',
      secondary: 'bg-gradient-to-r from-indigo-500 to-purple-600',
      hero: 'bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900',
    },
  },
}

export const getThemeByEventSlug = (eventSlug: string | null): Theme => {
  if (!eventSlug || !themes[eventSlug]) {
    // Default to latest event theme (aisummit25)
    return themes['aisummit25']
  }
  return themes[eventSlug]
}

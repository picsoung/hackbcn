const copy = {
  en: {
    title: 'Your HackBarna account',
    description: 'Your account is temporarily unavailable. Please try again.',
    retry: 'Try again',
  },
  es: {
    title: 'Tu cuenta de HackBarna',
    description:
      'Tu cuenta no está disponible temporalmente. Inténtalo de nuevo.',
    retry: 'Reintentar',
  },
  ca: {
    title: 'El teu compte de HackBarna',
    description:
      'El teu compte no està disponible temporalment. Torna-ho a provar.',
    retry: 'Torna-ho a provar',
  },
  fr: {
    title: 'Votre compte HackBarna',
    description: 'Votre compte est temporairement indisponible. Réessayez.',
    retry: 'Réessayer',
  },
}
export function accountUnavailableCopy(locale: string) {
  return copy[locale as keyof typeof copy] ?? copy.en
}

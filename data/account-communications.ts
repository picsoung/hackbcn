const copy = {
  en: {
    title: 'Communication language',
    help: 'Choose a language for HackBarna profile and project emails. Until you choose, these messages include English, Castellano and Catalan. Your Digest newsletter preference is separate.',
    all: 'Not selected · all three languages',
    save: 'Save email language',
    saving: 'Saving…',
    saved: 'Email language saved.',
    pending: 'Saved. We’re updating your email preferences.',
    disabled:
      'Saved. Contact synchronisation will start when the integration is enabled.',
    error: 'Could not save your email language. Try again.',
    conflict: 'This setting changed elsewhere. Refresh the page before saving.',
  },
  es: {
    title: 'Idioma de comunicación',
    help: 'Elige un idioma para los correos sobre tu perfil y proyectos de HackBarna. Hasta que elijas, incluiremos inglés, castellano y catalán. El idioma de la newsletter del Digest se gestiona aparte.',
    all: 'Sin elegir · los tres idiomas',
    save: 'Guardar idioma',
    saving: 'Guardando…',
    saved: 'Idioma guardado.',
    pending: 'Guardado. Estamos actualizando tus preferencias de correo.',
    disabled:
      'Guardado. Sincronizaremos el contacto cuando se active la integración.',
    error: 'No se ha podido guardar el idioma. Inténtalo de nuevo.',
    conflict:
      'Este ajuste ha cambiado en otra sesión. Actualiza la página antes de guardar.',
  },
  ca: {
    title: 'Idioma de comunicació',
    help: "Tria un idioma per als correus sobre el teu perfil i projectes de HackBarna. Fins que triïs, hi inclourem anglès, castellà i català. L'idioma del butlletí del Digest es gestiona a part.",
    all: 'Sense triar · els tres idiomes',
    save: 'Desa l’idioma',
    saving: 'Desant…',
    saved: 'Idioma desat.',
    pending: 'Desat. Estem actualitzant les teves preferències de correu.',
    disabled: "Desat. Sincronitzarem el contacte quan s'activi la integració.",
    error: "No s'ha pogut desar l'idioma. Torna-ho a provar.",
    conflict:
      'Aquest ajust ha canviat en una altra sessió. Actualitza la pàgina abans de desar.',
  },
  fr: {
    title: 'Langue de communication',
    help: 'Choisissez une langue pour les e-mails concernant votre profil et vos projets HackBarna. Sans préférence, ils incluent anglais, castillan et catalan. La langue de la newsletter Digest reste séparée.',
    all: 'Non choisie · les trois langues',
    save: 'Enregistrer la langue',
    saving: 'Enregistrement…',
    saved: 'Langue enregistrée.',
    pending:
      'Enregistré. La mise à jour de vos préférences e-mail est en cours.',
    disabled:
      'Enregistré. Le contact sera synchronisé lorsque l’intégration sera activée.',
    error: 'Impossible d’enregistrer la langue. Réessayez.',
    conflict:
      'Ce réglage a changé ailleurs. Actualisez la page avant d’enregistrer.',
  },
}
export function accountCommunicationCopy(locale: string) {
  return copy[locale as keyof typeof copy] ?? copy.en
}

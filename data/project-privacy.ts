const notices: Record<string, string> = {
  en: 'Some projects are kept private at their builders’ request. They still count towards the projects built at this event.',
  es: 'Algunos proyectos son privados a petición de sus creadores. Siguen contando entre los proyectos creados en este evento.',
  ca: 'Alguns projectes són privats a petició dels seus creadors. Continuen comptant entre els projectes creats en aquest esdeveniment.',
  fr: 'Certains projets restent privés à la demande de leurs créateurs. Ils comptent toujours parmi les projets réalisés lors de cet événement.',
}

export function projectPrivacyNotice(locale: string) {
  return notices[locale] ?? notices.en
}

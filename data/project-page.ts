const en = {
  allProjects: 'All projects',
  breadcrumb: 'Breadcrumb',
  about: 'About the project',
  builders: 'Built by',
  stack: 'Built with',
  openProject: 'Open project',
  watchDemo: 'Watch demo',
  slides: 'Slides',
}

type ProjectPageCopy = { [K in keyof typeof en]: string }

const translations: Record<string, ProjectPageCopy> = {
  en,
  es: {
    allProjects: 'Todos los proyectos',
    breadcrumb: 'Ruta de navegación',
    about: 'Sobre el proyecto',
    builders: 'Creado por',
    stack: 'Tecnologías',
    openProject: 'Abrir proyecto',
    watchDemo: 'Ver demo',
    slides: 'Presentación',
  },
  ca: {
    allProjects: 'Tots els projectes',
    breadcrumb: 'Ruta de navegació',
    about: 'Sobre el projecte',
    builders: 'Creat per',
    stack: 'Tecnologies',
    openProject: 'Obre el projecte',
    watchDemo: 'Mira la demo',
    slides: 'Presentació',
  },
  fr: {
    allProjects: 'Tous les projets',
    breadcrumb: 'Fil d’Ariane',
    about: 'À propos du projet',
    builders: 'Créé par',
    stack: 'Technologies',
    openProject: 'Ouvrir le projet',
    watchDemo: 'Voir la démo',
    slides: 'Présentation',
  },
}

export function projectPageCopy(locale: string): ProjectPageCopy {
  return translations[locale] ?? en
}

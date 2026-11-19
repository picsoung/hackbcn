const en = {
  heading: 'Projects',
  project: 'project',
  projects: 'projects',
  event: 'event',
  events: 'events',
  summary: '{projects} across {events}',
  description:
    'Explore projects built by {name} at HackBarna hack nights and hackathons in Barcelona.',
}
type BuilderPageCopy = { [K in keyof typeof en]: string }
const translations: Record<string, BuilderPageCopy> = {
  en,
  es: {
    heading: 'Proyectos',
    project: 'proyecto',
    projects: 'proyectos',
    event: 'evento',
    events: 'eventos',
    summary: '{projects} en {events}',
    description:
      'Descubre los proyectos de {name} en los hack nights y hackathones de HackBarna en Barcelona.',
  },
  ca: {
    heading: 'Projectes',
    project: 'projecte',
    projects: 'projectes',
    event: 'esdeveniment',
    events: 'esdeveniments',
    summary: '{projects} en {events}',
    description:
      'Descobreix els projectes de {name} als hack nights i hackatons de HackBarna a Barcelona.',
  },
  fr: {
    heading: 'Projets',
    project: 'projet',
    projects: 'projets',
    event: 'événement',
    events: 'événements',
    summary: '{projects} sur {events}',
    description:
      'Découvrez les projets de {name} lors des hack nights et hackathons HackBarna à Barcelone.',
  },
}
export function builderPageCopy(locale: string): BuilderPageCopy {
  return translations[locale] ?? en
}

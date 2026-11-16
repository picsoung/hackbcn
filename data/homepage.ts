const en = {
  explore: 'Explore past events',
  nextUp: 'Next up',
  photosBy: 'Photos by',
  watchFilm: 'Watch the aftermovie',
  filmDuration: '1 min 29 sec',
  watchYoutube: 'Watch on YouTube',
  allEvents: 'All past events',
  joinTitle: 'First hackathon? You’re in good company.',
  joinDescription:
    'Get an invitation when we announce our next event in Barcelona.',
  signupTitle: 'Come build with us.',
  emailLabel: 'Your email address',
  allPosts: 'More from the community',
  readPost: 'Read Lilibeth’s story',
  projects: 'Projects',
  projectSingular: 'Project',
  photos: 'Photos',
  video: 'Video',
  title: 'Barcelona',
  titleAccent: 'builds together.',
  intro:
    'Meet people, try new AI tools, and demo what you make at our hack nights and weekend hackathons.',
  invitation: 'Get invited',
  wallIntro:
    'Explore the evenings, weekends, projects and people that make this community.',
  latestNight: 'Latest hack night',
  weekend: 'Weekend hackathon',
  exploreEvent: 'Explore event',
  communityLabel: 'Our community',
  communityPhotoAlt:
    'Two builders sharing ideas over their laptops at AI Summit 2026.',
  eventPhoto: 'Event photos',
}

type HomeCopy = { [K in keyof typeof en]: string }

const translations: Record<string, HomeCopy> = {
  en,
  es: {
    explore: 'Explora eventos anteriores',
    nextUp: 'Próximo evento',
    photosBy: 'Fotos de',
    watchFilm: 'Ver el vídeo resumen',
    filmDuration: '1 min 29 s',
    watchYoutube: 'Ver en YouTube',
    allEvents: 'Todos los eventos anteriores',
    joinTitle: '¿Tu primer hackathon? Estás en buena compañía.',
    joinDescription:
      'Recibe una invitación cuando anunciemos nuestro próximo evento en Barcelona.',
    signupTitle: 'Ven a crear con nosotros.',
    emailLabel: 'Tu correo electrónico',
    allPosts: 'Más de la comunidad',
    readPost: 'Lee la historia de Lilibeth',
    projects: 'Proyectos',
    projectSingular: 'Proyecto',
    photos: 'Fotos',
    video: 'Vídeo',
    title: 'Barcelona',
    titleAccent: 'crea en comunidad.',
    intro:
      'Conoce gente, prueba nuevas herramientas de IA y presenta lo que creas en nuestras hack nights y hackathons de fin de semana.',
    invitation: 'Recibe invitaciones',
    wallIntro:
      'Descubre las tardes, los fines de semana, los proyectos y las personas de esta comunidad.',
    latestNight: 'Última hack night',
    weekend: 'Hackathon de fin de semana',
    exploreEvent: 'Explorar el evento',
    communityLabel: 'Nuestra comunidad',
    communityPhotoAlt:
      'Dos builders compartiendo ideas con sus portátiles en AI Summit 2026.',
    eventPhoto: 'Fotos del evento',
  },
  ca: {
    explore: 'Explora esdeveniments anteriors',
    nextUp: 'Proper esdeveniment',
    photosBy: 'Fotos de',
    watchFilm: 'Mira el vídeo resum',
    filmDuration: '1 min 29 s',
    watchYoutube: 'Mira’l a YouTube',
    allEvents: 'Tots els esdeveniments anteriors',
    joinTitle: 'El teu primer hackathon? Estàs en bona companyia.',
    joinDescription:
      'Rep una invitació quan anunciem el proper esdeveniment a Barcelona.',
    signupTitle: 'Vine a crear amb nosaltres.',
    emailLabel: 'El teu correu electrònic',
    allPosts: 'Més de la comunitat',
    readPost: 'Llegeix la història de la Lilibeth',
    projects: 'Projectes',
    projectSingular: 'Projecte',
    photos: 'Fotos',
    video: 'Vídeo',
    title: 'Barcelona',
    titleAccent: 'crea en comunitat.',
    intro:
      'Coneix gent, prova eines noves d’IA i presenta el que crees a les nostres hack nights i hackathons de cap de setmana.',
    invitation: 'Rep invitacions',
    wallIntro:
      'Descobreix les tardes, els caps de setmana, els projectes i les persones d’aquesta comunitat.',
    latestNight: 'Última hack night',
    weekend: 'Hackathon de cap de setmana',
    exploreEvent: 'Explora l’esdeveniment',
    communityLabel: 'La nostra comunitat',
    communityPhotoAlt:
      'Dues builders compartint idees amb els seus portàtils a AI Summit 2026.',
    eventPhoto: 'Fotos de l’esdeveniment',
  },
  fr: {
    explore: 'Découvrir les événements passés',
    nextUp: 'Prochain événement',
    photosBy: 'Photos de',
    watchFilm: 'Voir le film de l’événement',
    filmDuration: '1 min 29 s',
    watchYoutube: 'Voir sur YouTube',
    allEvents: 'Tous les événements passés',
    joinTitle: 'Votre premier hackathon ? Vous êtes en bonne compagnie.',
    joinDescription:
      'Recevez une invitation à l’annonce de notre prochain événement à Barcelone.',
    signupTitle: 'Venez créer avec nous.',
    emailLabel: 'Votre adresse e-mail',
    allPosts: 'Les récits de la communauté',
    readPost: 'Lire le récit de Lilibeth',
    projects: 'Projets',
    projectSingular: 'Projet',
    photos: 'Photos',
    video: 'Vidéo',
    title: 'Barcelone',
    titleAccent: 'crée ensemble.',
    intro:
      'Rencontrez des gens, testez de nouveaux outils d’IA et présentez vos créations lors de nos hack nights et hackathons de week-end.',
    invitation: 'Recevoir les invitations',
    wallIntro:
      'Découvrez les soirées, les week-ends, les projets et les personnes de cette communauté.',
    latestNight: 'Dernière hack night',
    weekend: 'Hackathon de week-end',
    exploreEvent: 'Explorer l’événement',
    communityLabel: 'Notre communauté',
    communityPhotoAlt:
      'Deux builders échangent des idées sur leurs ordinateurs à AI Summit 2026.',
    eventPhoto: 'Photos de l’événement',
  },
}

export function homeCopy(locale: string): HomeCopy {
  return translations[locale] ?? en
}

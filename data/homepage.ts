const en = {
  intro:
    'Meet other builders, experiment with new tools, and demo what you make. An evening hack night or a weekend hackathon, right here in Barcelona.',
  explore: 'Explore past events',
  invitation: 'Get the next invitation',
  nextUp: 'Next up',
  heroCaption: 'Ideas become projects. Strangers become teammates.',
  heroAlt:
    'Builders discussing their project around a table of laptops at Jev-a-thon in Barcelona.',
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
  pastTitle: 'Past events',
  pastIntro:
    'Explore our hackathons and hack nights, and what came out of each one.',
  projects: 'Projects',
  posts: 'Community posts',
  photos: 'Photos',
  video: 'Video',
  movieTitle: 'A HackBarna weekend in 90 seconds.',
  movieIntro:
    'Take a look inside AI Summit 2026: the teams, the demos, and the moments in between.',
  projectSingular: 'Project',
  postSingular: 'Community post',
}

type HomeCopy = { [K in keyof typeof en]: string }

const translations: Record<string, HomeCopy> = {
  en,
  es: {
    intro:
      'Conoce a otros builders, experimenta con nuevas herramientas y presenta lo que creas. Una tarde de hack night o un fin de semana de hackathon, aquí en Barcelona.',
    explore: 'Explora eventos anteriores',
    invitation: 'Recibe la próxima invitación',
    nextUp: 'Próximo evento',
    heroCaption:
      'Las ideas se hacen proyectos. Los desconocidos, compañeros de equipo.',
    heroAlt:
      'Builders hablando sobre su proyecto alrededor de una mesa con portátiles en el Jev-a-thon de Barcelona.',
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
    pastTitle: 'Eventos anteriores',
    pastIntro:
      'Explora nuestros hackathons y hack nights, y lo que se creó en cada uno.',
    projects: 'Proyectos',
    posts: 'Publicaciones',
    photos: 'Fotos',
    video: 'Vídeo',
    movieTitle: 'Un fin de semana HackBarna en 90 segundos.',
    movieIntro:
      'Descubre AI Summit 2026 desde dentro: los equipos, las demos y los momentos entre medias.',
    projectSingular: 'Proyecto',
    postSingular: 'Publicación',
  },
  ca: {
    intro:
      'Coneix altres builders, experimenta amb eines noves i presenta el que crees. Una tarda de hack night o un cap de setmana de hackathon, aquí a Barcelona.',
    explore: 'Explora esdeveniments anteriors',
    invitation: 'Rep la propera invitació',
    nextUp: 'Proper esdeveniment',
    heroCaption:
      'Les idees es fan projectes. Els desconeguts, companys d’equip.',
    heroAlt:
      'Builders parlant del seu projecte al voltant d’una taula amb portàtils al Jev-a-thon de Barcelona.',
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
    pastTitle: 'Esdeveniments anteriors',
    pastIntro:
      'Explora els nostres hackathons i hack nights, i el que es va crear en cadascun.',
    projects: 'Projectes',
    posts: 'Publicacions',
    photos: 'Fotos',
    video: 'Vídeo',
    movieTitle: 'Un cap de setmana HackBarna en 90 segons.',
    movieIntro:
      'Descobreix AI Summit 2026 des de dins: els equips, les demos i els moments entremig.',
    projectSingular: 'Projecte',
    postSingular: 'Publicació',
  },
  fr: {
    intro:
      'Rencontrez d’autres builders, testez de nouveaux outils et présentez vos créations. Une soirée hack night ou un week-end de hackathon, ici à Barcelone.',
    explore: 'Découvrir les événements passés',
    invitation: 'Recevoir la prochaine invitation',
    nextUp: 'Prochain événement',
    heroCaption:
      'Les idées deviennent des projets. Les inconnus, des coéquipiers.',
    heroAlt:
      'Des builders discutent de leur projet autour d’une table d’ordinateurs au Jev-a-thon de Barcelone.',
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
    pastTitle: 'Événements passés',
    pastIntro:
      'Explorez nos hackathons et hack nights, et les projets nés de chaque édition.',
    projects: 'Projets',
    posts: 'Publications',
    photos: 'Photos',
    video: 'Vidéo',
    movieTitle: 'Un week-end HackBarna en 90 secondes.',
    movieIntro:
      'Découvrez AI Summit 2026 de l’intérieur : les équipes, les démos et les moments entre deux.',
    projectSingular: 'Projet',
    postSingular: 'Publication',
  },
}

export function homeCopy(locale: string): HomeCopy {
  return translations[locale] ?? en
}

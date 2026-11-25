// Keep the organiser's chosen Catalan sign-off in every language.
export const emailSignOff = 'Fem communitat, hackejem'

export const emailLocales = ['en', 'es', 'ca']

const copy = {
  en: {
    from: 'Nico at HackBarna',
    subject: 'Your projects are on HackBarna',
    previewText:
      'Your projects from past events, and a profile you can make your own.',
    greeting: (name) => `Hi ${name || 'there'},`,
    introduction:
      "Thanks for coming to HackBarna! We've updated the website with projects from past events so people can see what Barcelona's builders are making.",
    listedOne: "We've added your project:",
    listedMany: "We've added your projects:",
    invitation:
      "You can now claim your profile, add your photo and links, and update your projects. If you'd rather keep a project private, you can hide it too.",
    action: 'Claim my profile',
    accountHelp:
      "Your HackBarna Digest account works here too. Use the email that received this message. If you already use another email or something is missing, just reply and I'll help.",
    review:
      'Project edits need review before they appear on the site. Hiding takes effect immediately.',
    footer:
      "You're receiving this because you're credited on a HackBarna project. Claiming your profile doesn't subscribe you to the newsletter.",
    optOut: 'Stop profile invitations',
    previewLabel: 'Test preview',
    previewPrefix: '[TEST]',
    previewNote:
      'For review only. The button opens your local preview; profile claims are not live on the public site yet.',
    previewFooter:
      'This is a preview for the organiser. The participant campaign is still a draft.',
    reply: 'You can reply to me at',
  },
  es: {
    from: 'Nico de HackBarna',
    subject: 'Tus proyectos ya están en HackBarna',
    previewText:
      'Tus proyectos de eventos anteriores y un perfil que puedes hacer tuyo.',
    greeting: (name) => (name ? `Hola ${name},` : 'Hola,'),
    introduction:
      '¡Gracias por venir a HackBarna! Hemos renovado la web y añadido los proyectos de eventos anteriores para que se vea lo que está creando la gente de Barcelona.',
    listedOne: 'Ya hemos añadido tu proyecto:',
    listedMany: 'Ya hemos añadido tus proyectos:',
    invitation:
      'Ahora puedes reclamar tu perfil, añadir tu foto y enlaces, y actualizar tus proyectos. Si prefieres que un proyecto sea privado, también puedes ocultarlo.',
    action: 'Reclamar mi perfil',
    accountHelp:
      'Tu cuenta de HackBarna Digest también sirve aquí. Entra con el correo en el que has recibido este mensaje. Si ya usas otro correo o falta algún proyecto, responde y te echo una mano.',
    review:
      'Revisamos los cambios de los proyectos antes de publicarlos. Si ocultas un proyecto, deja de mostrarse al momento.',
    footer:
      'Recibes este mensaje porque figuras en un proyecto de HackBarna. Reclamar tu perfil no te suscribe a la newsletter.',
    optOut: 'Dejar de recibir invitaciones de perfil',
    previewLabel: 'Vista previa de prueba',
    previewPrefix: '[PRUEBA]',
    previewNote:
      'Solo para revisar. El botón abre la vista previa local; todavía no se pueden reclamar perfiles en la web pública.',
    previewFooter:
      'Esta es una vista previa para el organizador. El envío a participantes sigue siendo un borrador.',
    reply: 'Puedes responderme a',
  },
  ca: {
    from: 'Nico de HackBarna',
    subject: 'Els teus projectes ja són a HackBarna',
    previewText:
      'Els projectes dels esdeveniments anteriors i un perfil que pots fer teu.',
    greeting: (name) => (name ? `Hola ${name},` : 'Hola,'),
    introduction:
      'Gràcies per venir a HackBarna! Hem renovat el web i hi hem afegit els projectes dels esdeveniments anteriors per donar a conèixer el que es crea a Barcelona.',
    listedOne: 'Ja hi hem afegit el teu projecte:',
    listedMany: 'Ja hi hem afegit els teus projectes:',
    invitation:
      'Ara pots reclamar el teu perfil, afegir-hi la foto i els enllaços, i actualitzar els teus projectes. Si prefereixes que un projecte sigui privat, també el pots amagar.',
    action: 'Reclamar el meu perfil',
    accountHelp:
      "El teu compte de HackBarna Digest també serveix aquí. Entra amb el correu on has rebut aquest missatge. Si ja fas servir un altre correu o hi falta algun projecte, respon-me i t'ajudo.",
    review:
      'Revisem els canvis dels projectes abans de publicar-los. Si amagues un projecte, deixa de mostrar-se de seguida.',
    footer:
      'Reps aquest missatge perquè hi ha un projecte de HackBarna al teu nom. Reclamar el perfil no et subscriu al butlletí.',
    optOut: 'Deixar de rebre invitacions per al perfil',
    previewLabel: 'Vista prèvia de prova',
    previewPrefix: '[PROVA]',
    previewNote:
      'Només per revisar. El botó obre la vista prèvia local; encara no es poden reclamar perfils al web públic.',
    previewFooter:
      "Aquesta és una vista prèvia per a l'organitzador. L'enviament als participants encara és un esborrany.",
    reply: 'Em pots respondre a',
  },
}

export function getEmailCopy(locale = 'en') {
  if (!emailLocales.includes(locale))
    throw new Error('Unsupported email locale')
  return copy[locale]
}

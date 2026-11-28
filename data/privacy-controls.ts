const en = {
  accountEmpty:
    'Claim a project with your event email to connect your builder profile. An organiser can help verify an individual credit when needed.',
  project: 'Project privacy',
  builder: 'Profile privacy',
  credit: 'Creator privacy',
  hideProjectCreators: 'Hide all creator credits on this project',
  hideBuilder: 'Hide this public profile and its credits across projects',
  hideCredit: 'Hide this creator on this project',
  projectHelp:
    'Keep the project public while choosing which creator details and project links appear.',
  builderHelp:
    'Choose which details appear on the public builder profile and its project credits. Saved information and team access are retained.',
  creditHelp:
    'These choices apply to this person’s credit on this project. They do not change their other projects or account.',
  fields: 'Hide specific details',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  otherLinks: 'Other external links',
  photo: 'Creator photo',
  bio: 'Creator bio and role',
  precedence:
    'Hiding at any scope takes precedence. Project settings cannot reveal details hidden on a builder’s profile.',
  individual: 'Individual creators',
  individualHelp:
    'Change visibility or links for one teammate without hiding everyone.',
  account: 'Privacy across your projects',
  accountHelp:
    'These profiles are linked to your account through verified individual event credits.',
  saved: 'Privacy updated.',
  save: 'Save privacy settings',
}
const copy: Record<string, typeof en> = {
  en,
  es: {
    accountEmpty:
      'Reclama un proyecto con el correo del evento para vincular tu perfil. La organización puede ayudarte a verificar tu crédito individual.',
    project: 'Privacidad del proyecto',
    builder: 'Privacidad del perfil',
    credit: 'Privacidad del creador',
    hideProjectCreators:
      'Ocultar todos los créditos de autoría de este proyecto',
    hideBuilder: 'Ocultar este perfil público y sus créditos en los proyectos',
    hideCredit: 'Ocultar este creador en este proyecto',
    projectHelp:
      'Mantén el proyecto público y elige qué datos de sus creadores y enlaces aparecen.',
    builderHelp:
      'Elige qué datos aparecen en este perfil público y sus proyectos. La información guardada y el acceso al equipo se conservan.',
    creditHelp:
      'Estas opciones afectan a esta persona en este proyecto. No cambian sus otros proyectos ni su cuenta.',
    fields: 'Ocultar datos concretos',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    otherLinks: 'Otros enlaces externos',
    photo: 'Foto del creador',
    bio: 'Biografía y función del creador',
    precedence:
      'Ocultar tiene prioridad en cualquier ámbito. Un proyecto no puede mostrar datos ocultos en el perfil del creador.',
    individual: 'Creadores individuales',
    individualHelp:
      'Cambia la visibilidad o los enlaces de una persona sin ocultar al resto del equipo.',
    account: 'Privacidad en tus proyectos',
    accountHelp:
      'Estos perfiles están vinculados a tu cuenta mediante créditos individuales verificados de eventos.',
    saved: 'Privacidad actualizada.',
    save: 'Guardar privacidad',
  },
  ca: {
    accountEmpty:
      'Reclama un projecte amb el correu de l’esdeveniment per vincular el perfil. L’organització et pot ajudar a verificar el crèdit individual.',
    project: 'Privacitat del projecte',
    builder: 'Privacitat del perfil',
    credit: 'Privacitat del creador',
    hideProjectCreators: 'Amagar tots els crèdits d’autoria d’aquest projecte',
    hideBuilder: 'Amagar aquest perfil públic i els seus crèdits als projectes',
    hideCredit: 'Amagar aquest creador en aquest projecte',
    projectHelp:
      'Mantén el projecte públic i tria quines dades dels creadors i quins enllaços apareixen.',
    builderHelp:
      'Tria quines dades apareixen en aquest perfil públic i als seus projectes. La informació desada i l’accés a l’equip es conserven.',
    creditHelp:
      'Aquestes opcions afecten aquesta persona en aquest projecte. No canvien els altres projectes ni el seu compte.',
    fields: 'Amagar dades concretes',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    otherLinks: 'Altres enllaços externs',
    photo: 'Foto del creador',
    bio: 'Biografia i funció del creador',
    precedence:
      'Amagar té prioritat en qualsevol àmbit. Un projecte no pot mostrar dades amagades al perfil del creador.',
    individual: 'Creadors individuals',
    individualHelp:
      'Canvia la visibilitat o els enllaços d’una persona sense amagar la resta de l’equip.',
    account: 'Privacitat als teus projectes',
    accountHelp:
      'Aquests perfils estan vinculats al teu compte mitjançant crèdits individuals verificats d’esdeveniments.',
    saved: 'Privacitat actualitzada.',
    save: 'Desar privacitat',
  },
  fr: {
    accountEmpty:
      'Revendiquez un projet avec votre adresse utilisée pour l’événement afin de lier votre profil. L’organisation peut vous aider à vérifier votre crédit individuel.',
    project: 'Confidentialité du projet',
    builder: 'Confidentialité du profil',
    credit: 'Confidentialité du créateur',
    hideProjectCreators: 'Masquer tous les créateurs de ce projet',
    hideBuilder: 'Masquer ce profil public et ses crédits sur les projets',
    hideCredit: 'Masquer ce créateur sur ce projet',
    projectHelp:
      'Gardez le projet public et choisissez les informations des créateurs et les liens affichés.',
    builderHelp:
      'Choisissez les informations affichées sur ce profil public et ses projets. Les données enregistrées et les droits d’équipe sont conservés.',
    creditHelp:
      'Ces choix concernent cette personne sur ce projet. Ils ne modifient pas ses autres projets ni son compte.',
    fields: 'Masquer certaines informations',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    otherLinks: 'Autres liens externes',
    photo: 'Photo du créateur',
    bio: 'Biographie et rôle du créateur',
    precedence:
      'Un masquage est toujours prioritaire. Un projet ne peut pas révéler les informations masquées sur le profil du créateur.',
    individual: 'Créateurs individuels',
    individualHelp:
      'Modifiez la visibilité ou les liens d’une personne sans masquer ses coéquipiers.',
    account: 'Confidentialité sur vos projets',
    accountHelp:
      'Ces profils sont liés à votre compte par des crédits individuels vérifiés lors des événements.',
    saved: 'Confidentialité mise à jour.',
    save: 'Enregistrer la confidentialité',
  },
}
export function privacyCopy(locale: string) {
  return copy[locale] ?? en
}

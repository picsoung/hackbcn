const copy = {
  en: {
    title: 'Profile invitations',
    heading: 'Stop profile invitations?',
    help: 'This stops emails inviting you to claim your HackBarna profile and projects. Your Digest subscription and projects stay as they are.',
    action: 'Stop profile invitations',
    done: 'Profile invitations stopped',
    confirmation:
      'You won’t receive more profile invitations at this address. Your Digest subscription and projects have not changed.',
    invalid:
      'This link is incomplete. Open the link in your invitation email, or reply to Nico for help.',
    error:
      'We couldn’t save your choice. Please try again, or reply to your invitation email.',
    back: 'Back to HackBarna',
  },
  es: {
    title: 'Invitaciones al perfil',
    heading: '¿Dejar de recibir invitaciones?',
    help: 'Dejarás de recibir correos para reclamar tu perfil y tus proyectos en HackBarna. Tu suscripción a Digest y tus proyectos seguirán igual.',
    action: 'Dejar de recibir invitaciones',
    done: 'Has dejado de recibir invitaciones',
    confirmation:
      'No recibirás más invitaciones para reclamar tu perfil en esta dirección. Tu suscripción a Digest y tus proyectos no han cambiado.',
    invalid:
      'Este enlace está incompleto. Abre el enlace del correo de invitación o responde a Nico para pedir ayuda.',
    error:
      'No hemos podido guardar tu elección. Inténtalo de nuevo o responde al correo de invitación.',
    back: 'Volver a HackBarna',
  },
  ca: {
    title: 'Invitacions al perfil',
    heading: 'Vols deixar de rebre invitacions?',
    help: 'Deixaràs de rebre correus per reclamar el teu perfil i els teus projectes a HackBarna. La subscripció a Digest i els projectes continuaran igual.',
    action: 'Deixar de rebre invitacions',
    done: 'Ja no rebràs invitacions',
    confirmation:
      'No rebràs més invitacions per reclamar el perfil en aquesta adreça. La subscripció a Digest i els projectes no han canviat.',
    invalid:
      'Aquest enllaç és incomplet. Obre l’enllaç del correu d’invitació o respon a en Nico per demanar ajuda.',
    error:
      'No hem pogut desar la teva elecció. Torna-ho a provar o respon al correu d’invitació.',
    back: 'Tornar a HackBarna',
  },
  fr: {
    title: 'Invitations au profil',
    heading: 'Arrêter les invitations ?',
    help: 'Vous ne recevrez plus d’e-mails vous invitant à revendiquer votre profil et vos projets HackBarna. Votre abonnement Digest et vos projets resteront inchangés.',
    action: 'Arrêter les invitations',
    done: 'Invitations arrêtées',
    confirmation:
      'Vous ne recevrez plus d’invitations à cette adresse. Votre abonnement Digest et vos projets n’ont pas changé.',
    invalid:
      'Ce lien est incomplet. Ouvrez le lien dans votre invitation ou répondez à Nico pour obtenir de l’aide.',
    error:
      'Impossible d’enregistrer votre choix. Réessayez ou répondez à votre invitation.',
    back: 'Retour à HackBarna',
  },
}
export function invitationOptOutCopy(locale: string) {
  return copy[locale as keyof typeof copy] ?? copy.en
}

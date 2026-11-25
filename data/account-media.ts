const en = {
  upload: 'Upload picture',
  replace: 'Replace picture',
  remove: 'Remove picture',
  uploading: 'Uploading…',
  help: 'JPG, PNG or WebP, up to 4 MB. Uploads are stored by HackBarna.',
  ready: 'Picture ready. Save your changes to use it.',
  projectReady: 'Picture ready. Send your changes for review to use it.',
  error: 'We couldn’t upload this picture. Try again.',
  invalid: 'Choose a valid JPG, PNG or WebP image.',
  tooLarge: 'Choose a picture smaller than 4 MB.',
  limit: 'You’ve reached the upload limit. Try again in an hour.',
  projectPicture: 'Project picture',
  noPicture: 'No picture selected',
  useUrl: 'Use an image URL instead',
  reviewTitle: 'What happens after I save?',
  reviewDetails:
    'HackBarna organisers review your project details, links and picture before publishing your changes. The last approved version stays in place while the new version is reviewed. If changes are needed, feedback appears here. Reviews are currently manual.',
  visibilityDetails:
    'Review never changes visibility. To hide a project, use Hide project in My projects. Its details disappear from public pages immediately, and it still counts towards the event total. You can make it public again at any time.',
  feedback: 'Feedback from organisers',
  reviewNote: 'Review note',
  reviewNoteHelp:
    'When requesting changes, explain what the team should update (at least 10 characters). Approval notes are optional and stay private to organisers.',
  reviewFeedbackError:
    'Explain what the team should change in at least 10 characters.',
  pendingHelp:
    'Organisers are reviewing your changes. Your previously approved details and visibility stay unchanged.',
}
const localized: Record<string, typeof en> = {
  en,
  es: {
    upload: 'Subir imagen',
    replace: 'Cambiar imagen',
    remove: 'Quitar imagen',
    uploading: 'Subiendo…',
    help: 'JPG, PNG o WebP, hasta 4 MB. HackBarna almacena las imágenes que subes.',
    ready: 'Imagen lista. Guarda los cambios para usarla.',
    projectReady: 'Imagen lista. Envía los cambios a revisión para usarla.',
    error: 'No hemos podido subir la imagen. Inténtalo de nuevo.',
    invalid: 'Elige una imagen JPG, PNG o WebP válida.',
    tooLarge: 'Elige una imagen de menos de 4 MB.',
    limit: 'Has alcanzado el límite de subidas. Inténtalo en una hora.',
    projectPicture: 'Imagen del proyecto',
    noPicture: 'No hay imagen seleccionada',
    useUrl: 'Usar la URL de una imagen',
    reviewTitle: '¿Qué ocurre después de guardar?',
    reviewDetails:
      'Los organizadores de HackBarna revisan los detalles, enlaces e imagen antes de publicar los cambios. La última versión aprobada se mantiene durante la revisión. Si hacen falta cambios, verás los comentarios aquí. Las revisiones son manuales por ahora.',
    visibilityDetails:
      'La revisión nunca cambia la visibilidad. Para ocultar un proyecto, usa Ocultar proyecto en Mis proyectos. Los detalles desaparecen de las páginas públicas de inmediato y el proyecto sigue contando en el total del evento. Puedes hacerlo público de nuevo en cualquier momento.',
    feedback: 'Comentarios de los organizadores',
    reviewNote: 'Nota de revisión',
    reviewNoteHelp:
      'Si solicitas cambios, explica qué debe actualizar el equipo (al menos 10 caracteres). Las notas de aprobación son opcionales y privadas para los organizadores.',
    reviewFeedbackError:
      'Explica qué debe cambiar el equipo en al menos 10 caracteres.',
    pendingHelp:
      'Los organizadores están revisando tus cambios. Los detalles aprobados y la visibilidad se mantienen.',
  },
  ca: {
    upload: 'Pujar imatge',
    replace: 'Canviar imatge',
    remove: 'Treure imatge',
    uploading: 'Pujant…',
    help: 'JPG, PNG o WebP, fins a 4 MB. HackBarna emmagatzema les imatges que puges.',
    ready: 'Imatge preparada. Desa els canvis per fer-la servir.',
    projectReady:
      'Imatge preparada. Envia els canvis a revisió per fer-la servir.',
    error: 'No hem pogut pujar la imatge. Torna-ho a provar.',
    invalid: 'Tria una imatge JPG, PNG o WebP vàlida.',
    tooLarge: 'Tria una imatge de menys de 4 MB.',
    limit:
      'Has arribat al límit de pujades. Torna-ho a provar d’aquí a una hora.',
    projectPicture: 'Imatge del projecte',
    noPicture: 'No hi ha cap imatge seleccionada',
    useUrl: 'Fer servir l’URL d’una imatge',
    reviewTitle: 'Què passa després de desar?',
    reviewDetails:
      'Els organitzadors de HackBarna revisen els detalls, els enllaços i la imatge abans de publicar els canvis. L’última versió aprovada es manté durant la revisió. Si calen canvis, veuràs els comentaris aquí. Les revisions són manuals per ara.',
    visibilityDetails:
      'La revisió no canvia mai la visibilitat. Per amagar un projecte, fes servir Amagar projecte a Els meus projectes. Els detalls desapareixen de les pàgines públiques immediatament i el projecte continua comptant al total. El pots tornar a fer públic en qualsevol moment.',
    feedback: 'Comentaris dels organitzadors',
    reviewNote: 'Nota de revisió',
    reviewNoteHelp:
      'Si demanes canvis, explica què ha d’actualitzar l’equip (com a mínim 10 caràcters). Les notes d’aprovació són opcionals i privades per als organitzadors.',
    reviewFeedbackError:
      'Explica què ha de canviar l’equip en almenys 10 caràcters.',
    pendingHelp:
      'Els organitzadors estan revisant els teus canvis. Els detalls aprovats i la visibilitat es mantenen.',
  },
  fr: {
    upload: 'Importer une image',
    replace: 'Remplacer l’image',
    remove: 'Retirer l’image',
    uploading: 'Importation…',
    help: 'JPG, PNG ou WebP, jusqu’à 4 Mo. HackBarna conserve les images importées.',
    ready: 'Image prête. Enregistrez vos modifications pour l’utiliser.',
    projectReady:
      'Image prête. Envoyez vos modifications pour validation afin de l’utiliser.',
    error: 'Impossible d’importer cette image. Réessayez.',
    invalid: 'Choisissez une image JPG, PNG ou WebP valide.',
    tooLarge: 'Choisissez une image de moins de 4 Mo.',
    limit:
      'Vous avez atteint la limite d’importations. Réessayez dans une heure.',
    projectPicture: 'Image du projet',
    noPicture: 'Aucune image sélectionnée',
    useUrl: 'Utiliser l’URL d’une image',
    reviewTitle: 'Que se passe-t-il après l’enregistrement ?',
    reviewDetails:
      'Les organisateurs de HackBarna vérifient les détails, liens et image avant de publier vos modifications. La dernière version approuvée est conservée pendant la validation. Si des changements sont nécessaires, les commentaires apparaissent ici. La validation est actuellement manuelle.',
    visibilityDetails:
      'La validation ne modifie jamais la visibilité. Pour masquer un projet, utilisez Masquer le projet dans Mes projets. Ses détails disparaissent immédiatement des pages publiques, et il reste inclus dans le total de l’événement. Vous pouvez le rendre public à nouveau à tout moment.',
    feedback: 'Commentaires des organisateurs',
    reviewNote: 'Note de validation',
    reviewNoteHelp:
      'Si vous demandez des modifications, expliquez ce que l’équipe doit changer (au moins 10 caractères). Les notes d’approbation sont facultatives et privées pour les organisateurs.',
    reviewFeedbackError:
      'Expliquez les changements attendus en au moins 10 caractères.',
    pendingHelp:
      'Les organisateurs vérifient vos modifications. Les détails approuvés et la visibilité sont conservés.',
  },
}
export function accountMediaCopy(locale: string) {
  return localized[locale] ?? en
}

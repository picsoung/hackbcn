# Profile and project claim invitation — draft

Status: individual participant messages are prepared privately for the organiser's requested **26 November 2026 at 09:02 Europe/Madrid** slot. No participant messages are queued or sent. See [campaign readiness](profile-claim-campaign.md) for the audience, remaining release requirements and opt-out flow. One organiser-only test was requested on November 25, 2026, and Resend confirmed delivery; delivery details remain outside the repository.

For this draft, the organiser has instructed us to assume that people with projects agreed to be contacted. This is a campaign planning assumption, not a recorded consent event. It must not create newsletter subscriptions or change existing opt-outs.

## Audience

Send one personalised email per person credited on a real HackBarna project, grouping their projects across events. Registration alone does not put someone in this campaign. Exclude test submissions, already completed claims, suppressed addresses and people who opted out of these invitations. Include owners of hidden projects without restoring or publishing their projects.

Match an individual original submission email to a consistent registration and reviewed project credit. Deduplicate by the exact trimmed, case-insensitive email; do not rewrite aliases or merge people solely by name. Conflicting identities, shared team emails and credits without an individual address remain in the organiser's review list. A submitter's email does not identify every teammate. An email invitation never grants edit rights by itself.

The default invitation includes **English, Castellano and Catalan together in one email**. No language preference is assumed from registration, name or website locale. An explicit saved communication preference (`en`, `es` or `ca`) selects one language for later messages; a null preference keeps all three. The organiser's sign-off, **Fem communitat, hackejem**, appears once after the language sections, followed by **Nico**.

## Email copy

From: **Nico at HackBarna** `<digest@hackbarna.com>`

Reply-to: `nico@hackbarna.com` (the organiser confirmed that this receives replies)

Subject: **Your projects are on HackBarna**

Preview text: Your projects from past events, and a profile you can make your own.

### Draft rewrite

Hi {{first_name}},

Thanks for joining our past HackBarna events. We've updated our website to show the projects people built and the talent in Barcelona. We've listed your projects below, and you can now claim your profile to update your information, edit your projects or hide them.

### What makes the draft sound AI generated?

- It compresses the whole message into one evenly paced paragraph.
- "Update your information" is vague. "The talent in Barcelona" sounds more like promotion than a note from Nico.

### Final rewrite

---

Hi {{first_name}},

Thanks for coming to HackBarna! We've updated the website with projects from past events so people can see what Barcelona's builders are making.

We've added your projects:

{{project_list_grouped_by_event}}

You can now claim your profile, add your photo and links, and update your projects. If you'd rather keep a project private, you can hide it too.

**[Claim my profile]({{claim_url}})**

Your [HackBarna Digest](https://digest.hackbarna.com/) account works here too. Use the email that received this message. If you already use another email or something is missing, just reply and I'll help.

Project edits need review before they appear on the site. Hiding takes effect immediately.

Fem communitat, hackejem

Nico

You're receiving this because you're credited on a HackBarna project. Claiming your profile doesn't subscribe you to the newsletter.

[Stop profile invitations]({{invitation_opt_out_url}})

{{organiser_postal_address}}

---

If there is no trustworthy first name, use “Hi there”. Project names and event names must be escaped when rendering HTML. Private projects may be named only in the verified recipient's private invitation; never attach a public project URL for a hidden project.

### Castellano

Subject: **Tus proyectos ya están en HackBarna**

Hola {{first_name}},

¡Gracias por venir a HackBarna! Hemos renovado la web y añadido los proyectos de eventos anteriores para que se vea lo que está creando la gente de Barcelona.

Ya hemos añadido tus proyectos:

{{project_list_grouped_by_event}}

Ahora puedes reclamar tu perfil, añadir tu foto y enlaces, y actualizar tus proyectos. Si prefieres que un proyecto sea privado, también puedes ocultarlo.

**[Reclamar mi perfil]({{claim_url}})**

Tu cuenta de [HackBarna Digest](https://digest.hackbarna.com/es) también sirve aquí. Entra con el correo en el que has recibido este mensaje. Si ya usas otro correo o falta algún proyecto, responde y te echo una mano.

Revisamos los cambios de los proyectos antes de publicarlos. Si ocultas un proyecto, deja de mostrarse al momento.

Fem communitat, hackejem

Nico

### Català

Subject: **Els teus projectes ja són a HackBarna**

Hola {{first_name}},

Gràcies per venir a HackBarna! Hem renovat el web i hi hem afegit els projectes dels esdeveniments anteriors per donar a conèixer el que es crea a Barcelona.

Ja hi hem afegit els teus projectes:

{{project_list_grouped_by_event}}

Ara pots reclamar el teu perfil, afegir-hi la foto i els enllaços, i actualitzar els teus projectes. Si prefereixes que un projecte sigui privat, també el pots amagar.

**[Reclamar el meu perfil]({{claim_url}})**

El teu compte de [HackBarna Digest](https://digest.hackbarna.com/ca) també serveix aquí. Entra amb el correu on has rebut aquest missatge. Si ja fas servir un altre correu o hi falta algun projecte, respon-me i t'ajudo.

Revisem els canvis dels projectes abans de publicar-los. Si amagues un projecte, deixa de mostrar-se de seguida.

Fem communitat, hackejem

Nico

## Reusable template

`lib/email/brand-template.mjs` holds the shared email layout, exact DESIGN.md colours, pixel-wordmark header, stepped CTA, personal signature and cyan reply footer. It uses inline email-compatible sRGB values and font fallbacks rather than browser-only colour functions or external font loading. `public/email/hackbarna-wordmark.png` is a raster export of the existing SVG mark, suitable for email clients.

`lib/email/copy.mjs` holds the three language versions and the shared sign-off. `lib/email/profile-claim-invitation.mjs` renders HTML and plain text. Omit `locale`, or pass `null` or `all`, to produce the combined invitation. Pass an explicit saved `en`, `es` or `ca` choice for a single-language message. Other inputs are `firstName`, `projects` (`event` and `name`), and the signed-in `manageUrl`. Each language section includes its own project list and CTA; its account/Digest links use that language while preserving project selection. The signature and reply footer appear once. Imported names and titles are escaped, and project URLs stay out of the message body. Preview mode allows the local account route. A participant version requires an opt-out link and an organiser postal address.

```sh
# Rebuild the local preview using the public Nicolas / Royal Crown Lingo example.
node scripts/render-profile-claim-email.mjs

# Rebuild the combined invitation plus EN, ES and CA reference previews.
node scripts/render-profile-claim-email.mjs --all
node scripts/render-profile-claim-email.mjs --locale ca

# Render another reviewed input. Neither command sends an email.
node scripts/render-profile-claim-email.mjs \
  --input /private/invitation.json --out /private/invitation.html
```

The renderer keeps `Nico at HackBarna <digest@hackbarna.com>` as the already-tested sender and uses the organiser-confirmed `nico@hackbarna.com` for Reply-To. The organiser chose `HackBarna · Barcelona, Spain` for the footer. No extra test email has been sent as part of the copy/brand revision.

Previews: [All three in one email](email-previews/profile-claim-test.html), [English reference](email-previews/profile-claim-test.en.html), [Castellano reference](email-previews/profile-claim-test.es.html), [Català reference](email-previews/profile-claim-test.ca.html). Each has a matching `.txt` version. Without a first name, ES and CA use “Hola,” rather than an English fallback. The friendly sender label becomes `Nico de HackBarna` in individual ES and CA messages; the actual sender and reply addresses stay the same. The private account setting and Resend contact-property sync are documented in [Communication preferences](communication-preferences.md).

## Profile enrichment

- Offer name, LinkedIn and GitHub from a consistent registration as suggestions on first claim. Show their source and ask the builder to confirm or change them before applying newly imported public fields.
- Fill missing fields only. Never overwrite user edits, merge conflicting profiles or infer a bio/job title from application answers.
- These three attendee CSVs do not include portrait fields. Offer an existing verified project-credit portrait, the GitHub photo option, or an upload.
- Keep contact emails, phone numbers, application answers, attendance evidence and registration identifiers private. Keep only the public profile fields the person confirms.
- Bind the shared account profile to verified builder credits, preserving existing builder URLs. Public builder/project pages must use this verified mapping, not editable social URLs as proof of identity. Digest and the main website continue to use the same shared profile.

## Claim link and delivery

Use the existing signed-in project-management route (`https://www.hackbarna.com/en/account/projects`) for the first version. Its verified-email matches require an explicit claim confirmation. An invitation should not silently claim or change visibility when opened; email scanners must have no effect. Different-email ownership requests use organiser review until additional-email verification is implemented.

A later personalised invitation route may remember the intended builder and projects using an opaque, expiring token stored hashed. It must still require authentication, verified ownership and a confirmation POST. Never include an email address or raw registration identifier in the URL.

Reuse Resend, already used by Digest, for eligible personalised sends. Keep this campaign separate from Digest's newsletter audiences and subscription defaults. Maintain a private durable send ledger so repeat imports and retries do not resend an invitation. Honour invitation opt-outs and provider suppressions; the opt-out action must be implemented before this draft is sent.

Before sending, release and verify the shared profile/claim/edit/hide flows and import the production ownership evidence. Verify that confirmed profile changes appear on the public builder and project pages. Then prepare a recipient-count report, a list of uncertain matches and rendered sample emails. Test with the organiser first, then a small selected pilot. Sending the campaign requires a separate instruction; this draft does not authorise it. Do not schedule reminders by default.

## Delivery timing and organiser test

The organiser selected **Thursday 26 November 2026 at 09:02 Europe/Madrid** (`2026-11-26T09:02:00+01:00`), after the launch requirements above are met. This replaces the earlier suggested 10:00 slot. It is an explicit delivery choice, not a measured optimum. Recheck eligibility and completed claims before queueing. If the time has passed or release requirements remain unmet, leave the messages unscheduled and ask for a new time; never fall back to sending immediately.

The organiser requested one immediate test to their own supplied address on November 25, 2026. The [HTML test preview](email-previews/profile-claim-test.html) links “HackBarna Digest” to the live Digest site. It is labelled as a test, uses Nicolas’s public Royal Crown Lingo credit and links its primary action to the local preview. The production project-management URL returned 404 during preparation, so it must not be used in a participant send yet. No participant campaign is scheduled by this test.

# Attendee email matching audit

Reviewed 19 November 2026 using the saved original submissions and 18 local guest-list exports. The exports cover AI Summit 2026, Skill-a-thon, the June Netlify HackNight and Vibecode, plus a separate HackBarna guest export. Repeated exports are corroborating snapshots, not additional people. Only public findings are recorded here; emails, registration IDs and other private fields remain outside Git and the app.

## Method and coverage

- Compare trimmed, case-insensitive email values exactly. Do not remove dots, rewrite aliases or use a repository owner's account as a personal identity.
- Retain the selected submission for each archived repository/source ID and verify its team order against the current public project before matching.
- Require consistent registered public profiles and compatible names. Keep existing organiser-confirmed identities; reject conflicting accounts and shared teammate emails.
- AI Summit: 114 of 144 source credits have an email present in the saved exports. Three of those use one shared teammate email; 111 have an individual matching email. One match recovered from the broader exports is Ana Lucia Silva on OffLoad, whose registration has no usable social links. This does not add a new public profile.
- Skill-a-thon: 15 of 16 submitting accounts have an exact email match somewhere in the exports. Oscar on whatsapp traductor matches an account registered under a different name and stays unlinked. Teammates do not have their own source email fields, so they cannot inherit the submitter's match.
- June Netlify: the original gallery has 27 builder credits but no builder email field. Email matching is unavailable; retain the previously reviewed profile/name evidence.
- The Vibecode export can corroborate identities seen at other events. No corresponding project source with individual builder emails was available for this pass.

## Abel and the shared Preply email

| Evidence                       | Finding                                                                                                                                                                                                                                 |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fireguard and TitanAI Searcher | The two full-name Abel Romero Martinez credits use the same submission email. Fireguard repeats that email for the other two teammates as well. That email has no exact match in the saved guest exports.                               |
| Abel's registration            | His supplied LinkedIn account appears under the registered display name **Abel**, rather than his full surname. His registration email differs from both the full-name submissions and the Preply team email.                           |
| preply_project_learning-       | All three submitted credits—alvaro, abel and alex—use one email. It matches **Alvaro Haoan**, with [LinkedIn](https://www.linkedin.com/in/alvaroh512b293b4/) and [GitHub](https://github.com/0x832). It does not identify Abel or Alex. |

The email evidence does **not** establish that the first-name-only Preply credit belongs to the supplied Abel profile. It remains separate. The two full-name credits retain the organiser-supplied [Abel Romero profile](https://www.linkedin.com/in/abel-romero-115b0539b/). No teammate receives Alvaro's identity through the shared email.

## Added public GitHub credits

These additions require the submitting account's exact email to match a registration with the already verified LinkedIn identity. No new identity is inferred from the project repository.

| Builder        | Projects                                        | Registered GitHub                           |
| -------------- | ----------------------------------------------- | ------------------------------------------- |
| Colin Stark    | a11y ally, Design One-Pager, Steve as a Service | [colinstark](https://github.com/colinstark) |
| Nicolas Grenié | Royal Crown Lingo                               | [picsoung](https://github.com/picsoung)     |
| Joe Tannoury   | drawhub: draw on dice.fyi                       | [YiumPotato](https://github.com/YiumPotato) |

Colin and Nicolas's submitting emails match their AI Summit registrations. Joe's exact email matches the previously reviewed **Joe Tann** registration with his existing `joetann` LinkedIn identity. Older snapshots with blank social fields do not supply a different identity. The separate teammate named “Joe” remains unlinked.

import type { Testimonial } from './testimonials'

export type CommunityMention = {
  eventSlug: Testimonial['eventSlug'] | null
  relatedEventSlugs?: Testimonial['eventSlug'][]
  kind:
    | 'participant-recap'
    | 'organizer-recap'
    | 'partner-recap'
    | 'commentary-repost'
    | 'project-update'
    | 'announcement'
    | 'press-announcement'
    | 'press-recap'
    | 'context'
    | 'project-reference'
    | 'profile-reference'
    | 'event-listing'
  status: 'added' | 'audit-only'
  platform: 'linkedin' | 'press' | 'web'
  author: string
  authorUrl?: string
  url: string
  sourceUrl?: string
  originalPostUrl?: string
  summary: string
  evidence: string
  avatar?: string
  avatarKind?: 'person' | 'logo'
  position?: string
  positionSourceUrl?: string
}

// Reclassified from the original screenshot collection after the organiser
// confirmed that announcements belong in the audit, outside event recaps.
export const curatedAnnouncementReviews: CommunityMention[] = [
  {
    eventSlug: 'v1-2024',
    kind: 'announcement',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Gabriele Raffaelli',
    url: 'https://www.linkedin.com/posts/gabriele-raffaelli-67779576_hackbcn-ai-hackathon-activity-7207761310208389120-IYMv',
    summary:
      'Gabriele shares his registration for the upcoming first edition and invites Barcelona’s AI community to join.',
    evidence:
      'The original post says he has signed up and encourages people to attend; it describes a previous conference talk rather than a HackBCN experience.',
  },
  {
    eventSlug: 'v1-2024',
    kind: 'announcement',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Joan Bordonaba',
    url: 'https://www.linkedin.com/posts/joanbr4_despu%C3%A9s-de-la-gran-experiencia-creo-que-activity-7210744680899108865-ijW3',
    summary:
      'Joan looks forward to the June 29–30 hackathon, invites others to register and offers to form a team.',
    evidence:
      'The original post explicitly says the hackathon will start June 29–30 and registration is still open; its opening reflection concerns an earlier experience.',
  },
  {
    eventSlug: 'v1-2024',
    kind: 'announcement',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Tanya Van Gastel',
    url: 'https://www.linkedin.com/posts/tanyavangastel_barcelonas-first-ai-hackathon-is-this-week-activity-7212055785965514752-eowb',
    summary:
      'Tanya announces her upcoming judging role and invites people to watch Sunday’s demos.',
    evidence:
      'The original post says the first AI hackathon is this week and she is excited to see what the selected hackers will build.',
  },
  {
    eventSlug: 'v1-2024',
    kind: 'press-announcement',
    status: 'audit-only',
    platform: 'press',
    author: 'Paréntesis.Media',
    url: 'https://www.parentesis.media/programar-una-ia-en-24-horas-asi-sera-el-hackaton-de-barcelona/',
    summary:
      'Paréntesis.Media previews the first edition’s format and the June 29–30 programme.',
    evidence:
      'The article is dated June 26, 2024 and describes the event prospectively, before the hackathon took place.',
  },
]

// Public sources reviewed on November 18, 2026. Summaries are paraphrases.
// Publication dates are not inferred from LinkedIn IDs or relative timestamps.
// Only added recaps and updates enter event sections; other mentions remain auditable.
export const communityMentions: CommunityMention[] = [
  {
    eventSlug: null,
    kind: 'context',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Micaela Villalobos',
    authorUrl: 'https://www.linkedin.com/in/micaelavillalobos/',
    url: 'https://www.linkedin.com/posts/micaelavillalobos_meet-the-mentors-nicolas-greni%C3%A9-share-7526659569213677568-Dg4j/',
    sourceUrl: 'https://lnkd.in/p/emgzxEfS',
    summary:
      'A mentor introduction mentions HackBarna in Nicolas Grenié’s biography.',
    evidence:
      'The post promotes another programme; the HackBarna reference is biographical.',
  },
  {
    eventSlug: 'hacknight-5-jevathon-2026',
    kind: 'organizer-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Nicolas Grenié',
    authorUrl: 'https://www.linkedin.com/in/nicolasgrenie/',
    url: 'https://www.linkedin.com/posts/nicolasgrenie_we-filled-itnig-startup-ecosystem-to-the-ugcPost-7526630487520382976-U3r_/',
    sourceUrl: 'https://lnkd.in/p/eWp-sV-X',
    summary:
      'Nicolas recaps the Jev-a-thon at Itnig and highlights Push·Cube, Human, Please, GRIN and Tria.',
    evidence: 'Explicit Jev, Lovable, Itnig and the Tuesday HackNight recap.',
    avatar: '/mentors/nico.jpeg',
  },
  {
    eventSlug: 'hacknight-5-jevathon-2026',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Ilze Pupola',
    authorUrl: 'https://www.linkedin.com/in/ilze-pupola-11a744370/',
    url: 'https://www.linkedin.com/posts/ilze-pupola-11a744370_barcelona-ai-lovable-share-7526359675995463680-uj0i/',
    sourceUrl: 'https://lnkd.in/p/ew9s-kBP',
    summary:
      'Ilze reflects on building with Jev and Lovable at Itnig and reconnecting with Barcelona’s tech community.',
    evidence: 'Explicit HackBarna Night, TypeSafe’s Jev, Lovable and Itnig.',
  },
  {
    eventSlug: 'hacknight-5-jevathon-2026',
    kind: 'announcement',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Ian Moss',
    authorUrl: 'https://www.linkedin.com/in/alteris/',
    url: 'https://www.linkedin.com/posts/alteris_twib-berlin-newyork-ugcPost-7525573501718609920-1YZy/',
    sourceUrl: 'https://lnkd.in/p/eA6ZqGaU',
    summary:
      'Ian includes the November 10 Jev-a-thon in his weekly Barcelona events roundup.',
    evidence: 'Explicit November 10, HackNight #5 and the matching Luma link.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'commentary-repost',
    status: 'added',
    platform: 'linkedin',
    author: 'Duna Febré Vila',
    authorUrl: 'https://www.linkedin.com/in/duna-febr%C3%A9-vila-981448419/',
    url: 'https://www.linkedin.com/posts/duna-febr%C3%A9-vila-981448419_hackbarna-was-my-first-hackathon-we-built-ugcPost-7525304872766734336-Ax7v/',
    sourceUrl: 'https://lnkd.in/p/et3UY-6t',
    summary:
      'Duna describes her first hackathon and the TV discovery agent her team built together.',
    evidence:
      'Own commentary on the Titan OS project; embedded Sergi recap mentions Mastra and Nebius.',
    avatar: '/makers/linkedin-duna-febre-vila-981448419-eaea6a08.jpg',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'John Carlo Garciano',
    authorUrl: 'https://www.linkedin.com/in/johncarlogarciano/',
    url: 'https://www.linkedin.com/posts/johncarlogarciano_this-summer-my-friend-alejandro-lezcano-sirre-share-7524445628135903232-L3Wh/',
    sourceUrl: 'https://lnkd.in/p/eyU5GSRB',
    summary:
      'John Carlo shares ControlledFire, a wildfire monitoring and risk prototype built with Alejandro using Deepfire and Nebius.',
    evidence:
      'Explicit Norrsken, AI Summit, wildfire challenge and the archived ControlledFire project.',
    avatar: '/makers/linkedin-johncarlogarciano-9491f29f.jpg',
  },
  {
    eventSlug: 'hacknight-5-jevathon-2026',
    kind: 'announcement',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Rafa Romero',
    authorUrl: 'https://www.linkedin.com/in/rafaelromeromuela/',
    url: 'https://www.linkedin.com/posts/rafaelromeromuela_heres-whats-on-at-happy-operators-next-share-7524433069806624768-EVsk/',
    sourceUrl: 'https://lnkd.in/p/e-NuKCZp',
    summary:
      'Rafa’s weekly programme includes the November 10 Jev-a-thon with HackBarna.',
    evidence: 'Explicit date, Itnig, Jev and Lovable.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'project-update',
    status: 'added',
    platform: 'linkedin',
    author: 'Arnab Dey, PhD',
    authorUrl: 'https://www.linkedin.com/in/arnabdey0503/',
    url: 'https://www.linkedin.com/posts/arnabdey0503_digitalhumans-conversationalai-voiceai-ugcPost-7524138210034253824-QIFI/',
    sourceUrl: 'https://lnkd.in/p/eH9gqggQ',
    summary:
      'Arnab revisits MIRA with a new talking-head model, extending the TV agent his team built at the September hackathon.',
    evidence: 'Explicit September HackBarna, MIRA, Titan OS and second place.',
    avatar: '/testimonials/avatars/arnab-dey.jpg',
    position: 'Senior Research Engineer',
  },
  {
    eventSlug: 'hacknight-5-jevathon-2026',
    kind: 'announcement',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Happy Operators',
    authorUrl: 'https://www.linkedin.com/company/happy-operators/',
    url: 'https://www.linkedin.com/posts/hack-night-5-is-next-tuesday-10-november-ugcPost-7523464276808744961-94_X/',
    sourceUrl: 'https://lnkd.in/p/emJWT-hq',
    summary:
      'Happy Operators shares the programme and registration details for HackNight #5.',
    evidence: 'Explicit November 10, Jev, Lovable and Itnig.',
  },
  {
    eventSlug: 'hacknight-5-jevathon-2026',
    kind: 'announcement',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Nicolas Grenié',
    authorUrl: 'https://www.linkedin.com/in/nicolasgrenie/',
    url: 'https://www.linkedin.com/posts/nicolasgrenie_ai-goes-way-beyond-llms-about-a-month-ago-share-7521138026455060480-H7Bp/',
    sourceUrl: 'https://lnkd.in/p/eYEfXVSG',
    summary:
      'Nicolas announces a HackNight focused on decision models with Jev and Lovable.',
    evidence:
      'Explicit next HackNight, Jev, Lovable and Itnig; previous hackathon mentioned as background.',
  },
  {
    eventSlug: 'hacknight-5-jevathon-2026',
    kind: 'announcement',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'HackBarna',
    authorUrl: 'https://www.linkedin.com/company/hackbarna/',
    url: 'https://www.linkedin.com/posts/coming-back-with-a-new-hacknight-lets-discover-ugcPost-7521133471382163456-iYO8/',
    sourceUrl: 'https://lnkd.in/p/e2-EBtgc',
    summary: 'HackBarna announces the Jev-a-thon and its decision-model theme.',
    evidence:
      'Explicit Jev-a-thon, November 10 and Lovable; platform event timing differs from the site, so no schedule is imported.',
  },
  {
    eventSlug: null,
    kind: 'context',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Igor Kuzmin',
    authorUrl: 'https://www.linkedin.com/in/igor-kuzmin-tech/',
    url: 'https://www.linkedin.com/posts/igor-kuzmin-tech_agenticai-generativeui-voiceai-ugcPost-7518331852328382465-Zihm/',
    sourceUrl: 'https://lnkd.in/p/eU5qXhGD',
    summary:
      'Igor mentions a previous HackBarna result while recapping a different hackathon in Zurich.',
    evidence:
      'The project discussed is Orbs at Tech: Europe; this is not a HackBarna project recap.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'project-update',
    status: 'added',
    platform: 'linkedin',
    author: 'ANA LUCIA SILVA CÓRDOBA',
    authorUrl: 'https://www.linkedin.com/in/ana-lucia-silva-cordoba/',
    url: 'https://www.linkedin.com/posts/ana-lucia-silva-cordoba_hackbarna-vonage-inteligenciaartificial-ugcPost-7517602351747166209-LfkD/',
    sourceUrl: 'https://lnkd.in/p/e5ZF988D',
    summary:
      'Ana Lucía reflects on building OffLoad and winning the Vonage challenge, introducing a longer article about experimenting with AI.',
    evidence:
      'Explicit HackBarna AI Summit 2026, OffLoad and the Vonage challenge.',
    avatar: '/testimonials/avatars/ana-lucia-silva-cordoba.jpg',
    position: 'Web Developer',
  },
  {
    eventSlug: 'netlify-barcelona-2026',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Siddhant Varma',
    authorUrl: 'https://www.linkedin.com/in/siddhantvarma99/',
    url: 'https://www.linkedin.com/posts/siddhantvarma99_barcelonas-tech-scene-doesnt-sleep-in-ugcPost-7516055971367026688-ESH5/',
    sourceUrl: 'https://lnkd.in/p/ecwc_KPG',
    summary:
      'Siddhant includes the Netlify meetup in a Barcelona tech roundup, reflecting on the demo and fireside chat.',
    evidence:
      'Explicit Netlify @ Barcelona, Happy Operators, demo and fireside chat distinguish this from June’s build night.',
  },
  {
    eventSlug: 'netlify-barcelona-2026',
    kind: 'commentary-repost',
    status: 'added',
    platform: 'linkedin',
    author: 'Netlify',
    authorUrl: 'https://www.linkedin.com/company/netlify/',
    url: 'https://www.linkedin.com/posts/dana-and-the-team-spent-wednesday-night-with-ugcPost-7514295408118943746-YK4F/',
    sourceUrl: 'https://lnkd.in/p/e9MxZFzk',
    summary:
      'Netlify thanks Barcelona’s builders and the hosts after the CTO and CPO meetup at La Fabrica.',
    evidence:
      'Own Netlify commentary plus La Fabrica recap; explicit CTO/CPO and venue.',
    avatar: '/logos/netlify.svg',
    avatarKind: 'logo',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Abel Romero',
    authorUrl: 'https://www.linkedin.com/in/abel-romero-115b0539b/',
    url: 'https://www.linkedin.com/posts/abel-romero-115b0539b_artificialintelligence-ai-iot-share-7513311326371418115-nDJt/',
    sourceUrl: 'https://lnkd.in/p/e9E_wRHg',
    summary:
      'Abel presents FIREGUARD, his team’s two-day wildfire detection, verification and prevention prototype.',
    evidence:
      'FIREGUARD, named teammates and Deepfire wildfire track match the September project archive.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'organizer-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'AI SUMMIT BARCELONA',
    authorUrl: 'https://www.linkedin.com/company/ai-summit-barcelona/',
    url: 'https://www.linkedin.com/posts/still-thinking-about-hackathon-the-aftermovie-ugcPost-7512827471600345090-98SW/',
    sourceUrl: 'https://lnkd.in/p/eJHGZq_y',
    summary:
      'AI Summit Barcelona shares the hackathon aftermovie and celebrates the teams, volunteers, judges and partners at Norrsken.',
    evidence:
      'Explicit Norrsken, Kan, MIRA, ByeByeScammers and September’s sponsor lineup.',
  },
  {
    eventSlug: 'netlify-barcelona-2026',
    kind: 'announcement',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Netlify',
    authorUrl: 'https://www.linkedin.com/company/netlify/',
    url: 'https://www.linkedin.com/posts/netlify-is-returning-to-barcelona-tomorrow-share-7513236779685056512-nBXA/',
    sourceUrl: 'https://lnkd.in/p/eeG-U9N6',
    summary:
      'Netlify announces the October 7 demo, fireside chat and community mixer.',
    evidence: 'Explicit October 7 and the matching Luma registration link.',
  },
  {
    eventSlug: 'netlify-barcelona-2026',
    kind: 'announcement',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Matt Roberts',
    authorUrl: 'https://www.linkedin.com/in/mattjroberts/',
    url: 'https://www.linkedin.com/posts/mattjroberts_on-wednesday-i-get-to-grill-netlifys-cto-ugcPost-7511729830506385411-P-aA/',
    sourceUrl: 'https://lnkd.in/p/eACxefV7',
    summary:
      'Matt previews his fireside chat with Netlify’s CTO and CPO at La Fabrica.',
    evidence: 'Explicit October 7, La Fabrica, Dana Lawson and Wade Wegner.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'project-update',
    status: 'added',
    platform: 'linkedin',
    author: 'Tair Asim',
    authorUrl: 'https://www.linkedin.com/in/tairasim/',
    url: 'https://www.linkedin.com/posts/tairasim_im-joining-forma-for-a-six-week-founder-share-7511720236765736960-jhnJ/',
    sourceUrl: 'https://lnkd.in/p/eyQ4kgu5',
    summary:
      'Tair takes nito, the design reviewer he first built at HackBarna, into a founder residency for further development.',
    evidence:
      'Explicit nito origin; same author’s September recap identifies nito and Norrsken.',
    avatar: '/makers/linkedin-tairasim-97492693.jpg',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'context',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Niko Miralles',
    authorUrl: 'https://www.linkedin.com/in/niko-miralles/',
    url: 'https://www.linkedin.com/posts/niko-miralles_i-turned-16-one-month-ago-yesterday-i-opened-ugcPost-7511146544000258049-p_Sr/',
    sourceUrl: 'https://lnkd.in/p/etEezdxj',
    summary:
      'Niko includes a HackBarna podium in a wider reflection on his first month in Barcelona’s founder community.',
    evidence:
      'Explicit HackBarna top three; corroborated by the ByeByeScammers team recaps. The post mainly covers several other events.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'partner-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Preply',
    authorUrl: 'https://www.linkedin.com/company/preply/',
    url: 'https://www.linkedin.com/posts/ecmlpkdd2026-ugcPost-7511014446505312256--dR_/',
    sourceUrl: 'https://lnkd.in/p/euSw_KjZ',
    summary:
      'Preply’s September roundup includes mentoring HackBarna teams as part of its work with Europe’s AI community.',
    evidence:
      'Explicit September mentoring at HackBarna; matches the Preply challenge and mentor recaps.',
    avatar: '/logos/preply.svg',
    avatarKind: 'logo',
  },
  {
    eventSlug: 'netlify-barcelona-2026',
    kind: 'announcement',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Netlify',
    authorUrl: 'https://www.linkedin.com/company/netlify/',
    url: 'https://www.linkedin.com/posts/heres-the-program-for-netlifys-barcelona-share-7510775242722549760-fsi-/',
    sourceUrl: 'https://lnkd.in/p/e7Zm9tYB',
    summary:
      'Netlify publishes the October meetup programme, from the Agent Runners demo to the fireside chat and mixer.',
    evidence: 'Explicit October 7 and the corresponding meetup speakers.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'project-update',
    status: 'added',
    platform: 'linkedin',
    author: 'Galtea',
    authorUrl: 'https://www.linkedin.com/company/galtea-ai/',
    url: 'https://www.linkedin.com/posts/we-can-hear-you-last-weekend-at-the-hackbarna-share-7510618753995476992-YxYG/',
    sourceUrl: 'https://lnkd.in/p/etb8hVKP',
    summary:
      'Galtea explains how a question from HackBarna builders led to a new integration for testing SLNG voice agents.',
    evidence:
      'Explicit hackathon-origin integration; SLNG and Galtea are September partners.',
    avatar: '/logos/galtea.svg',
    avatarKind: 'logo',
  },
  {
    eventSlug: null,
    kind: 'context',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Alexander B',
    authorUrl: 'https://www.linkedin.com/in/alexander-b-948b36a4/',
    url: 'https://www.linkedin.com/posts/alexander-b-948b36a4_aisb26-aisb27-artificialintelligence-ugcPost-7510346193357606912-8z78/',
    sourceUrl: 'https://lnkd.in/p/eDbQKGt2',
    summary:
      'Alexander includes HackBarna in an ecosystem-wide AI Summit Barcelona retrospective.',
    evidence:
      'The post primarily discusses the September 22–23 conference and tags HackBarna, without describing a specific HackBarna experience.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'context',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Quality Clouds',
    authorUrl: 'https://www.linkedin.com/company/qualityclouds/',
    url: 'https://www.linkedin.com/posts/from-winning-hackbarna-to-taking-the-trophy-ugcPost-7510242556799193088-dwAE/',
    sourceUrl: 'https://lnkd.in/p/eknGbwwu',
    summary:
      'Quality Clouds celebrates HackBarna winners going on to win another competition in Malmö.',
    evidence:
      'Explicit HackBarna-to-Malmö connection; the embedded SideQuest build belongs to the later competition, not this event.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Nina Haide, M.Sc.',
    authorUrl: 'https://www.linkedin.com/in/ninahaide/',
    url: 'https://www.linkedin.com/posts/ninahaide_aisb26-aiweekbarcelona-aiengineering-share-7509664911422046208-SPWa/',
    sourceUrl: 'https://lnkd.in/p/eagTTgCr',
    summary:
      'Nina reflects on Barcelona’s September AI Week, including building at HackBarna and volunteering at the Summit.',
    evidence:
      'Explicit September 16–24, HackBarna and a hackathon submission; separate from her Nova-Cast project demo.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'context',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Jiantong Wei',
    authorUrl: 'https://www.linkedin.com/in/jiantong-wei-70285b121/',
    url: 'https://www.linkedin.com/posts/jiantong-wei-70285b121_next-stop-malm%C3%B6-after-finishing-top-ugcPost-7509340520997879808-roFL/',
    sourceUrl: 'https://lnkd.in/p/eqK56ijm',
    summary:
      'Jiantong credits the HackBarna podium and Quality Clouds support for a later invitation to compete in Malmö.',
    evidence:
      'Explicit AI Summit Barcelona Hackathon top-three result; primarily an announcement for another competition.',
  },
  {
    eventSlug: 'netlify-barcelona-2026',
    kind: 'announcement',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Netlify',
    authorUrl: 'https://www.linkedin.com/company/netlify/',
    url: 'https://www.linkedin.com/posts/netlify-is-heading-back-to-barcelona-for-share-7509311968671944705-fSnm/',
    sourceUrl: 'https://lnkd.in/p/e68_Uspg',
    summary:
      'Netlify invites Barcelona’s community to the October 7 meetup with HackBarna and Happy Operators.',
    evidence: 'Explicit October 7 and the matching Luma URL.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Nicolás Cárdenas',
    authorUrl:
      'https://www.linkedin.com/in/nicol%C3%A1s-c%C3%A1rdenas-732b16224/',
    url: 'https://www.linkedin.com/posts/nicol%C3%A1s-c%C3%A1rdenas-732b16224_this-week-was-a-good-reminder-of-how-much-ugcPost-7509207445907402752-ydJr/',
    sourceUrl: 'https://lnkd.in/p/easbZB8u',
    summary:
      'Nicolás reflects on experimenting with sponsors’ tools, meeting builders and learning together at Norrsken.',
    evidence: 'Explicit HackBarna, Norrsken and the adjoining AI Summit.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Jürgen Ladstätter',
    authorUrl: 'https://www.linkedin.com/in/juergen-ladstaetter/',
    url: 'https://www.linkedin.com/posts/juergen-ladstaetter_aisummit-barcelona-artificialintelligence-ugcPost-7509184328434831360-kHQJ/',
    sourceUrl: 'https://lnkd.in/p/eHqe-qkV',
    summary:
      'Jürgen reflects on a week of AI learning in Barcelona, including HackBarna and conversations about bringing AI into organisations.',
    evidence:
      'Explicit HackBarna hackathon alongside AI Summit Barcelona; described as one part of the week.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'partner-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Louis Cameron Booth',
    authorUrl: 'https://www.linkedin.com/in/louis-cameron-booth-b10b56157/',
    url: 'https://www.linkedin.com/posts/louis-cameron-booth-b10b56157_last-weekend-deepfire-cohosted-and-judged-ugcPost-7508907278511722497-Qm7P/',
    sourceUrl: 'https://lnkd.in/p/eWAEKhtr',
    summary:
      'Louis shares Deepfire’s wildfire challenge, from satellite data and fire simulations to the varied prototypes teams built.',
    evidence: 'Explicit Deepfire/Norrsken challenge, HackBarna and AI Summit.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Andrii Kalashnikov',
    authorUrl: 'https://www.linkedin.com/in/an-kalashnikov/',
    url: 'https://www.linkedin.com/posts/an-kalashnikov_ai-hackathon-edtech-ugcPost-7508856347656871936-Bgk4/',
    sourceUrl: 'https://lnkd.in/p/ecpSmaD7',
    summary:
      'Andrii shares Ribbit, a reading companion that turns children’s words into stories, and reflects on building solo at Norrsken.',
    evidence: 'Explicit Ribbit, Norrsken and Preply/Galtea challenges.',
    avatar: '/makers/linkedin-an-kalashnikov-6cb01226.jpg',
  },
  {
    eventSlug: null,
    kind: 'context',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'BSC AI Factory',
    authorUrl: 'https://www.linkedin.com/company/bsc-ai-factory/',
    url: 'https://www.linkedin.com/posts/bscaifactory-bscaifactory-bscaif-ugcPost-7508558647153590272-tjQR/',
    sourceUrl: 'https://lnkd.in/p/efF9R_6y',
    summary:
      'BSC AI Factory tags HackBarna in a recap of a conference panel about European supercomputing.',
    evidence:
      'Panel at the main AI Summit; no specific hackathon participation described.',
  },
  {
    eventSlug: null,
    kind: 'context',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Marc Pous',
    authorUrl: 'https://www.linkedin.com/in/marcpous/',
    url: 'https://www.linkedin.com/posts/marcpous_roscon26-iot-edgeai-ugcPost-7508545066416623617-l3Vx/',
    sourceUrl: 'https://lnkd.in/p/euBBQH-Q',
    summary:
      'Marc lists HackBarna among several events he is not attending that week.',
    evidence:
      'Explicitly says he is not attending; must not become an attendee testimonial.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'partner-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'SLNG',
    authorUrl: 'https://www.linkedin.com/company/slng-ai/',
    url: 'https://www.linkedin.com/posts/almost-half-the-projects-at-hackbarna-were-ugcPost-7508494922656751616-Bv57/',
    sourceUrl: 'https://lnkd.in/p/e_zKPekE',
    summary:
      'SLNG celebrates the voice projects built at Norrsken and the Compass team’s challenge result.',
    evidence: 'Explicit Norrsken, Compass, Nicolò Giacomini and Roc Cutal.',
    avatar: '/logos/slng.svg',
    avatarKind: 'logo',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Manuel Parma',
    authorUrl: 'https://www.linkedin.com/in/manuel-parma/',
    url: 'https://www.linkedin.com/posts/manuel-parma_this-past-weekend-i-joined-hackbarna-2026-ugcPost-7508475369507790848-TjRF/',
    sourceUrl: 'https://lnkd.in/p/e-k3d_V5',
    summary:
      'Manuel describes the data engineering and voice experience behind Kino Files, his team’s conversational movie assistant.',
    evidence: 'Explicit HackBarna 2026, Norrsken and the Titan OS challenge.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'partner-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Casimiro Pio Carrino',
    authorUrl: 'https://www.linkedin.com/in/casimiro-pio-carrino/',
    url: 'https://www.linkedin.com/posts/casimiro-pio-carrino_last-weekend-i-mentored-at-hackbarna-for-ugcPost-7508469226584662016-ndOZ/',
    sourceUrl: 'https://lnkd.in/p/ergB8vjA',
    summary:
      'Casimiro reflects on mentoring the Preply challenge and the learning experiences built by the Taula and Ribbit teams.',
    evidence:
      'Explicit Preply mentor role, Taula/Ribbit teams and the matching September challenge.',
  },
  {
    eventSlug: null,
    kind: 'context',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'BSC AI Factory',
    authorUrl: 'https://www.linkedin.com/company/bsc-ai-factory/',
    url: 'https://www.linkedin.com/posts/bscaifactory-bscaifactory-aifactory-share-7508449217057587200-OiZt/',
    sourceUrl: 'https://lnkd.in/p/eH8DK9fF',
    summary:
      'BSC AI Factory includes HackBarna in a partner list for an upcoming AI Summit panel.',
    evidence:
      'Explicit September 23 panel at World Trade Center; not a hackathon announcement.',
  },
  {
    eventSlug: null,
    kind: 'context',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Bcombinator',
    authorUrl: 'https://www.linkedin.com/company/bcombinator/',
    url: 'https://www.linkedin.com/posts/ai-is-no-longer-a-pilot-lets-talk-about-ugcPost-7508434408157167616-2cDW/',
    sourceUrl: 'https://lnkd.in/p/eaZBHeQu',
    summary: 'Bcombinator lists HackBarna among partners for its AI Day.',
    evidence:
      'Separate Bcombinator programme; not one of the ten archived HackBarna events.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Rosa Vázquez Sánchez',
    authorUrl: 'https://www.linkedin.com/in/rosavazquezsanchez/',
    url: 'https://www.linkedin.com/posts/rosavazquezsanchez_hackbarna2026-aisummitbcn-hackathon-ugcPost-7508416284074606592-KJ7D/',
    sourceUrl: 'https://lnkd.in/p/ekutZ29X',
    summary:
      'Rosa shares HackFire, her team’s prototype for wildfire alerts, evacuation routes and support for people needing help.',
    evidence: 'Explicit Norrsken, HackFire, AI Summit and the named team.',
  },
  {
    eventSlug: null,
    kind: 'context',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Claudia Stanelli',
    authorUrl: 'https://www.linkedin.com/in/claudia-s-4755b8191/',
    url: 'https://www.linkedin.com/posts/claudia-s-4755b8191_hackbarna-aisummit-aisummitbarcelona-ugcPost-7508269410717990912-d9q3/',
    sourceUrl: 'https://lnkd.in/p/eZC9Fz26',
    summary:
      'Claudia uses the HackBarna hashtag in a recap of a Vapi and Deepgram Voice AI meetup.',
    evidence:
      'The described event is at AZUL Rooftop, not an archived HackBarna event.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'partner-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Lisa Dal Colle',
    authorUrl: 'https://www.linkedin.com/in/lisa-dal-colle-6217951b4/',
    url: 'https://www.linkedin.com/posts/lisa-dal-colle-6217951b4_lifeatnebius-ugcPost-7508230804599312384-GZJy/',
    sourceUrl: 'https://lnkd.in/p/e4tQG-tF',
    summary:
      'Lisa includes the Nebius Token Factory challenge at HackBarna in a roundup of the team’s work in Spain.',
    evidence:
      'Explicit HackBarna AI Summit challenge over the weekend and the Nebius team.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'commentary-repost',
    status: 'added',
    platform: 'linkedin',
    author: 'Gerson Montesinos',
    authorUrl: 'https://www.linkedin.com/in/gersonmontesinos/',
    url: 'https://www.linkedin.com/posts/gersonmontesinos_this-past-weekend-i-joined-my-first-ever-share-7508163391572869120-rgDu/',
    sourceUrl: 'https://lnkd.in/p/eR7hcqei',
    summary:
      'Gerson reflects on his first hackathon, building a workflow automation tool with Marcus and earning a Make challenge prize.',
    evidence:
      'Own commentary explicitly names the HackBarna project; the embedded teammate post supplies corroboration.',
    avatar: '/makers/linkedin-gersonmontesinos-805508a8.jpg',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Marta Quirós Dinarès',
    authorUrl: 'https://www.linkedin.com/in/martaquiros/',
    url: 'https://www.linkedin.com/posts/martaquiros_a-quick-recap-of-the-hackbarna-this-weekend-ugcPost-7508104249151590400-kTY6/',
    sourceUrl: 'https://lnkd.in/p/e8ThvPzV',
    summary:
      'Marta shares her team’s wildfire challenge experience, from a two-day build to presenting their prototype at Norrsken.',
    evidence:
      'Explicit Norrsken, Ylenia and Rubén, and the wildfire challenge.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'commentary-repost',
    status: 'added',
    platform: 'linkedin',
    author: 'Giulia Bono',
    authorUrl: 'https://www.linkedin.com/in/giuliabono/',
    url: 'https://www.linkedin.com/posts/giuliabono_mooooom-we-won-the-make-challenge-at-hackbarna-ugcPost-7508095608482820097-0J0B/',
    sourceUrl: 'https://lnkd.in/p/edDD75At',
    summary:
      'Giulia shares Lumi, a Telegram agent that routes clinical questions to a nurse, and the lessons from building it together.',
    evidence:
      'Own commentary names Lumi, Marta, Valentin and the Make challenge; embedded Make post is not attributed to Giulia.',
    avatar: '/makers/linkedin-giuliabono-b6cdfa3c.jpg',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'partner-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Fleet',
    authorUrl: 'https://www.linkedin.com/company/fleet-computer/',
    url: 'https://www.linkedin.com/posts/last-sunday-before-ai-summit-barcelona-even-ugcPost-7508071878897410049-K33M/',
    sourceUrl: 'https://lnkd.in/p/eReKcpap',
    summary:
      'Fleet celebrates supporting the HackBarna weekend at Norrsken and providing the winning team with new gear.',
    evidence:
      'Explicit Norrsken House hackathon immediately before the September 22–23 Summit.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'partner-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Galtea',
    authorUrl: 'https://www.linkedin.com/company/galtea-ai/',
    url: 'https://www.linkedin.com/posts/we-just-spent-the-entire-weekend-with-150-ugcPost-7508065504620834816-C7qC/',
    sourceUrl: 'https://lnkd.in/p/esGTPJxq',
    summary:
      'Galtea recaps its AI evaluation challenge and the different ways teams tested the products they built during the weekend.',
    evidence:
      'Explicit Kan, Ribbit, CouchSync, Chez and ByeByeScammer at Norrsken.',
    avatar: '/logos/galtea.svg',
    avatarKind: 'logo',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Nicolò Giacomini',
    authorUrl: 'https://www.linkedin.com/in/nicolo-giacomini/',
    url: 'https://www.linkedin.com/posts/nicolo-giacomini_hackbarna-voiceai-unmuted-share-7508052311072518144-12Sd/',
    sourceUrl: 'https://lnkd.in/p/eaWisjr8',
    summary:
      'Nicolò describes building Compass with Roc: a conversational TV recommendation experience using SLNG and Unmute.',
    evidence: 'Explicit Norrsken, Compass and the SLNG challenge.',
    avatar: '/makers/linkedin-nicolo-giacomini-f4d46150.jpg',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Elena LPris  🇺🇦 🇨🇦',
    authorUrl: 'https://www.linkedin.com/in/elenalpris/',
    url: 'https://www.linkedin.com/posts/elenalpris_hackathon-ugcPost-7507925560698867712-t_bf/',
    sourceUrl: 'https://lnkd.in/p/e5hdWaCg',
    summary:
      'Elena reflects on her first hackathon, meeting other builders and spending the weekend learning together at Norrsken.',
    evidence: 'Explicit Norrsken, 2026 and attending AI Summit next.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Yania .',
    authorUrl: 'https://www.linkedin.com/in/iamyania/',
    url: 'https://www.linkedin.com/posts/iamyania_this-weekend-participated-in-the-2-days-ai-ugcPost-7507910161378770944-gQRk/',
    sourceUrl: 'https://lnkd.in/p/eD7_4s6P',
    summary:
      'Yania shares the satisfaction of turning a long-planned idea into a working solo project while trying new AI tools.',
    evidence:
      'Explicit two-day AI Summit hackathon, Norrsken and the September sponsor lineup.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Roc Cutal',
    authorUrl: 'https://www.linkedin.com/in/roc-cutal/',
    url: 'https://www.linkedin.com/posts/roc-cutal_hackbarna-voiceai-slng-ugcPost-7507905301912723458-bHlN/',
    sourceUrl: 'https://lnkd.in/p/ekrTKfSW',
    summary:
      'Roc shares Compass, the voice-first TV experience he built with Nicolò, and the infrastructure behind their SLNG challenge entry.',
    evidence: 'Explicit Compass, SLNG, Nebius and AI Summit 26.',
    avatar: '/makers/linkedin-roc-cutal-35703a9d.jpg',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Roger Tito Farez',
    authorUrl: 'https://www.linkedin.com/in/roger-tito-farez-035ab626b/',
    url: 'https://www.linkedin.com/posts/roger-tito-farez-035ab626b_este-finde-he-estado-en-hackbarna-con-bryan-ugcPost-7507900372917714944-VHcy/',
    sourceUrl: 'https://lnkd.in/p/ex-Gj9KD',
    summary:
      'Roger reflects on building wildfire alerts and evacuation support with Bryan and Rosa, with extra attention to people with reduced mobility.',
    evidence:
      'Named HackFire teammates and the corresponding September wildfire project.',
    avatar: '/makers/linkedin-roger-tito-farez-035ab626b-6366e9e6.jpg',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Arnab Dey, PhD',
    authorUrl: 'https://www.linkedin.com/in/arnabdey0503/',
    url: 'https://www.linkedin.com/posts/arnabdey0503_hackbarna-aisummitbcn-voiceai-ugcPost-7507889593120280576-ONCa/',
    sourceUrl: 'https://lnkd.in/p/eHek4sWS',
    summary:
      'Arnab introduces MIRA, the TV companion his team built at Norrsken, and explains how its voice and screen actions work together.',
    evidence:
      'Explicit Norrsken, MIRA and September’s Titan OS/SLNG challenges; distinct from his later technical walkthrough.',
    avatar: '/testimonials/avatars/arnab-dey.jpg',
    position: 'Senior Research Engineer',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Joana Gutierrez Geira',
    authorUrl: 'https://www.linkedin.com/in/joana-gutierrez-geira-/',
    url: 'https://www.linkedin.com/posts/joana-gutierrez-geira-_this-weekend-in-barcelona-we-experienced-ugcPost-7507877235152920576-R_Qf/',
    sourceUrl: 'https://lnkd.in/p/eWunsZWZ',
    summary:
      'Joana explains CouchSync, a voice movie assistant her team evaluated with Galtea during the hackathon.',
    evidence: 'Explicit HackBarna 2026, CouchSync and the Galtea challenge.',
    avatar: '/makers/linkedin-joana-gutierrez-geira--499325e2.jpg',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Katya D.',
    authorUrl: 'https://www.linkedin.com/in/thekatyadominguez/',
    url: 'https://www.linkedin.com/posts/thekatyadominguez_this-weekend-was-my-1st-hackathon-with-hackbarna-share-7507872111936409600-hNND/',
    sourceUrl: 'https://lnkd.in/p/eZqERD84',
    summary:
      'Katya shares Kommotion, an audience-directed live story built with Edouard, and what she learned from prototyping under pressure.',
    evidence:
      'Kommotion, fal and Devin challenges match the September archive.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Francisco Ojeda',
    authorUrl: 'https://www.linkedin.com/in/francisco-ojeda-0a6263205/',
    url: 'https://www.linkedin.com/posts/francisco-ojeda-0a6263205_hackaton-barcelona-ai-ugcPost-7507844959220228098-i3w2/',
    sourceUrl: 'https://lnkd.in/p/epkW9jFt',
    summary:
      'Francisco shares ByeByeScammers, a real-time phone-call scam detection prototype built with Niko and Jiantong at Norrsken.',
    evidence:
      'Explicit Norrsken, ByeByeScammers and the September team and challenges.',
    avatar: '/makers/linkedin-francisco-ojeda-0a6263205-1d991a7f.jpg',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'partner-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Jonne Frankena',
    authorUrl: 'https://www.linkedin.com/in/jonnefrankena/',
    url: 'https://www.linkedin.com/posts/jonnefrankena_behind-the-scenes-at-hackbarna-yesterday-share-7507843401938071552-LpvP/',
    sourceUrl: 'https://lnkd.in/p/etRwNQuf',
    summary:
      'Jonne shares a judge’s view of reviewing the hackathon demos and selecting finalists at Norrsken.',
    evidence: 'Explicit judging at Norrsken to kick off AI Summit.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Igor Kuzmin',
    authorUrl: 'https://www.linkedin.com/in/igor-kuzmin-tech/',
    url: 'https://www.linkedin.com/posts/igor-kuzmin-tech_hackbarna2026-hackbarna-aisummitbcn-ugcPost-7507835829558419457-37Cq/',
    sourceUrl: 'https://lnkd.in/p/ee7c9ANs',
    summary:
      'Igor describes building MIRA’s recommendation system and the experience of creating a conversational TV companion with Arik and Arnab.',
    evidence: 'Explicit Norrsken, MIRA and the September podium.',
    avatar: '/makers/linkedin-igor-kuzmin-tech-15cb79a4.jpg',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Katerina Zarapina',
    authorUrl: 'https://www.linkedin.com/in/katerina-zarapina/',
    url: 'https://www.linkedin.com/posts/katerina-zarapina_this-weekend-i-participated-in-ai-hackathon-ugcPost-7507832300957704192-wpSm/',
    sourceUrl: 'https://lnkd.in/p/e_yyj4fD',
    summary:
      'Katerina reflects on her first HackBarna experience and a prototype for learning sailing terms in different languages.',
    evidence: 'Explicit Norrsken and Preply mentors Casimiro and Sahar.',
    avatar: '/makers/linkedin-katerina-zarapina-bb820047.jpg',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Tair Asim',
    authorUrl: 'https://www.linkedin.com/in/tairasim/',
    url: 'https://www.linkedin.com/posts/tairasim_i-spent-this-weekend-building-at-hackbarna-ugcPost-7507818235556454400-YOrY/',
    sourceUrl: 'https://lnkd.in/p/e9tTt2si',
    summary:
      'Tair shares how a blank page became nito, a working design reviewer for coding agents, over one weekend at Norrsken.',
    evidence: 'Explicit nito, Norrsken and AI Summit starting that week.',
    avatar: '/makers/linkedin-tairasim-97492693.jpg',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Jiantong Wei',
    authorUrl: 'https://www.linkedin.com/in/jiantong-wei-70285b121/',
    url: 'https://www.linkedin.com/posts/jiantong-wei-70285b121_hackbarna-150-hackers-68-projects-and-ugcPost-7507814471994679297-ERSb/',
    sourceUrl: 'https://lnkd.in/p/eFdBk4TV',
    summary:
      'Jiantong explains the idea and agent architecture behind ByeByeScammer and the weekend of building it with Francisco and Niko.',
    evidence: 'Explicit ByeByeScammer, September team and challenge results.',
    avatar: '/makers/linkedin-jiantong-wei-70285b121-efc86411.jpg',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'commentary-repost',
    status: 'added',
    platform: 'linkedin',
    author: 'Yago Pereiro Estevan',
    authorUrl:
      'https://www.linkedin.com/in/yagopereiro-it-strategy-delivery-software/',
    url: 'https://www.linkedin.com/posts/yagopereiro-it-strategy-delivery-software_this-past-weekend-at-hackbarna-teams-put-ugcPost-7507814000693473280-fupE/',
    sourceUrl: 'https://lnkd.in/p/eVGxsjmE',
    summary:
      'Yago reflects on helping HackBarna teams find problems in their AI products through Galtea evaluations before submission.',
    evidence:
      'Own mentor commentary plus embedded Galtea evaluation recap; the sponsor and event match September.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'partner-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Asociación FemCoders Club',
    authorUrl: 'https://www.linkedin.com/company/fem-coders-club/',
    url: 'https://www.linkedin.com/posts/femcodersclub-hackbarna-womenintech-ugcPost-7507804171501346816-Ln-A/',
    sourceUrl: 'https://lnkd.in/p/enyuyX5J',
    summary:
      'FemCoders Club celebrates two days of teamwork, new connections and recognition for the women building at HackBarna.',
    evidence: 'Names the OffLoad team and Vonage recognition from September.',
    avatar: '/logos/community/femcoders.svg',
    avatarKind: 'logo',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Valentin Robles Menichelli',
    authorUrl: 'https://www.linkedin.com/in/valentin-robles-menichelli/',
    url: 'https://www.linkedin.com/posts/valentin-robles-menichelli_this-weekend-we-won-the-make-challenge-at-ugcPost-7507802775787954176-Rz6h/',
    sourceUrl: 'https://lnkd.in/p/eCC7y7Sy',
    summary:
      'Valentin shares the engineering lessons behind Lumi, from human approval workflows to the team’s Make integration.',
    evidence: 'Explicit Lumi, Norrsken, Giulia, Marta and the Make challenge.',
    avatar: '/makers/linkedin-valentin-robles-menichelli-0d88e83f.jpg',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Tamara Carvalho',
    authorUrl: 'https://www.linkedin.com/in/tamara-carvalho-91bb48144/',
    url: 'https://www.linkedin.com/posts/tamara-carvalho-91bb48144_hackbarna-ugcPost-7507796286339915776-x_mV/',
    sourceUrl: 'https://lnkd.in/p/eDu6a7y3',
    summary:
      'Tamara reflects on learning from her first workshops and teammates while building at HackBarna in Norrsken.',
    evidence:
      'Explicit Norrsken, Make/Vonage workshops and Daniela/Murathan’s September team.',
    avatar: '/makers/linkedin-tamara-carvalho-91bb48144-d45066e6.jpg',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Asier Zapata Fernández',
    authorUrl: 'https://www.linkedin.com/in/asierzapata/',
    url: 'https://www.linkedin.com/posts/asierzapata_last-year-after-hackbarna-i-wrote-already-ugcPost-7507788935855505408-M8sv/',
    sourceUrl: 'https://lnkd.in/p/e4rHd7-X',
    summary:
      'Asier shares Kan, the workspace his returning team built for calls, conversations and collaborative planning.',
    evidence:
      'Explicit Kan, Norrsken and first place this year; last year’s result is background, not the primary assignment.',
    relatedEventSlugs: ['aisummit25'],
    avatar: '/makers/linkedin-asierzapata-5ae89d4b.jpg',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Elena LPris  🇺🇦 🇨🇦',
    authorUrl: 'https://www.linkedin.com/in/elenalpris/',
    url: 'https://www.linkedin.com/posts/elenalpris_special-thanks-to-nicolasgrenie-from-hackbarna-ugcPost-7507786122043985921-F1_G/',
    sourceUrl: 'https://lnkd.in/p/enk2kpFX',
    summary:
      'Elena thanks the HackBarna hosts and Norrsken for the hackathon experience in a separate short post.',
    evidence:
      'Explicit Norrsken and the same author’s detailed September recap; a separate source URL.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Arik Dutta',
    authorUrl: 'https://www.linkedin.com/in/arikdutta/',
    url: 'https://www.linkedin.com/posts/arikdutta_hackbarna-aisummitbcn-hackathon-ugcPost-7507784169154867202-Nlp9/',
    sourceUrl: 'https://lnkd.in/p/ecZwqS9H',
    summary:
      'Arik reflects on his first AI hackathon and building MIRA with Arnab and Igor, from a TV companion idea to a live demo.',
    evidence: 'Explicit Norrsken, MIRA and the September podium.',
    avatar: '/makers/linkedin-arikdutta-f09fe442.jpg',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'partner-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Lilibeth Bustos Linares',
    authorUrl: 'https://www.linkedin.com/in/lili-bustos/',
    url: 'https://www.linkedin.com/posts/lili-bustos_womeninclimatetech-climatetech-hackathon-ugcPost-7507761343245025281-elcV/',
    sourceUrl: 'https://lnkd.in/p/ezdGJf4B',
    summary:
      'Lilibeth reflects on returning to HackBarna as a judge after winning the previous edition and seeing more women building.',
    evidence:
      'This year’s jury includes Dani Carmona and Carmen Ansio; previous Glovo win is a related 2025 reference.',
    relatedEventSlugs: ['aisummit25'],
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Anabel Frieros',
    authorUrl: 'https://www.linkedin.com/in/anabel-frieros-658277118/',
    url: 'https://www.linkedin.com/posts/anabel-frieros-658277118_yaayyy-we-were-runner-up-for-the-galtea-share-7507761047198433280-3bhM/',
    sourceUrl: 'https://lnkd.in/p/ekSt6pah',
    summary:
      'Anabel shares Chezy, the rental-search agent her team built using AI evaluation, voice tools and Telegram.',
    evidence:
      'Chezy, named teammates and the September Galtea challenge match the archive.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'commentary-repost',
    status: 'added',
    platform: 'linkedin',
    author: 'Jiantong Wei',
    authorUrl: 'https://www.linkedin.com/in/jiantong-wei-70285b121/',
    url: 'https://www.linkedin.com/posts/jiantong-wei-70285b121_what-a-weekend-huge-thanks-to-the-organizers-ugcPost-7507755914502815747-5bBv/',
    sourceUrl: 'https://lnkd.in/p/eP4jy3bq',
    summary:
      'Jiantong thanks the hackathon team, jury and sponsors while sharing the organiser’s weekend recap.',
    evidence:
      'Own thanks reference teammates Francisco and Niko; embedded organiser text describes Norrsken and the September podium.',
    avatar: '/makers/linkedin-jiantong-wei-70285b121-efc86411.jpg',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'partner-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Titan OS',
    authorUrl: 'https://www.linkedin.com/company/titanos/',
    url: 'https://www.linkedin.com/posts/great-ideas-start-with-a-challenge-ugcPost-7507751472395141123-9Oc6/',
    sourceUrl: 'https://lnkd.in/p/eAjaKJp4',
    summary:
      'Titan OS reflects on its challenge and the creative approaches Barcelona’s builders brought to a weekend of prototyping.',
    evidence:
      'Explicit HackBarna and AI Summit partnership with the Titan OS challenge.',
    avatar: '/logos/titanos.svg',
    avatarKind: 'logo',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Colin Stark',
    authorUrl: 'https://www.linkedin.com/in/starklink/',
    url: 'https://www.linkedin.com/posts/starklink_had-a-blast-this-weekend-at-the-hackbarna-share-7507741276373405696-UxY0/',
    sourceUrl: 'https://lnkd.in/p/e-anxvt7',
    summary:
      'Colin reflects on building with Nasia and Diego and learning alongside other teams at the Summit hackathon.',
    evidence: 'Explicit HackBarna summit, Norrsken, SLNG, fal and Mastra.',
    avatar: '/makers/linkedin-starklink-a51c89d3.jpg',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'partner-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Dylan Bristot',
    authorUrl: 'https://www.linkedin.com/in/dylanbristot/',
    url: 'https://www.linkedin.com/posts/dylanbristot_the-best-benchmark-for-an-ai-platform-might-ugcPost-7507720564220968960-nOrI/',
    sourceUrl: 'https://lnkd.in/p/ek4yjmZp',
    summary:
      'Dylan shares a judge’s view of the Nebius Token Factory challenge, from model choices and latency to the variety of prototypes.',
    evidence:
      'Explicit judging at Norrsken and the September Nebius challenge.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Michella Warren',
    authorUrl: 'https://www.linkedin.com/in/michellavwarren/',
    url: 'https://www.linkedin.com/posts/michellavwarren_hack-completed-sleep-count-56-hours-product-share-7507711798460973056-9-7T/',
    sourceUrl: 'https://lnkd.in/p/evhfaaCX',
    summary:
      'Michella shares Respons·Ara, her team’s prototype for understanding wildfire risks and coordinating evacuation communication.',
    evidence:
      'Explicit Norrsken/Deepfire wildfire challenge and September teammates.',
    avatar: '/testimonials/avatars/michella-warren.jpg',
    position: 'Product, Data & Research',
    positionSourceUrl: 'https://www.linkedin.com/in/michellavwarren/',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Tiam Haghshenas',
    authorUrl: 'https://www.linkedin.com/in/tiam-haghshenas-58a9063b7/',
    url: 'https://www.linkedin.com/posts/tiam-haghshenas-58a9063b7_just-wrapped-my-first-hackathon-at-hackbarna-share-7507692007566389248-zrx3/',
    sourceUrl: 'https://lnkd.in/p/eh79FSVw',
    summary:
      'Tiam reflects on his first hackathon with Varun, learning from other teams and building under a shared deadline.',
    evidence: 'Explicit Norrsken and the corroborating Varun recap.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'partner-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Alper Bahçekapılı',
    authorUrl: 'https://www.linkedin.com/in/alper-bahcekapili/',
    url: 'https://www.linkedin.com/posts/alper-bahcekapili_barcelona-was-full-of-great-builders-huge-ugcPost-7507679603419811840-W3-Z/',
    sourceUrl: 'https://lnkd.in/p/etcHPCwD',
    summary:
      'Alper thanks HackBarna’s builders for experimenting with fal’s generative models during the weekend.',
    evidence:
      'fal challenge, Barcelona and the September sponsor lineup; corroborated by other fal team entries.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Nil Macià',
    authorUrl: 'https://www.linkedin.com/in/nil-macia/',
    url: 'https://www.linkedin.com/posts/nil-macia_ive-just-spent-27h-hacking-hackbarna-share-7507566082317123584-Hmc4/',
    sourceUrl: 'https://lnkd.in/p/eDsEp3FX',
    summary:
      'Nil reflects on a first hackathon, building wildfire decision-support tools with Peter and Simon and discovering Barcelona’s tech community.',
    evidence:
      'Explicit HackBarna AI Summit 2026 and the archived wildfire team.',
    avatar: '/makers/linkedin-nil-macia-3d066102.jpg',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Varun-Aditya Agarwal',
    authorUrl: 'https://www.linkedin.com/in/thevarunaditya/',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7507557864077664257/',
    summary:
      'Varun reflects on his first hackathon, building with Tiam and meeting developers, designers and founders at Norrsken.',
    evidence: 'Explicit Norrsken and teammate Tiam’s matching recap.',
    avatar: '/makers/linkedin-thevarunaditya-35e133ce.jpg',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Hussein AL Khafaji',
    authorUrl: 'https://www.linkedin.com/in/husdev/',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7507552498497380352/',
    summary:
      'Hussein shares LinguaTrace, a notebook assistant for language lessons built with Jev and Vonage using Preply as its use case.',
    evidence:
      'LinguaTrace and top-ten result match the September archive; Jev usage alone does not make this a Jev-a-thon post.',
    avatar: '/makers/linkedin-husdev-2310a6f1.jpg',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'partner-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Carlos Agudo',
    authorUrl: 'https://www.linkedin.com/in/carlos-agudo/',
    url: 'https://es.linkedin.com/posts/carlos-agudo-91a7a6269_aisummit-barcelona-hackathon-activity-7507710482087112704-kNRG',
    summary:
      'Carlos shares a volunteer’s perspective on the AI Summit hackathon and thanks the organisers, participants and fellow volunteers.',
    evidence:
      'Explicit AI Summit hackathon, Mariana Noriega and HackBarna organising team.',
  },
  {
    eventSlug: 'aisummit25',
    kind: 'project-update',
    status: 'added',
    platform: 'linkedin',
    author: 'Pieter van de Zande',
    authorUrl: 'https://www.linkedin.com/in/pietervandezande/',
    url: 'https://www.linkedin.com/posts/pietervandezande_what-started-as-3-strangers-meeting-and-winning-share-7424736154798759936-iUOn/',
    sourceUrl: 'https://lnkd.in/p/eceNW_ua',
    summary:
      'Pieter shares how meeting Lilibeth and Guillermo at the Glovo hackathon led to Concept3 and continued work on SOMA AI.',
    evidence:
      'Explicit Glovo venue and the winning 2025 team; later publication does not make this a 2026 event post.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'announcement',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Guillaume Rostand',
    authorUrl: 'https://www.linkedin.com/in/rostand/',
    url: 'https://www.linkedin.com/posts/rostand_ai-summit-barcelona-opens-in-one-week-barcelona-share-7504979369895845888-yR2W/',
    sourceUrl: 'https://lnkd.in/p/ev-Arbut',
    summary:
      'Guillaume includes the September 19–20 HackBarna weekend at Norrsken in an AI Week programme.',
    evidence:
      'Explicit September 19–20 and Norrsken; a separate Glovo meetup in the roundup is not the hackathon.',
  },
  {
    eventSlug: 'aisummit25',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Toni Ortiz Gil',
    authorUrl: 'https://www.linkedin.com/in/toni-ortiz-gil/',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7383568428957126656/',
    summary:
      'Toni reflects on his first hackathon at Glovo, from teamwork and new ideas to conversations about the future of AI.',
    evidence:
      'Explicit HackBarna AI Summit 2025 hosted by Glovo; original author verified on the post.',
  },
  {
    eventSlug: 'hacknight-june-2026',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Hassan Nurudeen',
    authorUrl: 'https://www.linkedin.com/in/hassannurudeen/',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7479908061143420928/',
    summary:
      'Hassan shares the Salon Acquisition Fit Analyzer he built at the Netlify hack night, turning a business question into a working prototype.',
    evidence:
      'Explicit HackBarna × Netlify at Itnig and the imported June project; hashtag is misspelled Hackabarna.',
  },
  {
    eventSlug: 'skillathon-hacknight-2026',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Mariana Noriega',
    authorUrl: 'https://www.linkedin.com/in/mariananoriegab',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7440484943685869568/',
    summary:
      'Mariana reflects on Skill-a-thon, experimenting with Claude and community automation workflows while reconnecting with other builders.',
    evidence:
      'Explicit Skill a Thon Night; original post recovered from Anisa’s commentary repost.',
  },
  {
    eventSlug: 'hacknight-june-2026',
    kind: 'organizer-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Matt Roberts',
    authorUrl: 'https://www.linkedin.com/in/mattjroberts/',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7477831390110343169/',
    summary:
      'Matt recaps the Netlify build night at Itnig, where builders tried new AI tools and demoed their projects.',
    evidence:
      'Original post recovered from Karthik’s repost; explicit Netlify workshop, open build session and Itnig demos.',
    avatar: '/testimonials/avatars/matt-roberts.jpg',
  },
  {
    eventSlug: 'hacknight-june-2026',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Daniela Trifu',
    authorUrl: 'https://www.linkedin.com/in/daniela-trifu/',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7478114249131790336/',
    summary:
      'Daniela reflects on building, pitching and connecting with other makers at HackNight #4 with Netlify.',
    evidence:
      'Explicit Hack Night #4: Build with Netlify, HackBarna, Happy Operators and Itnig.',
    avatar: '/makers/linkedin-daniela-trifu-3ddfb7c8.jpg',
  },
  {
    eventSlug: 'hacknight-june-2026',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Robert McWhirter',
    authorUrl: 'https://www.linkedin.com/in/robertmcwhirter/',
    url: 'https://www.linkedin.com/posts/robertmcwhirter_i-built-a-kitesurf-forecast-app-in-90-minutes-activity-7480921096834326528-JuTh',
    summary:
      'Robert shares Bufa, the kitesurf forecast app he built in 90 minutes at the Netlify hack night.',
    evidence:
      'Explicit HackBarna/Netlify build and Bufa project, present in the June archive.',
  },
  {
    eventSlug: 'hacknight-june-2026',
    kind: 'commentary-repost',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Karthik Puvvada',
    authorUrl: 'https://www.linkedin.com/in/karthikpuvvada/',
    url: 'https://www.linkedin.com/posts/karthikpuvvada_netlify-was-in-barcelona-check-out-the-activity-7477917378039963648-aO50',
    summary:
      'Karthik shares Matt’s recap of the Netlify build night in Barcelona.',
    evidence:
      'The original Matt recap is shown on the event page; this brief redistribution is retained in the audit.',
    originalPostUrl:
      'https://www.linkedin.com/feed/update/urn:li:activity:7477831390110343169/',
  },
  {
    eventSlug: 'vibecode-hacknight-2026',
    kind: 'organizer-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Matt Roberts',
    authorUrl: 'https://www.linkedin.com/in/mattjroberts/',
    url: 'https://www.linkedin.com/posts/mattjroberts_what-happens-when-you-put-30-builders-in-activity-7428000135038660608-A4P9',
    summary:
      'Matt reflects on the Vibecode Hack Night, bringing builders together to prototype with Brandfetch and Lovable.',
    evidence:
      'Explicit Vibecode HackNight, Brandfetch, Lovable and Nicolas Grenié.',
    avatar: '/testimonials/avatars/matt-roberts.jpg',
  },
  {
    eventSlug: 'vibecode-hacknight-2026',
    kind: 'organizer-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Nicolas Grenié',
    authorUrl: 'https://www.linkedin.com/in/nicolasgrenie/',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7429080665452736512/',
    summary:
      'Nicolas shares lessons from the first Vibecode Hack Night and highlights projects built with Brandfetch and Lovable.',
    evidence:
      'Explicit first Vibecode Night, Jeremy Jaques, Brandfetch and Lovable; project examples include HotelAds and FoundedWeb.',
    avatar: '/mentors/nico.jpeg',
  },
  {
    eventSlug: 'skillathon-hacknight-2026',
    kind: 'commentary-repost',
    status: 'added',
    platform: 'linkedin',
    author: 'Anisa Frasheri',
    authorUrl: 'https://www.linkedin.com/in/anisa-frasheri/',
    url: 'https://www.linkedin.com/posts/anisa-frasheri_always-nice-to-be-surrounded-by-such-great-activity-7440677723141754881-4SvS',
    summary:
      'Anisa celebrates the people and energy at Skill-a-thon while sharing Mariana’s reflection on the evening.',
    evidence:
      'Own short commentary is kept separate from Mariana’s embedded text.',
    originalPostUrl:
      'https://www.linkedin.com/feed/update/urn:li:activity:7440484943685869568/',
    avatar: '/testimonials/avatars/anisa-frasheri.jpg',
    position: 'Founder, Rekly',
  },
  {
    eventSlug: 'skillathon-hacknight-2026',
    kind: 'announcement',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Graciela García Quintero',
    authorUrl: 'https://www.linkedin.com/in/gracielagq/',
    url: 'https://es.linkedin.com/posts/gracielagq_muy-buena-iniciativa-creo-que-puede-ser-activity-7438270924933607424-SjI1',
    summary:
      'Graciela shares Nicolas’s invitation to Skill-a-thon and welcomes the initiative.',
    evidence: 'The embedded invitation is for the March Skill-a-thon.',
  },
  {
    eventSlug: 'hacknight-3-linkup-2026',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Guido Vezzoni',
    authorUrl: 'https://www.linkedin.com/in/guidovezzoni/',
    url: 'https://www.linkedin.com/posts/guidovezzoni_great-hackathon-yesterday-at-hackbarna-its-activity-7455621660663042048-WNqG',
    summary:
      'Guido shares a job-search prototype for matching a CV to roles, drafting cover letters and practising interview introductions.',
    evidence:
      'Explicit Linkup, Lovable and Itnig; the April Linkup hack night, not the June Netlify event.',
    avatar: '/testimonials/avatars/guido-vezzoni.jpg',
    position: 'Senior Android Engineer',
  },
  {
    eventSlug: 'hacknight-3-linkup-2026',
    kind: 'announcement',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Nicolas Grenié',
    authorUrl: 'https://www.linkedin.com/in/nicolasgrenie/',
    url: 'https://www.linkedin.com/posts/nicolasgrenie_if-you-are-in-barcelona-join-us-on-april-activity-7451912498997448704-GNe9',
    summary: 'Nicolas invites builders to the April 29 HackNight with Linkup.',
    evidence: 'Explicit April 29, Itnig and Linkup API.',
  },
  {
    eventSlug: 'hacknight-june-2026',
    kind: 'announcement',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Nicolas Grenié',
    authorUrl: 'https://www.linkedin.com/in/nicolasgrenie/',
    url: 'https://www.linkedin.com/posts/nicolasgrenie_one-of-the-reasons-i-started-hackbarna-was-activity-7472582806771150849-2MjD',
    summary:
      'Nicolas announces the Netlify build night before the summer break.',
    evidence:
      'Explicit Netlify workshop, open hacking and credits; distinct from October’s fireside meetup.',
  },
  {
    eventSlug: 'aisummit25',
    kind: 'announcement',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Hackathon.com',
    url: 'https://www.linkedin.com/posts/activity-7381348231110287360-bZJr',
    summary: 'Hackathon.com announces the second HackBarna edition at Glovo.',
    evidence: 'Explicit October 11–12, 2025 and Glovo HQ.',
  },
  {
    eventSlug: 'aisummit25',
    kind: 'announcement',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Christophe Hoarau',
    url: 'https://fr.linkedin.com/posts/christophe-hoarau-2bb8b8ab_hackathon-ai-summit-barcelona-les-11-activity-7379442519505436672-di4o',
    summary:
      'Christophe shares an invitation to the AI Summit hackathon at Glovo.',
    evidence: 'Explicit October 11–12 and Glovo, matching the second edition.',
  },
  {
    eventSlug: 'aisummit25',
    kind: 'press-announcement',
    status: 'audit-only',
    platform: 'press',
    author: 'InfoNegocios Barcelona',
    url: 'https://infonegocios.barcelona/plus/hackbarna-celebra-su-segunda-edicion-y-consolida-a-barcelona-como-epicentro-de-la-innovacion-en-inteligencia-artificial',
    summary:
      'InfoNegocios previews the second HackBarna edition and its programme at Glovo.',
    evidence:
      'Article dated October 9, 2025; explicit October 11–12 at Glovo HQ.',
  },
  {
    eventSlug: 'aisummit26',
    kind: 'press-announcement',
    status: 'audit-only',
    platform: 'press',
    author: 'eventoplus',
    url: 'https://www.eventoplus.com/en/articles/hackbarna-turns-a-weekend-into-an-artificial-intelligence-lab/',
    summary:
      'eventoplus previews the Norrsken hackathon and traces the community’s earlier editions and hack nights.',
    evidence:
      'Article dated August 25, 2026; explicit September 19–20 at Norrsken.',
    relatedEventSlugs: [
      'v1-2024',
      'aisummit25',
      'vibecode-hacknight-2026',
      'skillathon-hacknight-2026',
      'hacknight-3-linkup-2026',
      'hacknight-june-2026',
    ],
  },
  {
    eventSlug: 'skillathon-hacknight-2026',
    kind: 'project-reference',
    status: 'audit-only',
    platform: 'web',
    author: 'Paradigm',
    url: 'https://github.com/useparadigm/skill_a_thon',
    summary:
      'A public skill-a-thon project repository credits HackBarna’s March event.',
    evidence:
      'README explicitly names Skill-a-thon HackNight, Barcelona and March 19, 2026.',
  },
  {
    eventSlug: 'hacknight-edreams-2024',
    kind: 'event-listing',
    status: 'audit-only',
    platform: 'web',
    author: 'HackBarna',
    url: 'https://luma.com/6xew9jdf',
    summary:
      'The official listing documents Hack Night at eDreams ODIGEO, with talks, hacking and demos.',
    evidence:
      'Official organiser and venue match the September 2024 archive. This is not a participant recap.',
  },
  {
    eventSlug: 'v1-2024',
    kind: 'profile-reference',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Julia Gaitan',
    authorUrl: 'https://www.linkedin.com/in/julia-gavi/',
    url: 'https://es.linkedin.com/in/julia-gavi',
    summary:
      'Julia’s public project history lists Flightmate from the first HackBCN edition.',
    evidence:
      'Project description explicitly gives June 29–30, 2024. Profile history is retained as a reference, not a standalone post.',
  },
  {
    eventSlug: 'v1-2024',
    kind: 'profile-reference',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Jordi Ren',
    authorUrl: 'https://www.linkedin.com/in/jordi-ren-148387242/',
    url: 'https://es.linkedin.com/in/jordi-ren-148387242',
    summary:
      'Jordi’s public project history lists Flightmate from the first HackBCN edition.',
    evidence:
      'Project description explicitly gives June 29–30, 2024. Not a standalone post.',
  },
  {
    eventSlug: 'aisummit25',
    kind: 'commentary-repost',
    status: 'added',
    platform: 'linkedin',
    author: 'Asier Zapata Fernández',
    authorUrl: 'https://www.linkedin.com/in/asierzapata/',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7383395659376144384/',
    summary:
      'Asier reflects on his team’s live agent demo at Glovo and the experience of building together with Linkup and SLNG.',
    evidence:
      'Explicit Glovo, the 2025 team and its geospatial agent; distinct from his 2026 Kan recap.',
    originalPostUrl:
      'https://www.linkedin.com/feed/update/urn:li:share:7383236304081321985/',
    avatar: '/makers/linkedin-asierzapata-5ae89d4b.jpg',
  },
  {
    eventSlug: 'aisummit25',
    kind: 'participant-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Enric Moreu',
    authorUrl: 'https://www.linkedin.com/in/enricmf/',
    url: 'https://www.linkedin.com/feed/update/urn:li:share:7383236304081321985/',
    summary:
      'Enric shares his team’s AI and mapping project, celebrating the teamwork and support behind their second-place result at Glovo.',
    evidence:
      'Explicit Glovo, Asier, Juan José, Linkup and SLNG identify the 2025 Marco Polo team.',
    avatar: '/makers/linkedin-enricmf-e0058ca2.jpg',
  },
  {
    eventSlug: 'aisummit25',
    kind: 'commentary-repost',
    status: 'added',
    platform: 'linkedin',
    author: 'Dwane Hemmings',
    authorUrl: 'https://www.linkedin.com/in/dwane-hemmings/',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7383547257545048064/',
    summary:
      'Dwane celebrates meeting Irina at HackBarna and the energy FemCoders brought to Barcelona’s builder community.',
    evidence:
      'Own commentary shares Irina’s mentor recap, which explicitly names Glovo and the 2025 sponsors.',
    originalPostUrl:
      'https://www.linkedin.com/feed/update/urn:li:activity:7383516968395472896/',
  },
  {
    eventSlug: 'aisummit25',
    kind: 'partner-recap',
    status: 'added',
    platform: 'linkedin',
    author: 'Irina Ichim',
    authorUrl: 'https://www.linkedin.com/in/irina-ichim-desarrolladora/',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7383516968395472896/',
    summary:
      'Irina reflects on mentoring at the Glovo hackathon with FemCoders Club and the supportive atmosphere among teams and sponsors.',
    evidence:
      'Explicit Glovo, Lingo.dev, Amazon Developer and the 2025 AI Summit edition.',
    avatar: '/testimonials/avatars/irina-ichim.jpg',
    position: 'Software Engineer & HackBarna Mentor',
  },
  {
    eventSlug: 'aisummit25',
    kind: 'press-recap',
    status: 'added',
    platform: 'press',
    author: 'Universitat Pompeu Fabra',
    url: 'https://www.upf.edu/web/emai/news/-/asset_publisher/2BG58e3qObnh/content/emai-students-participate-in-the-hackbarna-hackathon-2025/maximized',
    summary:
      'UPF celebrates the Echoes team, whose app brings artworks to life through spoken stories, and their hackathon challenge results.',
    evidence:
      'Official university article dated October 21, 2025 explicitly identifies the October 11–12 event and Janne, Alessandro and Marcelo.',
  },
  {
    eventSlug: 'aisummit25',
    kind: 'profile-reference',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Marc Bisbal Arias',
    authorUrl: 'https://www.linkedin.com/in/bamarc/',
    url: 'https://ch.linkedin.com/in/janne-rotter',
    summary:
      'Janne’s publicly indexed activity history includes Marc’s recap of representing Lingo.dev and celebrating the Echoes team.',
    evidence:
      'The indexed entry names Alessandro, Janne and Marcelo and the Lingo.dev challenge. Original post permalink remains unresolved; current signed-in profile views did not return it.',
  },
  {
    eventSlug: 'aisummit25',
    kind: 'profile-reference',
    status: 'audit-only',
    platform: 'linkedin',
    author: 'Little Birds',
    authorUrl: 'https://www.linkedin.com/company/littlebirds-ai/',
    url: 'https://es.linkedin.com/company/littlebirds-ai',
    summary:
      'The company’s indexed history includes its Glovo recap, Summit launch and a speaker’s follow-up using the app.',
    evidence:
      'Publicly indexed updates explicitly name Glovo, Evolv, Marco Polo and the 2025 jury. Individual permalinks remain unresolved: the signed-in company Posts view currently returns no posts.',
  },
]

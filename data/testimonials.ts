// Curated public posts. Add a source URL and the matching event slug for each
// entry; a short excerpt is enough when there is no local screenshot. The same
// list powers the archive and each event's testimonials section.
export type Testimonial = {
  eventSlug: (typeof testimonialEvents)[number]['slug']
  platform: 'linkedin' | 'x' | 'press'
  url: string
  author: string
  position?: string
  avatar?: string
  avatarKind?: 'person' | 'logo'
  excerpt?: string
  image?: string
  featuredOnHome?: boolean
}

export const testimonialEvents = [
  { slug: 'netlify-barcelona-2026', name: 'Netlify @ Barcelona', date: 'October 2026' },
  { slug: 'aisummit26', name: 'HackBarna × AI Summit 2026', date: 'September 2026' },
  { slug: 'hacknight-june-2026', name: 'HackNight #4: Build with Netlify', date: 'June 2026' },
  { slug: 'aisummit25', name: 'HackBarna × AI Summit 2025', date: 'October 2025' },
  { slug: 'v1-2024', name: 'HackBarna v1', date: 'June 2024' },
] as const

export const testimonials: Testimonial[] = [
  {
    eventSlug: 'netlify-barcelona-2026',
    platform: 'linkedin',
    author: 'Matt Roberts',
    position: 'Co-Founder, Happy Operators',
    avatar: '/testimonials/avatars/matt-roberts.jpg',
    featuredOnHome: true,
    excerpt: 'Netlify’s CTO and CPO spent Wednesday night with Barcelona’s AI builders. It was a blast.',
    url: 'https://www.linkedin.com/feed/update/urn:li:ugcPost:7513907220582162432/',
  },
  {
    eventSlug: 'aisummit26',
    platform: 'linkedin',
    author: 'Anisa Frasheri',
    position: 'Founder, Rekly',
    avatar: '/testimonials/avatars/anisa-frasheri.jpg',
    featuredOnHome: true,
    excerpt: 'I had been waiting a long time for this weekend, and the experience was even better than I expected.',
    url: 'https://www.linkedin.com/posts/anisa-frasheri_hackbarna-aisummitbarcelona-aisb26-activity-7508084190093975552-DEiX',
  },
  {
    eventSlug: 'aisummit26',
    platform: 'linkedin',
    author: 'Miguel Sureda',
    position: 'Founder, anlak',
    avatar: '/testimonials/avatars/miguel-sureda.jpg',
    excerpt: 'I was impressed by the talent, creative ideas, and people willing to spend a weekend building together.',
    url: 'https://es.linkedin.com/posts/miguelsureda_este-finde-hackathon-en-hackbarna-como-warm-up-activity-7507681637732757505-Z7xp',
  },
  {
    eventSlug: 'hacknight-june-2026',
    platform: 'linkedin',
    author: 'Netlify',
    position: 'Build with Netlify event partner',
    avatar: '/logos/netlify.svg',
    avatarKind: 'logo',
    excerpt: 'Builders filled the room, deployed live sites, and spent open hack time bringing their ideas to life.',
    url: 'https://www.linkedin.com/posts/netlify_we-built-and-shipped-at-build-with-netlify-activity-7478484962858426368-zHSN',
  },
  {
    eventSlug: 'aisummit25',
    platform: 'linkedin',
    author: 'Lilibeth Bustos Linares',
    position: 'CEO & Co-Founder, SOMA AI',
    avatar: '/judges/lilibethbustos.jpeg',
    featuredOnHome: true,
    excerpt: 'I had never joined a hackathon before. This time I decided to go all in and build something meaningful.',
    url: 'https://www.linkedin.com/pulse/how-weekend-hackathon-changed-everything-story-behind-bustos-linares-vftme',
  },
  // The first edition's posts were originally collected as screenshots.
  // Keep those images and their source links so the archive remains intact.
  { eventSlug: 'v1-2024', platform: 'linkedin', author: 'Alberto Labarga', image: '/testimonials/alberto_linkedin.png', url: 'https://www.linkedin.com/posts/albertolabarga_ai-hackathon-barcelona-activity-7213455842057023488-csBw' },
  { eventSlug: 'v1-2024', platform: 'linkedin', author: 'Alex Palazon', image: '/testimonials/alex_linkedin.png', url: 'https://www.linkedin.com/posts/alexpalazon_we-spent-this-weekend-at-hackbcn24-and-built-activity-7213876927835566080-7I7z' },
  { eventSlug: 'v1-2024', platform: 'linkedin', author: 'Arnau', image: '/testimonials/arnau_linkedin.png', url: 'https://www.linkedin.com/posts/arnau-soler-recasens_hackbcn-ai-artificialintelligence-activity-7213489033279119361-mlRe' },
  { eventSlug: 'v1-2024', platform: 'linkedin', author: 'Eyuel', image: '/testimonials/eyuel_linkedin.png', url: 'https://www.linkedin.com/posts/eyuel-muse-woldesembet_big-thank-you-to-everyone-involved-in-the-activity-7213407210981208065-NIkJ' },
  { eventSlug: 'v1-2024', platform: 'linkedin', author: 'Gabriele', image: '/testimonials/gabriele_linkedin.png', url: 'https://www.linkedin.com/posts/gabriele-raffaelli-67779576_hackbcn-ai-hackathon-activity-7207761310208389120-IYMv' },
  { eventSlug: 'v1-2024', platform: 'linkedin', author: 'Jessica', image: '/testimonials/jessica_linkedin.png', url: 'https://www.linkedin.com/posts/jessica-arroyo-lebr%C3%B3n_hackbcn-hackathon-lewagon-activity-7213265618735681536-sIDu' },
  { eventSlug: 'v1-2024', platform: 'linkedin', author: 'Joan', image: '/testimonials/joan_linkedin.png', url: 'https://www.linkedin.com/posts/joanbr4_despu%C3%A9s-de-la-gran-experiencia-creo-que-activity-7210744680899108865-ijW3' },
  { eventSlug: 'v1-2024', platform: 'linkedin', author: 'Kristian', image: '/testimonials/kristian_linkedin.png', url: 'https://www.linkedin.com/posts/kristian-gosvig_techlife-impostersyndrome-techconfidence-activity-7213604247806877696-1K_r' },
  { eventSlug: 'v1-2024', platform: 'linkedin', author: 'Le Wagon Spain', image: '/testimonials/lewagon_linkeidn.png', url: 'https://www.linkedin.com/posts/le-wagon-spain_hackbcn-lewagonspain-hackathon-activity-7213830417311830016-wb8y' },
  { eventSlug: 'v1-2024', platform: 'linkedin', author: 'Luken', image: '/testimonials/luken_linkedin.png', url: 'https://www.linkedin.com/posts/lukeniquintana_el-fin-de-semana-tuve-la-maravillosa-oportunidad-activity-7214212504313352194--RJW' },
  { eventSlug: 'v1-2024', platform: 'linkedin', author: 'Matias', image: '/testimonials/matias_linkedin.png', url: 'https://www.linkedin.com/posts/matiassebastianmartinez_during-the-last-weekend-i-participated-in-activity-7213465366092517376-cXw5' },
  { eventSlug: 'v1-2024', platform: 'linkedin', author: 'Pau', image: '/testimonials/pau_linkedin.png', url: 'https://www.linkedin.com/posts/paugarcia32_este-fin-de-semana-he-estado-junto-a-jose-activity-7213496788249436161-_3Sc' },
  { eventSlug: 'v1-2024', platform: 'linkedin', author: 'Pavel', image: '/testimonials/pavel_linkeidn.png', url: 'https://www.linkedin.com/posts/akpratyush_ai-genai-ai-activity-7213620069900177409-G4h_' },
  { eventSlug: 'v1-2024', platform: 'linkedin', author: 'Rebeca', image: '/testimonials/rebeca_linkedin.png', url: 'https://www.linkedin.com/posts/rebeca-garcia-58149061_ya-descansada-puedo-contarles-un-poco-de-activity-7213663887844376577-oXt2' },
  { eventSlug: 'v1-2024', platform: 'linkedin', author: 'Romina', image: '/testimonials/romina_linkedin.png', url: 'https://www.linkedin.com/posts/mendezromina_ai-hackathon-barcelona-activity-7213464034547830785-Vxa5' },
  { eventSlug: 'v1-2024', platform: 'linkedin', author: 'Stefania', image: '/testimonials/stefania_linkedin.png', url: 'https://www.linkedin.com/posts/stefania-georgescu-x_ai-activity-7213095112170434561-_3Rd' },
  { eventSlug: 'v1-2024', platform: 'linkedin', author: 'Tanya', image: '/testimonials/tanya_linkedin.png', url: 'https://www.linkedin.com/posts/tanyavangastel_barcelonas-first-ai-hackathon-is-this-week-activity-7212055785965514752-eowb' },
  { eventSlug: 'v1-2024', platform: 'linkedin', author: 'The Tech Nation', image: '/testimonials/thetechnation_linkedin.png', url: 'https://www.linkedin.com/posts/the-technation_today-was-a-bit-of-a-milestone-for-the-tech-activity-7213289596493656064-tPRp' },
  { eventSlug: 'v1-2024', platform: 'linkedin', author: 'Valentina', image: '/testimonials/valentina_linkedin.png', url: 'https://www.linkedin.com/posts/valentinatoni_hackathon-airquality-techforgood-activity-7213585380573376514-2Z8D' },
  { eventSlug: 'v1-2024', platform: 'linkedin', author: 'Vero', image: '/testimonials/vero_linkedin.png', url: 'https://www.linkedin.com/posts/veroagnolutto_ai-hackathon-barcelona-activity-7213530083985166336-pFyj' },
  { eventSlug: 'v1-2024', platform: 'press', author: 'Parentesis', image: '/testimonials/parentesis_press.png', url: 'https://www.parentesis.media/programar-una-ia-en-24-horas-asi-sera-el-hackaton-de-barcelona/' },
]

export function getTestimonialsForEvent(eventSlug: string) {
  return testimonials.filter((post) => post.eventSlug === eventSlug)
}

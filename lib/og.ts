export type OgImageParams = {
  title: string
  eyebrow?: string
  date?: string
  location?: string
  image?: string
  footer?: string
}

export function buildOgImagePath(params: OgImageParams) {
  const search = new URLSearchParams()
  search.set('title', params.title)
  if (params.eyebrow) search.set('eyebrow', params.eyebrow)
  if (params.date) search.set('date', params.date)
  if (params.location) search.set('location', params.location)
  if (params.image) search.set('image', params.image)
  if (params.footer) search.set('footer', params.footer)
  return `/api/og?${search.toString()}`
}

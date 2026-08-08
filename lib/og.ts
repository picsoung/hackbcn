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

export function formatOgDate(startDate: string, endDate?: string) {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : start
  const month = new Intl.DateTimeFormat('en', {
    month: 'short',
    timeZone: 'UTC',
  })
  const sameDay = start.toISOString().slice(0, 10) === end.toISOString().slice(0, 10)
  const sameMonth = start.getUTCMonth() === end.getUTCMonth()
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear()

  if (sameDay) {
    return `${month.format(start)} ${start.getUTCDate()}, ${start.getUTCFullYear()}`
  }
  if (sameMonth && sameYear) {
    return `${month.format(start)} ${start.getUTCDate()}–${end.getUTCDate()}, ${end.getUTCFullYear()}`
  }
  if (sameYear) {
    return `${month.format(start)} ${start.getUTCDate()} – ${month.format(end)} ${end.getUTCDate()}, ${end.getUTCFullYear()}`
  }
  return `${month.format(start)} ${start.getUTCDate()}, ${start.getUTCFullYear()} – ${month.format(end)} ${end.getUTCDate()}, ${end.getUTCFullYear()}`
}

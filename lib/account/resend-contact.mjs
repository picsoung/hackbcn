/** Update one verified account's contact metadata. Never subscribe or send mail. */
export async function syncResendCommunicationLanguage(
  { email, language, apiKey },
  send = fetch,
) {
  if (
    typeof email !== 'string' ||
    email.length > 320 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    ![null, 'en', 'es', 'ca'].includes(language) ||
    !apiKey
  )
    throw Error('Invalid contact sync')
  const properties = { communication_language: language ?? 'all' }
  const request = (path, method, body) =>
    send('https://api.resend.com' + path, {
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      redirect: 'error',
      signal: AbortSignal.timeout(3000),
    })
  const path = '/contacts/' + encodeURIComponent(email.trim().toLowerCase())
  let response = await request(path, 'PATCH', { properties })
  if (response.status === 404) {
    response = await request('/contacts', 'POST', {
      email: email.trim().toLowerCase(),
      properties,
      unsubscribed: true,
    })
    if (response.status === 409)
      response = await request(path, 'PATCH', { properties })
  }
  if (!response.ok) {
    const error = new Error(`contact_http_${response.status}`)
    error.retryAfter = Number(response.headers.get('retry-after')) || 0
    throw error
  }
}

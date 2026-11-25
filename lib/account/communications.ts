export type CommunicationLanguage = 'en' | 'es' | 'ca' | null
export type CommunicationPreferences = {
  communicationLanguage: CommunicationLanguage
  revision: number
  contactSync: 'synced' | 'pending' | 'not_configured'
}

export function validateCommunicationPreference(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw Error('invalid')
  const value = input as Record<string, unknown>
  if (
    Object.keys(value).some(
      (key) => !['communicationLanguage', 'revision'].includes(key),
    ) ||
    ![null, 'en', 'es', 'ca'].includes(
      value.communicationLanguage as string | null,
    ) ||
    !Number.isSafeInteger(value.revision) ||
    (value.revision as number) < 0
  )
    throw Error('invalid')
  return {
    communicationLanguage: value.communicationLanguage as CommunicationLanguage,
    revision: value.revision as number,
  }
}

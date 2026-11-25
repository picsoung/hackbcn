import Link from 'next/link'
import { projectManagementCopy } from '@/data/project-management'

export default function ProjectOwnershipLink({ locale }: { locale: string }) {
  return (
    <Link
      href={`/${locale}/account/projects`}
      className="mb-8 inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-4"
    >
      {projectManagementCopy(locale).title}
    </Link>
  )
}

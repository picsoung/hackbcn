import ProjectPageShell from '@/app/components/projects/ProjectPageShell'

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProjectPageShell>{children}</ProjectPageShell>
}

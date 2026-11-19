import ProjectPageShell from '@/app/components/projects/ProjectPageShell'

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProjectPageShell>{children}</ProjectPageShell>
}

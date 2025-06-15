import { ProjectClient } from "./components/project-client"

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params

  return <ProjectClient id={id} />
}

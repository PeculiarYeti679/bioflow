// app/projects/page.tsx
import { getAllProjects } from "@/features/projects/fetchProjectList";
import { ProjectCard } from "@/components/ProjectCard";


export default async function ProjectsIndexPage() {
  const projects = await getAllProjects(); 
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Explore My Research Projects
        </h1>
        <p className="text-muted-foreground text-lg">
          Each project explores a different biological or computational
          question. Learn about my process, methodology, and findings.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center max-w-5xl mx-auto">
        {projects.map((project) => (
          <ProjectCard
            key={project.slug}
            slug={project.slug}
            title={project.title}
            description={project.description ? project.description : "No description available."}
          />
        ))}
        {projects.length === 1 && (
          <div
            key="project-placeholder"
            className="sm:col-span-2 lg:col-span-1 border-dashed border-2 border-muted p-6 rounded-lg text-center text-muted-foreground"
          >
            More projects coming soon...
          </div>
        )}
      </div>
    </main>
  );
}

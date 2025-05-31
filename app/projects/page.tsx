// app/projects/page.tsx
import { PROJECT_LIST } from "@/lib/projects";
import { ProjectCard } from "@/components/ProjectCard";

export default function ProjectsIndexPage() {
  
    return (
     <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Explore My Research Projects</h1>
        <p className="text-muted-foreground text-lg">
          Each project explores a different biological or computational question. Learn about my process, methodology, and findings.
        </p>
      </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center max-w-5xl mx-auto">
        {PROJECT_LIST.map((project) => (
         <ProjectCard key={project.slug} slug={project.slug} title={project.title} description={project.description}/>
        ))}
         {PROJECT_LIST.length === 1 && (
          <div
          key="project-placeholder" 
          className="sm:col-span-2 lg:col-span-1 border-dashed border-2 border-muted p-6 rounded-lg text-center text-muted-foreground">
            More projects coming soon...
          </div>
        )}
      </div>
    </main>
  );
}

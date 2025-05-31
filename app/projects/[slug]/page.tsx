import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/projects";
import Link from "next/link";

interface Props {
  params: { slug: string };
}

// By default, this is a Server Component. You can `await` data-fetching calls here.
export default async function ProjectOverviewPage({ params }: Props) {
  const { slug } = params;
  const project = getProjectBySlug(slug);

  if (!project) {
    // If someone browses to /projects/this-slug-does-not-exist, return a 404.
    return notFound();
  }

  return (
    <article className="prose max-w-3xl mx-auto py-12">
      {/* 1. Title */}
      <h1 className="text-4xl font-bold">{project.title}</h1>

      {/* 2. Short description or abstract */}
      <p className="mt-4 text-lg">{project.description}</p>

      {/* 3. (Optional) Featured image */}
      {/* 
      {project.imageUrl && (
        <img 
          src={project.imageUrl} 
          alt={`Screenshot or diagram for ${project.title}`}
          className="mt-6 rounded-lg shadow-md"
        />
      )} 
      */}

      {/* 4. Quick navigation links (calls-to-action) */}
      <nav className="mt-8 border-t pt-6 flex flex-wrap gap-4">
        <Link
          href={`/projects/${slug}/methodology`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Methodology
        </Link>
        <Link
          href={`/projects/${slug}/data-analysis`}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Go to Data Analysis
        </Link>
        {/* Add more if you like */}
      </nav>

      {/* 5. (Optional) Any custom landing content you want—graphs, charts, embedded videos, etc. */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Introduction</h2>
        <p className="mt-2">
          Peripheral nerve regeneration is a complex, multi-step process. In
          this project, we aim to pinpoint which transcripts are upregulated at
          specific time points after injury. Our data will come from publicly
          available RNA-seq repositories, and we will validate findings using
          qPCR on a subset of candidate genes.
        </p>
      </section>
    </article>
  );
}

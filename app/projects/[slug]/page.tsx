import { notFound } from 'next/navigation';
import { getProjectBySlug } from '@/lib/projects';
import Link from 'next/link';

// Notice: no explicit “PageProps” import, no custom interface.
// We simply write: “the argument is { params: { slug: string } }”
export default function ProjectOverviewPage({
  params,
}: {
  params: { slug: any };
}) {
  const { slug } = params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return notFound();
  }

  return (
    <article className="prose max-w-3xl mx-auto py-12">
   
      <h1 className="text-4xl font-bold">{project.title}</h1>

     
      <p className="mt-4 text-lg">{project.description}</p>

   

      
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
 
      </nav>

     
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

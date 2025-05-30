// app/projects/page.tsx
import Link from 'next/link'
import { PROJECT_LIST } from '@/lib/projects'

export default function ProjectsIndexPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Projects</h1>
      <ul className="space-y-4">
        {PROJECT_LIST.map((p) => (
          <li key={p.slug}>
            <Link 
              href={`/projects/${p.slug}`} 
              className="text-blue-600 hover:underline text-xl"
            >
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

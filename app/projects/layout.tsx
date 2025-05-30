// /app/projects/layout.tsx
import { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata = {
  title: 'Projects',
};


export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">BioForge</h1>
     <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
    </div>
  );
}

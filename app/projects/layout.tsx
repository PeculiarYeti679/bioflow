// /app/projects/layout.tsx
import { ReactNode } from "react";

export const metadata = {
  title: "Projects",
};

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return <div className="relative">{children}</div>;
}

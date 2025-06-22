// /app/projects/layout.tsx
import { ReactNode } from "react";
import "../globals.css";

export const metadata = {
  title: "Projects",
};

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return <div className="relative">{children}</div>;
}

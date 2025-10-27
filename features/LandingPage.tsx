// app/components/LandingPage.tsx
"use client";

import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="bg-white/80 dark:bg-muted/60 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-10 max-w-2xl mx-auto text-center space-y-6">
      <div className="flex justify-center">
        <Image
          src="/steve-johnson-mbkR-iq_9oE-unsplash.jpg"
          alt="BioForgr Explorer"
          width={160}
          height={160}
          className="rounded-xl shadow-md"
        />
      </div>

      <h1 className="text-4xl font-bold tracking-tight text-foreground">
        Welcome to BioForge
      </h1>

      <p className="text-muted-foreground text-lg">
        This site hopes to host a collection of projects the will explore 
        compuational biology and bioinformatics. These project are intended
        to walk through the process of analyzing data and coming to 
        conclusions.
      </p>

      <Link
        href="/projects"
        className="inline-flex items-center justify-center px-6 py-3 text-base font-medium transition-colors rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
      >
        View Projects
      </Link>
    </div>
  );
}

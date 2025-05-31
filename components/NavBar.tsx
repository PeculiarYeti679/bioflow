"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu as MenuIcon, X as XIcon } from "lucide-react"; // ShadCN uses lucide-react icons
import BreadCrumb from "./BreadCrumb"; // Our dynamic breadcrumb component
import { ModeToggle } from "./ModeToggle";

// Example of your top-level pages; feel free to adjust to match your routes.
const TOP_LEVEL_LINKS: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathSegments = pathname.split("/").filter((seg) => seg !== "");

  const crumbs = [
    { label: "Home", href: "/" as string },
    ...pathSegments.map((segment, idx) => {
      const href = "/" + pathSegments.slice(0, idx + 1).join("/");
      const label = segment
        .replace(/-/g, " ")
        .replace(/^\w/, (c) => c.toUpperCase());
      return {
        label,
        href: idx === pathSegments.length - 1 ? undefined : href,
      };
    }),
  ];
  const showBreadcrumb = crumbs.length > 1;

  return (
    <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-gray-800 dark:text-gray-100"
            >
              BioForge
            </Link>
          </div>

          <nav className="hidden sm:flex sm:space-x-8 sm:items-center">
            {TOP_LEVEL_LINKS.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-4">
            <ModeToggle />

            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="sm:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {TOP_LEVEL_LINKS.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 min-h-[2.5rem]">
          <div className={!showBreadcrumb ? "invisible" : ""}>
            <BreadCrumb crumbs={crumbs} />
          </div>
        </div>
      </div>
    </header>
  );
}

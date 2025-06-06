import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/ModeToggle";
import NavBar from "@/components/NavBar";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BioForge",
  description: "A platform for exploring biological research projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) { 
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
        
          <div className="flex min-h-screen flex-col">
            <NavBar />
            <main className="flex-1">{children}</main>

            <footer className="p-4 bg-background dark:bg-background">
              <div className="container mx-auto text-center">
                <ModeToggle />
                <p className="text-sm text-foreground dark:text-foreground pt-2">
                  © 2025 Edward Ybarra. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
         
        </ThemeProvider>
      </body>
    </html>
  );
}

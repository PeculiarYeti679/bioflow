import { ModeToggle } from "@/components/ModeToggle";
import LandingPage from "@/features/LandingPage";
import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-background dark:bg-background min-h-screen flex flex-col items-center justify-center">
   
   <LandingPage />
    </div>
   
  );
}

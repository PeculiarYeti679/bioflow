import { ModeToggle } from "@/components/ModeToggle";
import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-white text-gray]
     dark:bg-gray-900 dark:text-gray-100 min-h-screen flex flex-col items-center justify-center">
   
   <footer className="absolute bottom-0 left-0 right-0 p-4 bg-gray-200 dark:bg-gray-800">
      <div className="container mx-auto text-center">
        <ModeToggle/>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © 2025 Edward Ybarra. All rights reserved.
        </p>
      </div> </footer>
    </div>
   
  );
}

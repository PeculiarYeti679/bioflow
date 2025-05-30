import LandingPage from "@/features/LandingPage";
import BlobBackground from "@/components/BlobBackground";

export default function Home() {
  return (
     <div className="relative min-h-screen bg-background flex items-center justify-center">
    
<BlobBackground className="top-0 right-0" wiggleIntensity={2} />

      <LandingPage />
    </div>
   
  );
}

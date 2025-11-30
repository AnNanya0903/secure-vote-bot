import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ElectionsList } from "@/components/ElectionsList";
import { HowItWorks } from "@/components/HowItWorks";
import { TransparencySection } from "@/components/TransparencySection";
import { Footer } from "@/components/Footer";
import { ChatBot } from "@/components/ChatBot";

const Index = () => {
  const scrollToElections = () => {
    document.getElementById('elections')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <Hero onExploreElections={scrollToElections} />
        <ElectionsList />
        <HowItWorks />
        <TransparencySection />
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
};

export default Index;

import AboutUs from "../components/sections/AboutUs";
import CTA from "../components/sections/CTA";
import CoursesSection from "../components/sections/CoursesSection";
import Hero from "../components/sections/Hero";
import Metrics from "../components/sections/Metrics";
import Footer from "../components/layout/Footer";

export default function Home() {
  return (
    <main className="flex-1 bg-background text-foreground">
      <Hero />
      <Metrics />
      <AboutUs />
      <CoursesSection />
      <CTA />
      <Footer />
    </main>
  );
}

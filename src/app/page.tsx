import CTA from "../components/sections/CTA";
import CoursesSection from "../components/sections/CoursesSection";
import Hero from "../components/sections/Hero";
import Metrics from "../components/sections/Metrics";
import Testimonials from "../components/sections/Testimonials";
import Footer from "../components/layout/Footer";
import { getCourses } from "../lib/db";

export default async function Home() {
  const courses = getCourses();

  return (
    <main className="flex-1" style={{ background: 'var(--color-canvas)', color: 'var(--color-ink)' }}>
      <Hero />
      <Metrics />
      <CoursesSection initialCourses={courses} />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}

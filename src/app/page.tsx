import CTA from "../components/sections/CTA";
import CoursesSection from "../components/sections/CoursesSection";
import Hero from "../components/sections/Hero";
import Metrics from "../components/sections/Metrics";
import Testimonials from "../components/sections/Testimonials";
import Footer from "../components/layout/Footer";
import { getCourses } from "../lib/db";
import { getYoutubeStats } from "../lib/youtube";
import { supabase } from "../lib/supabase";

export default async function Home() {
  const [courses, youtubeStats, testimonialsRes] = await Promise.all([
    getCourses(),
    getYoutubeStats(),
    supabase.from("testimonials").select("*").eq("status", "approved").order("created_at", { ascending: false }),
  ]);

  const metrics = [
    { label: "Subscribers", value: youtubeStats.subscribers },
    { label: "Total Views", value: youtubeStats.views },
    { label: "Video Lessons", value: youtubeStats.videos },
    { label: "Pricing", value: "Free" },
  ];

  const dbTestimonials = testimonialsRes.data || [];

  return (
    <main className="flex-1" style={{ background: 'var(--color-canvas)', color: 'var(--color-ink)' }}>
      <Hero />
      <Metrics initialMetrics={metrics} />
      <CoursesSection initialCourses={courses} />
      <Testimonials initialTestimonials={dbTestimonials} />
      <CTA />
      <Footer />
    </main>
  );
}

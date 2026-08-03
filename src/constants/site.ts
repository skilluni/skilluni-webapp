export const SITE = {
  name: "SkillUni",
  homeHref: "/",
  tagline: "Free Tech Education. Forever.",
  description:
    "Founded in August 2024 with the mission to provide free, high-quality computer science education to students worldwide. SkillUni is a platform that helps students learn programming, data structures, algorithms, and other computer science concepts through interactive lessons, quizzes, and projects.",
  youtube: "https://youtube.com/@skilluni",
  reddit: "https://www.reddit.com/user/skilluni/",
  email: "logiclantern313@gmail.com",
};

export const HEADER = {
  cta: {
    label: "Sign up free",
    href: "/signup",
  },
};

export const FOOTER = {
  note: "Empowering the next generation of software engineers through free, world-class tech education.",
  columns: [
    {
      title: "Popular Courses",
      links: [
        { label: "Computer Applications Class 9 ICSE", href: "/courses/icse-java-class-9" },
        { label: "Computer Applications Class 10 ICSE", href: "/courses/icse-java-class-10" }
      ],
    },
    {
      title: "Explore",
      links: [
        { label: "Home", href: "/" },
        { label: "All Roadmaps", href: "/courses" },
        { label: "Student Reviews", href: "/#testimonials" },
        { label: "Channel Metrics", href: "/#metrics" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "YouTube Channel", href: SITE.youtube }
      ],
    },
  ],
  social: [{ label: "YouTube", href: SITE.youtube }],
  legal: "© 2026 SkillUni. Built with passion for future developers.",
};

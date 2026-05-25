export const SITE = {
  name: "SkillUni",
  homeHref: "/",
  tagline: "Free Tech Education. Forever.",
  description:
    "Helping ICSE Class 10 students ace Computer Applications with Java.",
  youtube: "https://youtube.com/@SkillUni",
};

export const HEADER = {
  cta: {
    label: "Sign up free",
    href: "/signup",
  },
};

export const FOOTER = {
  note: "Free-forever learning for ICSE Computer Applications.",
  columns: [
    {
      title: "Explore",
      links: [
        { label: "Home", href: "/" },
        { label: "Courses", href: "/courses" },
        { label: "About", href: "#about" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "YouTube", href: SITE.youtube },
        { label: "Roadmaps", href: "/courses" },
      ],
    },
  ],
  social: [{ label: "YouTube", href: SITE.youtube }],
  legal: "© 2026 SkillUni. Free forever.",
};

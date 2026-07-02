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
  note: "Built for tech nerds.",
  columns: [
    {
      title: "Explore",
      links: [
        { label: "Home", href: "/" },
        { label: "Courses", href: "/courses" },
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
  legal: "© 2026 SkillUni.",
};

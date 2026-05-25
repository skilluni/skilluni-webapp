import { SITE } from "./site";

export const HOME = {
  sectionIds: {
    metrics: "metrics",
    about: "about",
    courses: "courses",
    cta: "cta",
  },
  hero: {
    eyebrow: "SkillUni WebApp",
    title: "Get Skilled",
    description:
      "Organized lectures, notes, and quizzes in one place so every student learns with clarity and confidence.",
    primaryCta: {
      label: "Explore courses",
      href: "/courses",
    },
    secondaryCta: {
      label: "Watch on YouTube",
      href: SITE.youtube,
      isExternal: true,
    },
    highlights: [
      "Structured roadmap instead of scattered links",
      "Quizzes after every lecture",
      "Progress tracking per course",
      "Learn on any device, no laptop needed",
    ],
    preview: {
      title: "Roadmap preview",
      description: "Every step is a lecture with video, notes, quiz, and progress.",
      steps: [
        "Introduction to Java basics",
        "Control statements and loops",
        "Methods and arrays",
        "Object-oriented programming",
      ],
    },
  },
  metrics: {
    eyebrow: "Impact",
    title: "Learning that already helps thousands",
    description:
      "Built on real classroom needs with a focus on ICSE Computer Applications.",
  },
  about: {
    eyebrow: "Why SkillUni",
    title: "A focused platform for ICSE Computer Applications.",
    description:
      "Students deserve a single place that keeps learning organized, practical, and accountable.",
    problem: {
      title: "The problems we saw",
      points: [
        "Resources are scattered across multiple places",
        "Many students cannot run Java locally on a laptop",
        "Lecture watching lacks quizzes for practice",
        "Learning alone makes it easy to lose momentum",
      ],
    },
    vision: {
      title: "The vision we are building",
      points: [
        "Log in and track personal progress",
        "Enroll in multiple courses and separate progress",
        "A visual roadmap for every course",
        "Each lecture bundles video, notes, quiz, and checklist",
      ],
    },
  },
  courses: {
    eyebrow: "Courses",
    title: "Start with ICSE Class 10 Java",
    description:
      "Our first full roadmap is built to help students score 100/100 in Computer Applications.",
    ctaLabel: "View course roadmap",
    ctaHref: "/courses",
  },
  cta: {
    title: "Ready to learn with a clear roadmap?",
    description:
      "Join SkillUni to enroll, track progress, and stay consistent through the syllabus.",
    primaryCta: {
      label: "Sign up free",
      href: "/signup",
    },
    secondaryCta: {
      label: "Browse courses",
      href: "/courses",
    },
  },
};

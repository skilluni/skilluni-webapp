import type { Lecture } from "../types/lecture";

export type Chapter = {
  id: string;
  order: number;
  title: string;
  description: string;
  lectures: Lecture[];
};

export function getCourseChapters(courseSlug: string, lectures: Lecture[]): Chapter[] {
  // Ensure lectures are sorted by their order
  const sortedLectures = [...lectures].sort((a, b) => a.order - b.order);

  switch (courseSlug) {
    case "icse-java-class-9-10":
      return [
        {
          id: "ch1",
          order: 1,
          title: "OOP & Class Basics",
          description: "Dive into Object-Oriented programming principles, understanding classes, objects, and procedure-oriented paradigms in Java.",
          lectures: sortedLectures.filter(l => [1, 2, 3, 4].includes(l.order)),
        },
        {
          id: "ch2",
          order: 2,
          title: "Text Encodings",
          description: "Master ASCII and Unicode character encodings, learning how computers process and store textual data.",
          lectures: sortedLectures.filter(l => [5, 6].includes(l.order)),
        },
        {
          id: "ch3",
          order: 3,
          title: "Java Tokens & Operators",
          description: "Explore core language components including keywords, identifiers, literals, and relational or logical operators.",
          lectures: sortedLectures.filter(l => [7, 8, 9, 10, 11].includes(l.order)),
        },
      ];

    case "isc-java-dsa-class-11-12":
      return [
        {
          id: "ch1",
          order: 1,
          title: "Array Fundamentals",
          description: "Learn basic structures, dynamic memory allocation vs static sizing, and single or double-dimensional array operations.",
          lectures: sortedLectures.filter(l => [1, 2, 5].includes(l.order)),
        },
        {
          id: "ch2",
          order: 2,
          title: "Recursion & Backtracking",
          description: "Master the call stack, base cases, complex board-level puzzle solving, and backtracking logic.",
          lectures: sortedLectures.filter(l => [3, 4].includes(l.order)),
        },
        {
          id: "ch3",
          order: 3,
          title: "Linear Data Structures",
          description: "Dive into stacks and queues, understanding LIFO/FIFO operations, push, pop, enqueue, and dequeue mechanics.",
          lectures: sortedLectures.filter(l => [6, 7].includes(l.order)),
        },
        {
          id: "ch4",
          order: 4,
          title: "Algorithm Analysis",
          description: "Analyze time and space efficiency of algorithms, mastering Big O notation and complexity scaling.",
          lectures: sortedLectures.filter(l => [8].includes(l.order)),
        },
      ];

    case "oop-deep-dive-java":
      return [
        {
          id: "ch1",
          order: 1,
          title: "Pillars of OOP",
          description: "Establish a solid foundation with the 4 pillars of Object-Oriented programming and encapsulation/data-hiding concepts.",
          lectures: sortedLectures.filter(l => [1, 2].includes(l.order)),
        },
        {
          id: "ch2",
          order: 2,
          title: "Inheritance & Interfaces",
          description: "Explore sub-classing, code reusability, constructor chaining, super keyword, abstract classes, and interface contracts.",
          lectures: sortedLectures.filter(l => [3, 5].includes(l.order)),
        },
        {
          id: "ch3",
          order: 3,
          title: "Polymorphism",
          description: "Differentiate between compile-time and runtime polymorphism, method overloading, overriding, and solve typical board exam questions.",
          lectures: sortedLectures.filter(l => [4, 6].includes(l.order)),
        },
      ];

    case "icse-java-solved-papers":
      return [
        {
          id: "ch1",
          order: 1,
          title: "2025 Specimen & Board",
          description: "Get complete, step-by-step video solutions and detailed breakdowns for the latest 2025 Board Examination.",
          lectures: sortedLectures.filter(l => [1, 2].includes(l.order)),
        },
        {
          id: "ch2",
          order: 2,
          title: "2022-2024 Series",
          description: "In-depth coding logic and handwritten answers for the 2024, 2023, and 2022 Computer Applications Board Exams.",
          lectures: sortedLectures.filter(l => [3, 4, 5].includes(l.order)),
        },
        {
          id: "ch3",
          order: 3,
          title: "2017-2021 Foundation",
          description: "Build a strong historical foundation with comprehensive solution breakdowns of ICSE papers from 2017 through 2021.",
          lectures: sortedLectures.filter(l => [6, 7, 8, 9, 10].includes(l.order)),
        },
      ];

    default:
      // Fallback: Group everything into a single general chapter
      return [
        {
          id: "general",
          order: 1,
          title: "Course Curriculum",
          description: "Complete sequence of lectures for the course.",
          lectures: sortedLectures,
        },
      ];
  }
}

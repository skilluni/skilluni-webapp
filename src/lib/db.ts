import fs from "fs";
import path from "path";
import { COURSES } from "../constants/courses";
import { getCourseChapters } from "./chapters";
import type { Course } from "../types/course";
import type { Lecture } from "../types/lecture";

export type DbLecture = Lecture;

export type DbChapter = {
  id: string;
  order: number;
  title: string;
  description: string;
  lectures: DbLecture[];
};

export interface DbCourse extends Course {
  chapters: DbChapter[];
}

const DB_PATH = path.join(process.cwd(), "src", "data", "db.json");

// Helper to ensure parent directories exist
function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

// Auto-initialize db.json from static constant assets if not exists
export function initializeDbIfNeeded(): DbCourse[] {
  if (fs.existsSync(DB_PATH)) {
    try {
      const fileData = fs.readFileSync(DB_PATH, "utf-8");
      return JSON.parse(fileData) as DbCourse[];
    } catch (e) {
      console.error("Error reading db.json, re-initializing:", e);
    }
  }

  // Not exists or failed to read, create fresh data
  console.log("Initializing dynamic courses database from static constants...");
  const initialDbCourses: DbCourse[] = COURSES.map((course) => {
    // Get static chapters
    const staticChapters = getCourseChapters(course.slug, course.lectures);
    
    const dbChapters: DbChapter[] = staticChapters.map((ch) => ({
      id: ch.id,
      order: ch.order,
      title: ch.title,
      description: ch.description,
      lectures: ch.lectures.map((l) => ({
        ...l,
        videoUrl: l.videoUrl || "",
        notesUrl: l.notesUrl || "",
        quizUrl: l.quizUrl || "",
      })),
    }));

    return {
      ...course,
      lectures: course.lectures.map((l) => ({
        ...l,
        videoUrl: l.videoUrl || "",
        notesUrl: l.notesUrl || "",
        quizUrl: l.quizUrl || "",
      })),
      chapters: dbChapters,
    };
  });

  ensureDirectoryExistence(DB_PATH);
  fs.writeFileSync(DB_PATH, JSON.stringify(initialDbCourses, null, 2), "utf-8");
  return initialDbCourses;
}

// Fetch all courses with populated flattened lectures for seamless backward compatibility
export function getCourses(): DbCourse[] {
  const courses = initializeDbIfNeeded();
  
  // Re-flatten lectures for each course to ensure perfect backward compatibility
  return courses.map((course) => {
    const allLectures: DbLecture[] = [];
    
    // Sort chapters by order first, and assign sorted lectures back to each chapter
    const sortedChapters = [...course.chapters]
      .sort((a, b) => a.order - b.order)
      .map((chapter) => {
        const sortedLectures = [...chapter.lectures].sort((a, b) => a.order - b.order);
        allLectures.push(...sortedLectures);
        return {
          ...chapter,
          lectures: sortedLectures,
        };
      });

    return {
      ...course,
      chapters: sortedChapters,
      lectures: allLectures,
    };
  });
}

// Helper to fetch one course by slug
export function getCourseBySlug(slug: string): DbCourse | undefined {
  const courses = getCourses();
  return courses.find((c) => c.slug === slug);
}

// Write modifications back to the dynamic file database
export function saveCourses(courses: DbCourse[]) {
  // Sort chapters and lectures in the saved array to maintain physical file integrity
  const cleanedCourses = courses.map((course) => {
    const sortedChapters = [...course.chapters]
      .sort((a, b) => a.order - b.order)
      .map((ch) => ({
        ...ch,
        lectures: [...ch.lectures].sort((a, b) => a.order - b.order),
      }));

    const allLectures: DbLecture[] = [];
    sortedChapters.forEach((ch) => {
      allLectures.push(...ch.lectures);
    });

    return {
      ...course,
      chapters: sortedChapters,
      lectures: allLectures,
    };
  });

  ensureDirectoryExistence(DB_PATH);
  fs.writeFileSync(DB_PATH, JSON.stringify(cleanedCourses, null, 2), "utf-8");
}

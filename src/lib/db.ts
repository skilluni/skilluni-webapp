import { supabase } from "./supabase";
import { supabaseAdmin } from "./supabase-admin";
import type { Lecture } from "../types/lecture";

// ─── Types (unchanged shape for backward compatibility) ──────────────────────

export type DbLecture = Lecture;

export type DbChapter = {
  id: string;
  order: number;
  title: string;
  description: string;
  lectures: DbLecture[];
};

export interface DbCourse {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: string;
  thumbnail: string;
  isPremium: boolean;
  tags: string[];
  chapters: DbChapter[];
  lectures: DbLecture[];
}

// ─── In-Memory TTL Cache ─────────────────────────────────────────────────────

let cachedCourses: DbCourse[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60_000; // 60 seconds

function invalidateCache() {
  cachedCourses = null;
  cacheTimestamp = 0;
}

function isCacheValid(): boolean {
  return cachedCourses !== null && Date.now() - cacheTimestamp < CACHE_TTL;
}

// ─── Read Helpers ────────────────────────────────────────────────────────────

/**
 * Fetch all courses from Supabase with chapters and lectures nested.
 * Returns cached data if available and fresh (within TTL).
 */
export async function getCourses(): Promise<DbCourse[]> {
  if (isCacheValid()) {
    return cachedCourses!;
  }

  // Fetch all three tables in parallel
  const [coursesRes, chaptersRes, lecturesRes] = await Promise.all([
    supabase.from("courses").select("*").order("created_at", { ascending: true }),
    supabase.from("chapters").select("*").order("order", { ascending: true }),
    supabase.from("lectures").select("*").order("order", { ascending: true }),
  ]);

  if (coursesRes.error) throw new Error(`Failed to fetch courses: ${coursesRes.error.message}`);
  if (chaptersRes.error) throw new Error(`Failed to fetch chapters: ${chaptersRes.error.message}`);
  if (lecturesRes.error) throw new Error(`Failed to fetch lectures: ${lecturesRes.error.message}`);

  const rawCourses = coursesRes.data || [];
  const rawChapters = chaptersRes.data || [];
  const rawLectures = lecturesRes.data || [];

  // Build a lookup: chapterId -> lectures[]
  const lecturesByChapter = new Map<string, DbLecture[]>();
  for (const l of rawLectures) {
    const list = lecturesByChapter.get(l.chapter_id) || [];
    list.push({
      id: l.id,
      order: l.order,
      slug: l.slug,
      title: l.title,
      description: l.description,
      videoUrl: l.video_url || "",
      notesUrl: l.notes_url || "",
      quizUrl: l.quiz_url || "",
      duration: l.duration,
      isLocked: l.is_locked,
    });
    lecturesByChapter.set(l.chapter_id, list);
  }

  // Build a lookup: courseId -> chapters[]
  const chaptersByCourse = new Map<string, DbChapter[]>();
  for (const ch of rawChapters) {
    const list = chaptersByCourse.get(ch.course_id) || [];
    list.push({
      id: ch.id,
      order: ch.order,
      title: ch.title,
      description: ch.description,
      lectures: (lecturesByChapter.get(ch.id) || []).sort((a, b) => a.order - b.order),
    });
    chaptersByCourse.set(ch.course_id, list);
  }

  // Assemble DbCourse[]
  const assembled: DbCourse[] = rawCourses.map((c) => {
    const chapters = (chaptersByCourse.get(c.id) || []).sort((a, b) => a.order - b.order);

    // Flatten lectures from sorted chapters for backward compatibility
    const allLectures: DbLecture[] = [];
    chapters.forEach((ch) => allLectures.push(...ch.lectures));

    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      level: c.level,
      thumbnail: c.thumbnail,
      isPremium: c.is_premium,
      tags: c.tags || [],
      chapters,
      lectures: allLectures,
    };
  });

  // Cache the result
  cachedCourses = assembled;
  cacheTimestamp = Date.now();

  return assembled;
}

/**
 * Fetch a single course by slug.
 */
export async function getCourseBySlug(slug: string): Promise<DbCourse | undefined> {
  const courses = await getCourses();
  return courses.find((c) => c.slug === slug);
}

// ─── Course CRUD ─────────────────────────────────────────────────────────────

export async function addCourse(data: {
  title: string;
  slug: string;
  description?: string;
  level?: string;
  thumbnail?: string;
  isPremium?: boolean;
  tags?: string[];
}) {
  const id = `course-${Date.now()}`;
  const { error } = await supabaseAdmin.from("courses").insert({
    id,
    slug: data.slug,
    title: data.title,
    description: data.description || "",
    level: data.level || "Beginner",
    thumbnail: data.thumbnail || "/images/courses/default.webp",
    is_premium: !!data.isPremium,
    tags: data.tags || [],
  });

  if (error) throw new Error(`Add course failed: ${error.message}`);
  invalidateCache();
  return id;
}

export async function editCourse(
  id: string,
  data: {
    title?: string;
    slug?: string;
    description?: string;
    level?: string;
    thumbnail?: string;
    isPremium?: boolean;
    tags?: string[];
  }
) {
  // Build update payload — only include fields that are provided
  const update: Record<string, unknown> = {};
  if (data.title !== undefined) update.title = data.title;
  if (data.slug !== undefined) update.slug = data.slug;
  if (data.description !== undefined) update.description = data.description;
  if (data.level !== undefined) update.level = data.level;
  if (data.thumbnail !== undefined) update.thumbnail = data.thumbnail;
  if (data.isPremium !== undefined) update.is_premium = !!data.isPremium;
  if (data.tags !== undefined) update.tags = data.tags;

  const { error } = await supabaseAdmin.from("courses").update(update).eq("id", id);
  if (error) throw new Error(`Edit course failed: ${error.message}`);
  invalidateCache();
}

export async function deleteCourse(id: string) {
  // CASCADE on FK will delete associated chapters and lectures
  const { error } = await supabaseAdmin.from("courses").delete().eq("id", id);
  if (error) throw new Error(`Delete course failed: ${error.message}`);
  invalidateCache();
}

// ─── Chapter CRUD ────────────────────────────────────────────────────────────

export async function addChapter(data: {
  courseId: string;
  title?: string;
  description?: string;
  order?: number;
}) {
  const id = `ch-${Date.now()}`;

  // If no order provided, append at end
  let order = data.order;
  if (!order) {
    const { count } = await supabaseAdmin
      .from("chapters")
      .select("*", { count: "exact", head: true })
      .eq("course_id", data.courseId);
    order = (count || 0) + 1;
  }

  const { error } = await supabaseAdmin.from("chapters").insert({
    id,
    course_id: data.courseId,
    order,
    title: data.title || "New Chapter",
    description: data.description || "",
  });

  if (error) throw new Error(`Add chapter failed: ${error.message}`);
  invalidateCache();
  return id;
}

export async function editChapter(
  id: string,
  data: {
    title?: string;
    description?: string;
    order?: number;
  }
) {
  const update: Record<string, unknown> = {};
  if (data.title !== undefined) update.title = data.title;
  if (data.description !== undefined) update.description = data.description;
  if (data.order !== undefined) update.order = Number(data.order);

  const { error } = await supabaseAdmin.from("chapters").update(update).eq("id", id);
  if (error) throw new Error(`Edit chapter failed: ${error.message}`);
  invalidateCache();
}

export async function deleteChapter(id: string) {
  // CASCADE on FK will delete associated lectures
  const { error } = await supabaseAdmin.from("chapters").delete().eq("id", id);
  if (error) throw new Error(`Delete chapter failed: ${error.message}`);
  invalidateCache();
}

// ─── Lecture CRUD ────────────────────────────────────────────────────────────

export async function addLecture(data: {
  courseId: string;
  chapterId: string;
  title?: string;
  description?: string;
  order?: number;
  slug?: string;
  duration?: string;
  videoUrl?: string;
  notesUrl?: string;
  quizUrl?: string;
  isLocked?: boolean;
}) {
  const id = `L-${Date.now()}`;
  const finalSlug = data.slug || `lecture-${Date.now()}`;

  // If no order provided, append at end
  let order = data.order;
  if (!order) {
    const { count } = await supabaseAdmin
      .from("lectures")
      .select("*", { count: "exact", head: true })
      .eq("chapter_id", data.chapterId);
    order = (count || 0) + 1;
  }

  const { error } = await supabaseAdmin.from("lectures").insert({
    id,
    chapter_id: data.chapterId,
    course_id: data.courseId,
    order,
    slug: finalSlug,
    title: data.title || "New Lecture",
    description: data.description || "",
    video_url: data.videoUrl || "",
    notes_url: data.notesUrl || "",
    quiz_url: data.quizUrl || "",
    duration: data.duration || "10 min",
    is_locked: !!data.isLocked,
  });

  if (error) throw new Error(`Add lecture failed: ${error.message}`);
  invalidateCache();
  return id;
}

export async function editLecture(
  id: string,
  data: {
    chapterId?: string;
    title?: string;
    description?: string;
    order?: number;
    slug?: string;
    duration?: string;
    videoUrl?: string;
    notesUrl?: string;
    quizUrl?: string;
    isLocked?: boolean;
  }
) {
  const update: Record<string, unknown> = {};
  if (data.chapterId !== undefined) update.chapter_id = data.chapterId;
  if (data.title !== undefined) update.title = data.title;
  if (data.description !== undefined) update.description = data.description;
  if (data.order !== undefined) update.order = Number(data.order);
  if (data.slug !== undefined) update.slug = data.slug;
  if (data.duration !== undefined) update.duration = data.duration;
  if (data.videoUrl !== undefined) update.video_url = data.videoUrl;
  if (data.notesUrl !== undefined) update.notes_url = data.notesUrl;
  if (data.quizUrl !== undefined) update.quiz_url = data.quizUrl;
  if (data.isLocked !== undefined) update.is_locked = !!data.isLocked;

  const { error } = await supabaseAdmin.from("lectures").update(update).eq("id", id);
  if (error) throw new Error(`Edit lecture failed: ${error.message}`);
  invalidateCache();
}

export async function deleteLecture(id: string) {
  const { error } = await supabaseAdmin.from("lectures").delete().eq("id", id);
  if (error) throw new Error(`Delete lecture failed: ${error.message}`);
  invalidateCache();
}

// ─── Slug Uniqueness Helpers ─────────────────────────────────────────────────

/**
 * Check if a course slug is already taken (optionally excluding a specific course ID).
 */
export async function isCourseSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  let query = supabaseAdmin.from("courses").select("id").eq("slug", slug);
  if (excludeId) {
    query = query.neq("id", excludeId);
  }
  const { data } = await query;
  return (data?.length || 0) > 0;
}

/**
 * Check if a lecture slug is already taken within a course (optionally excluding a specific lecture ID).
 */
export async function isLectureSlugTaken(
  courseId: string,
  slug: string,
  excludeId?: string
): Promise<boolean> {
  let query = supabaseAdmin
    .from("lectures")
    .select("id")
    .eq("course_id", courseId)
    .eq("slug", slug);
  if (excludeId) {
    query = query.neq("id", excludeId);
  }
  const { data } = await query;
  return (data?.length || 0) > 0;
}

/**
 * Find which chapter a lecture belongs to.
 */
export async function findLectureLocation(
  courseId: string,
  lectureId: string
): Promise<{ chapterId: string } | null> {
  const { data } = await supabaseAdmin
    .from("lectures")
    .select("chapter_id")
    .eq("id", lectureId)
    .eq("course_id", courseId)
    .single();

  if (!data) return null;
  return { chapterId: data.chapter_id };
}

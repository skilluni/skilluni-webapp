import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import crypto from "crypto";
import { getCourses, saveCourses, DbCourse, DbChapter, DbLecture } from "../../../lib/db";

export const dynamic = "force-dynamic";

// Helper to hash password for secure cookie verification
function getSessionToken(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin123";
}

export async function GET() {
  try {
    const courses = getCourses();
    return NextResponse.json(courses);
  } catch (error) {
    console.error("GET courses error:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Session token validation check using next/headers cookies
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("skilluni_admin_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const token = sessionCookie.value;
    const expectedToken = getSessionToken(getAdminPassword());

    if (token !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    const { action, data } = body;
    const courses = getCourses();

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    let success = false;
    let message = "";

    switch (action) {
      // --- COURSE CRUD ---
      case "add-course": {
        const { title, slug, description, level, thumbnail, isPremium, tags } = data;
        if (!title || !slug) {
          return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
        }
        if (courses.some((c) => c.slug === slug)) {
          return NextResponse.json({ error: "Course slug already exists" }, { status: 400 });
        }

        const newCourse: DbCourse = {
          id: `course-${Date.now()}`,
          title,
          slug,
          description: description || "",
          level: level || "Beginner",
          thumbnail: thumbnail || "/images/courses/default.webp",
          isPremium: !!isPremium,
          tags: tags || [],
          chapters: [],
          lectures: [],
        };

        courses.push(newCourse);
        success = true;
        message = "Course added successfully";
        break;
      }

      case "edit-course": {
        const { id, title, slug, description, level, thumbnail, isPremium, tags } = data;
        const idx = courses.findIndex((c) => c.id === id);
        if (idx === -1) {
          return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        // Check if slug is taken by another course
        if (courses.some((c) => c.slug === slug && c.id !== id)) {
          return NextResponse.json({ error: "Course slug already exists" }, { status: 400 });
        }

        courses[idx] = {
          ...courses[idx],
          title: title || courses[idx].title,
          slug: slug || courses[idx].slug,
          description: description !== undefined ? description : courses[idx].description,
          level: level || courses[idx].level,
          thumbnail: thumbnail || courses[idx].thumbnail,
          isPremium: isPremium !== undefined ? !!isPremium : courses[idx].isPremium,
          tags: tags || courses[idx].tags,
        };

        success = true;
        message = "Course updated successfully";
        break;
      }

      case "delete-course": {
        const { id } = data;
        const idx = courses.findIndex((c) => c.id === id);
        if (idx === -1) {
          return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        courses.splice(idx, 1);
        success = true;
        message = "Course deleted successfully";
        break;
      }

      // --- CHAPTER CRUD ---
      case "add-chapter": {
        const { courseId, title, description, order } = data;
        const course = courses.find((c) => c.id === courseId);
        if (!course) {
          return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        const newChapter: DbChapter = {
          id: `ch-${Date.now()}`,
          title: title || "New Chapter",
          description: description || "",
          order: Number(order) || (course.chapters.length + 1),
          lectures: [],
        };

        course.chapters.push(newChapter);
        success = true;
        message = "Chapter added successfully";
        break;
      }

      case "edit-chapter": {
        const { courseId, id, title, description, order } = data;
        const course = courses.find((c) => c.id === courseId);
        if (!course) {
          return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        const chapter = course.chapters.find((ch) => ch.id === id);
        if (!chapter) {
          return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
        }

        chapter.title = title || chapter.title;
        chapter.description = description !== undefined ? description : chapter.description;
        chapter.order = order !== undefined ? Number(order) : chapter.order;

        success = true;
        message = "Chapter updated successfully";
        break;
      }

      case "delete-chapter": {
        const { courseId, id } = data;
        const course = courses.find((c) => c.id === courseId);
        if (!course) {
          return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        const idx = course.chapters.findIndex((ch) => ch.id === id);
        if (idx === -1) {
          return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
        }

        course.chapters.splice(idx, 1);
        success = true;
        message = "Chapter deleted successfully";
        break;
      }

      // --- LECTURE CRUD ---
      case "add-lecture": {
        const { courseId, chapterId, title, description, order, slug, duration, videoUrl, notesUrl, quizUrl, isLocked } = data;
        const course = courses.find((c) => c.id === courseId);
        if (!course) {
          return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        const chapter = course.chapters.find((ch) => ch.id === chapterId);
        if (!chapter) {
          return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
        }

        const finalSlug = slug || `lecture-${Date.now()}`;
        
        // Ensure slug is unique within this course's lectures
        const allLectures = course.chapters.flatMap((ch) => ch.lectures);
        if (allLectures.some((l) => l.slug === finalSlug)) {
          return NextResponse.json({ error: "Lecture slug already exists in this course" }, { status: 400 });
        }

        const newLecture: DbLecture = {
          id: `L-${Date.now()}`,
          title: title || "New Lecture",
          description: description || "",
          order: Number(order) || (chapter.lectures.length + 1),
          slug: finalSlug,
          duration: duration || "10 min",
          videoUrl: videoUrl || "",
          notesUrl: notesUrl || "",
          quizUrl: quizUrl || "",
          isLocked: !!isLocked,
        };

        chapter.lectures.push(newLecture);
        success = true;
        message = "Lecture added successfully";
        break;
      }

      case "edit-lecture": {
        const { courseId, chapterId, id, title, description, order, slug, duration, videoUrl, notesUrl, quizUrl, isLocked } = data;
        const course = courses.find((c) => c.id === courseId);
        if (!course) {
          return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        // Find which chapter holds the lecture
        let chapter = course.chapters.find((ch) => ch.id === chapterId);
        let lecture: DbLecture | undefined;
        let originalChapter = chapter;

        if (chapter) {
          lecture = chapter.lectures.find((l) => l.id === id);
        } else {
          // If no chapterId passed or moved, search all chapters
          for (const ch of course.chapters) {
            lecture = ch.lectures.find((l) => l.id === id);
            if (lecture) {
              originalChapter = ch;
              break;
            }
          }
        }

        if (!lecture || !originalChapter) {
          return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
        }

        const finalSlug = slug || lecture.slug;
        const allOtherLectures = course.chapters
          .flatMap((ch) => ch.lectures)
          .filter((l) => l.id !== id);

        if (allOtherLectures.some((l) => l.slug === finalSlug)) {
          return NextResponse.json({ error: "Lecture slug already exists in this course" }, { status: 400 });
        }

        // Update lecture fields
        lecture.title = title || lecture.title;
        lecture.description = description !== undefined ? description : lecture.description;
        lecture.order = order !== undefined ? Number(order) : lecture.order;
        lecture.slug = finalSlug;
        lecture.duration = duration || lecture.duration;
        lecture.videoUrl = videoUrl !== undefined ? videoUrl : lecture.videoUrl;
        lecture.notesUrl = notesUrl !== undefined ? notesUrl : lecture.notesUrl;
        lecture.quizUrl = quizUrl !== undefined ? quizUrl : lecture.quizUrl;
        lecture.isLocked = isLocked !== undefined ? !!isLocked : lecture.isLocked;

        // Handle moving lecture to another chapter if chapterId changed
        if (chapterId && chapterId !== originalChapter.id) {
          const targetChapter = course.chapters.find((ch) => ch.id === chapterId);
          if (!targetChapter) {
            return NextResponse.json({ error: "Target chapter not found" }, { status: 404 });
          }
          // Remove from original chapter
          originalChapter.lectures = originalChapter.lectures.filter((l) => l.id !== id);
          // Add to target chapter
          targetChapter.lectures.push(lecture);
        }

        success = true;
        message = "Lecture updated successfully";
        break;
      }

      case "delete-lecture": {
        const { courseId, id } = data;
        const course = courses.find((c) => c.id === courseId);
        if (!course) {
          return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        let deleted = false;
        for (const ch of course.chapters) {
          const idx = ch.lectures.findIndex((l) => l.id === id);
          if (idx !== -1) {
            ch.lectures.splice(idx, 1);
            deleted = true;
            break;
          }
        }

        if (!deleted) {
          return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
        }

        success = true;
        message = "Lecture deleted successfully";
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    if (success) {
      saveCourses(courses);

      // Perform standard path revalidations for instant cash updates
      try {
        revalidatePath("/");
        revalidatePath("/courses");
        revalidatePath("/courses/[courseId]", "page");
        revalidatePath("/courses/[courseId]/lectures/[lectureSlug]", "page");
      } catch (e) {
        console.warn("Revalidation warning (expected in dev static context):", e);
      }

      return NextResponse.json({ success: true, message });
    }

    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  } catch (error) {
    console.error("POST API error:", error);
    return NextResponse.json({ error: (error as Error).message || "Internal Server Error" }, { status: 500 });
  }
}

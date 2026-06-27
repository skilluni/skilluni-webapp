import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import crypto from "crypto";
import {
  getCourses,
  addCourse,
  editCourse,
  deleteCourse,
  addChapter,
  editChapter,
  deleteChapter,
  addLecture,
  editLecture,
  deleteLecture,
  isCourseSlugTaken,
  isLectureSlugTaken,
  findLectureLocation,
} from "../../../lib/db";

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
    const courses = await getCourses();
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

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    let message = "";

    switch (action) {
      // --- COURSE CRUD ---
      case "add-course": {
        const { title, slug, description, level, thumbnail, isPremium, tags } = data;
        if (!title || !slug) {
          return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
        }
        if (await isCourseSlugTaken(slug)) {
          return NextResponse.json({ error: "Course slug already exists" }, { status: 400 });
        }

        await addCourse({ title, slug, description, level, thumbnail, isPremium, tags });
        message = "Course added successfully";
        break;
      }

      case "edit-course": {
        const { id, title, slug, description, level, thumbnail, isPremium, tags } = data;
        if (!id) {
          return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
        }

        // Check if slug is taken by another course
        if (slug && (await isCourseSlugTaken(slug, id))) {
          return NextResponse.json({ error: "Course slug already exists" }, { status: 400 });
        }

        await editCourse(id, { title, slug, description, level, thumbnail, isPremium, tags });
        message = "Course updated successfully";
        break;
      }

      case "delete-course": {
        const { id } = data;
        if (!id) {
          return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
        }

        await deleteCourse(id);
        message = "Course deleted successfully";
        break;
      }

      // --- CHAPTER CRUD ---
      case "add-chapter": {
        const { courseId, title, description, order } = data;
        if (!courseId) {
          return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
        }

        await addChapter({
          courseId,
          title,
          description,
          order: order ? Number(order) : undefined,
        });
        message = "Chapter added successfully";
        break;
      }

      case "edit-chapter": {
        const { id, title, description, order } = data;
        if (!id) {
          return NextResponse.json({ error: "Chapter ID is required" }, { status: 400 });
        }

        await editChapter(id, {
          title,
          description,
          order: order !== undefined ? Number(order) : undefined,
        });
        message = "Chapter updated successfully";
        break;
      }

      case "delete-chapter": {
        const { id } = data;
        if (!id) {
          return NextResponse.json({ error: "Chapter ID is required" }, { status: 400 });
        }

        await deleteChapter(id);
        message = "Chapter deleted successfully";
        break;
      }

      // --- LECTURE CRUD ---
      case "add-lecture": {
        const {
          courseId,
          chapterId,
          title,
          description,
          order,
          slug,
          duration,
          videoUrl,
          notesUrl,
          quizUrl,
          isLocked,
          codeFiles,
        } = data;

        if (!courseId || !chapterId) {
          return NextResponse.json(
            { error: "Course ID and Chapter ID are required" },
            { status: 400 }
          );
        }

        const finalSlug = slug || `lecture-${Date.now()}`;

        // Ensure slug is unique within this course
        if (await isLectureSlugTaken(courseId, finalSlug)) {
          return NextResponse.json(
            { error: "Lecture slug already exists in this course" },
            { status: 400 }
          );
        }

        await addLecture({
          courseId,
          chapterId,
          title,
          description,
          order: order ? Number(order) : undefined,
          slug: finalSlug,
          duration,
          videoUrl,
          notesUrl,
          quizUrl,
          isLocked,
          codeFiles,
        });
        message = "Lecture added successfully";
        break;
      }

      case "edit-lecture": {
        const {
          courseId,
          chapterId,
          id,
          title,
          description,
          order,
          slug,
          duration,
          videoUrl,
          notesUrl,
          quizUrl,
          isLocked,
          codeFiles,
        } = data;

        if (!id) {
          return NextResponse.json({ error: "Lecture ID is required" }, { status: 400 });
        }

        // If slug is being changed, verify uniqueness
        if (slug && courseId) {
          if (await isLectureSlugTaken(courseId, slug, id)) {
            return NextResponse.json(
              { error: "Lecture slug already exists in this course" },
              { status: 400 }
            );
          }
        }

        // Handle moving lecture to another chapter
        if (chapterId && courseId) {
          const location = await findLectureLocation(courseId, id);
          if (location && location.chapterId !== chapterId) {
            // Update chapter_id to move the lecture
            await editLecture(id, {
              chapterId,
              title,
              description,
              order: order !== undefined ? Number(order) : undefined,
              slug,
              duration,
              videoUrl,
              notesUrl,
              quizUrl,
              isLocked,
              codeFiles,
            });
            message = "Lecture updated and moved successfully";
            break;
          }
        }

        await editLecture(id, {
          chapterId,
          title,
          description,
          order: order !== undefined ? Number(order) : undefined,
          slug,
          duration,
          videoUrl,
          notesUrl,
          quizUrl,
          isLocked,
          codeFiles,
        });
        message = "Lecture updated successfully";
        break;
      }

      case "delete-lecture": {
        const { id } = data;
        if (!id) {
          return NextResponse.json({ error: "Lecture ID is required" }, { status: 400 });
        }

        await deleteLecture(id);
        message = "Lecture deleted successfully";
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    // Perform standard path revalidations for instant cache updates
    try {
      revalidatePath("/");
      revalidatePath("/courses");
      revalidatePath("/courses/[courseId]", "page");
      revalidatePath("/courses/[courseId]/lectures/[lectureSlug]", "page");
    } catch (e) {
      console.warn("Revalidation warning (expected in dev static context):", e);
    }

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("POST API error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

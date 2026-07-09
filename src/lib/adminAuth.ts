import { cookies } from "next/headers";
import { supabase } from "./supabase";
import { supabaseAdmin } from "./supabase-admin";

const ADMIN_EMAIL = "admin@skilluni.com";

export function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD environment variable is not configured.");
  }
  return password;
}

export async function ensureAdminUserExists() {
  const password = getAdminPassword();

  // Retrieve list of users to check if admin already exists
  const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError || !data?.users) {
    console.error("Error listing users for admin check:", listError);
    return;
  }

  const users = data.users;
  const existingAdmin = users.find((u) => u.email === ADMIN_EMAIL);

  if (!existingAdmin) {
    console.log("Admin user not found. Creating admin user...");
    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: password,
      email_confirm: true,
      app_metadata: { role: "admin" },
    });

    if (createError) {
      console.error("Failed to create admin user:", createError);
    }
  } else {
    // Sync metadata and password
    const hasAdminRole = existingAdmin.app_metadata?.role === "admin";
    if (!hasAdminRole) {
      await supabaseAdmin.auth.admin.updateUserById(existingAdmin.id, {
        app_metadata: { role: "admin" },
      });
    }
    await supabaseAdmin.auth.admin.updateUserById(existingAdmin.id, {
      password: password,
    });
  }
}

export async function validateAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("skilluni_admin_session");
    if (!sessionCookie) return false;

    const token = sessionCookie.value;
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) return false;
    return data.user.app_metadata?.role === "admin";
  } catch (e) {
    console.error("Error validating admin session:", e);
    return false;
  }
}

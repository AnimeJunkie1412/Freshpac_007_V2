import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentAuthUser() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentUserProfile() {
  const user = await getCurrentAuthUser();

  if (!user?.email) {
    return null;
  }

  const profile = await prisma.userProfile.findUnique({
    where: {
      email: user.email.toLowerCase()
    }
  });

  return profile;
}

export function formatUserRole(role?: string | null) {
  const labels: Record<string, string> = {
    MASTER_USER: "Master User",
    ADMIN_USER: "Admin User",
    SALES_USER: "Sales User",
    ENGINEER: "Engineer",
    CHIEF_ENGINEER: "Chief Engineer",
    WAREHOUSE_USER: "Warehouse User",
    CUSTOMER: "Customer"
  };

  return role ? labels[role] ?? role : "Unknown";
}
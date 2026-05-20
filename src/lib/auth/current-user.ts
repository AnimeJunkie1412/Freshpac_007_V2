import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type FreshpacRole =
  | "MASTER_USER"
  | "ADMIN_USER"
  | "SALES_USER"
  | "ENGINEER"
  | "CHIEF_ENGINEER"
  | "WAREHOUSE_USER"
  | "CUSTOMER";

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

  return prisma.userProfile.findUnique({
    where: {
      email: user.email.toLowerCase()
    }
  });
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

export function canAccessPortalPath(role: string | null | undefined, pathname: string) {
  if (!role) {
    return false;
  }

  if (role === "MASTER_USER" || role === "ADMIN_USER") {
    return true;
  }

  if (role === "SALES_USER") {
    return (
      pathname === "/portal" ||
      pathname.startsWith("/portal/sales") ||
      pathname.startsWith("/portal/customers") ||
      pathname.startsWith("/portal/orders")
    );
  }

  if (role === "ENGINEER" || role === "CHIEF_ENGINEER") {
    return (
      pathname === "/portal" ||
      pathname.startsWith("/portal/engineers") ||
      pathname.startsWith("/portal/engineering")
    );
  }

  if (role === "WAREHOUSE_USER") {
    return (
      pathname === "/portal" ||
      pathname.startsWith("/portal/sales/orders") ||
      pathname.startsWith("/portal/sales/products")
    );
  }

  if (role === "CUSTOMER") {
    return pathname === "/portal";
  }

  return false;
}

export function getDefaultPortalPathForRole(role: string | null | undefined) {
  if (role === "ENGINEER" || role === "CHIEF_ENGINEER") {
    return "/portal/engineers";
  }

  if (role === "WAREHOUSE_USER") {
    return "/portal/sales/orders";
  }

  return "/portal";
}
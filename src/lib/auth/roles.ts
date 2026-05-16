export const userRoles = [
  "MASTER_USER",
  "ADMIN_USER",
  "CHIEF_ENGINEER",
  "ENGINEER",
  "PARENT_USER",
  "CHILD_USER"
] as const;

export type UserRole = (typeof userRoles)[number];

export function getDefaultPortalForRole(role: UserRole) {
  switch (role) {
    case "MASTER_USER":
    case "ADMIN_USER":
      return "/portal";
    case "CHIEF_ENGINEER":
    case "ENGINEER":
      return "/portal/engineering";
    case "PARENT_USER":
    case "CHILD_USER":
      return "/portal/ordering";
    default:
      return "/login";
  }
}

export const roleLabels: Record<UserRole, string> = {
  MASTER_USER: "Master User",
  ADMIN_USER: "Admin User",
  CHIEF_ENGINEER: "Chief Engineer",
  ENGINEER: "Engineer",
  PARENT_USER: "Parent User",
  CHILD_USER: "Child User"
};

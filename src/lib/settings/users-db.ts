import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type PortalUserFilters = {
  q?: string;
  role?: string;
};

export function getUserRoleLabel(role: string) {
  const labels: Record<string, string> = {
    MASTER_USER: "Master User",
    ADMIN_USER: "Admin User",
    CHIEF_ENGINEER: "Chief Engineer",
    ENGINEER: "Engineer",
    PARENT_USER: "Parent Customer",
    CHILD_USER: "Child Customer"
  };

  return labels[role] || role.replace(/_/g, " ");
}

export function getUserRoleTone(role: string) {
  if (role === "MASTER_USER" || role === "ADMIN_USER") {
    return "danger";
  }

  if (role === "PARENT_USER" || role === "CHILD_USER") {
    return "success";
  }

  if (role === "CHIEF_ENGINEER" || role === "ENGINEER") {
    return "info";
  }

  return "neutral";
}

export function getAvailableUserRoles() {
  return Object.values(UserRole).map((role) => ({
    value: role,
    label: getUserRoleLabel(role)
  }));
}

export async function getPortalUsersFromDb(filters?: PortalUserFilters) {
  const q = filters?.q?.trim() || "";
  const role = filters?.role?.trim() || "ALL";

  const where: any = {};

  if (q) {
    where.OR = [
      {
        email: {
          contains: q,
          mode: "insensitive"
        }
      },
      {
        fullName: {
          contains: q,
          mode: "insensitive"
        }
      },
      {
        customerAccount: {
          accountNumber: {
            contains: q,
            mode: "insensitive"
          }
        }
      },
      {
        customerAccount: {
          siteName: {
            contains: q,
            mode: "insensitive"
          }
        }
      }
    ];
  }

  if (role && role !== "ALL") {
    where.role = role;
  }

  return prisma.userProfile.findMany({
    where,
    orderBy: [
      {
        createdAt: "desc"
      }
    ],
    include: {
      customerAccount: true
    },
    take: 200
  });
}

export async function getUserCreationCustomersFromDb() {
  return prisma.customerAccount.findMany({
    where: {
      status: {
        in: ["ACTIVE", "ACTIVE_PREPAYMENT", "ON_HOLD"]
      }
    },
    orderBy: [
      {
        accountNumber: "asc"
      }
    ],
    select: {
      id: true,
      accountNumber: true,
      siteName: true,
      status: true
    },
    take: 500
  });
}

export async function getUserCountsFromDb() {
  const [total, active, customerUsers, staffUsers, disabled] = await Promise.all([
    prisma.userProfile.count(),
    prisma.userProfile.count({
      where: {
        active: true
      }
    }),
    prisma.userProfile.count({
      where: {
        role: {
          in: ["PARENT_USER", "CHILD_USER"]
        }
      }
    }),
    prisma.userProfile.count({
      where: {
        role: {
          in: ["MASTER_USER", "ADMIN_USER", "CHIEF_ENGINEER", "ENGINEER"]
        }
      }
    }),
    prisma.userProfile.count({
      where: {
        active: false
      }
    })
  ]);

  return {
    total,
    active,
    customerUsers,
    staffUsers,
    disabled
  };
}

export async function getExistingUserProfileByEmail(email: string) {
  return prisma.userProfile.findUnique({
    where: {
      email
    }
  });
}

export async function createUserProfileFromAuthUser({
  authUserId,
  email,
  fullName,
  role,
  active,
  customerAccountId
}: {
  authUserId: string;
  email: string;
  fullName: string;
  role: UserRole;
  active: boolean;
  customerAccountId?: string | null;
}) {
  return prisma.userProfile.create({
    data: {
      authUserId,
      email,
      fullName,
      role,
      active,
      customerAccountId: customerAccountId || null
    }
  });
}

export async function setUserActiveStateFromDb({
  userId,
  active
}: {
  userId: string;
  active: boolean;
}) {
  return prisma.userProfile.update({
    where: {
      id: userId
    },
    data: {
      active
    }
  });
}
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function getCustomerUserRoleLabel(role: string) {
  const labels: Record<string, string> = {
    PARENT_USER: "Parent Customer",
    CHILD_USER: "Child Customer"
  };

  return labels[role] || role.replace(/_/g, " ");
}

export function getCustomerUserRoleTone(role: string) {
  if (role === "PARENT_USER") {
    return "success";
  }

  if (role === "CHILD_USER") {
    return "info";
  }

  return "neutral";
}

export async function getCustomerWithUsersFromDb(accountNumber: string) {
  return prisma.customerAccount.findUnique({
    where: {
      accountNumber
    },
    include: {
      users: {
        orderBy: [
          {
            createdAt: "desc"
          }
        ]
      }
    }
  });
}

export async function getExistingCustomerUserProfileByEmail(email: string) {
  return prisma.userProfile.findUnique({
    where: {
      email
    }
  });
}

export async function createCustomerUserProfileFromAuthUser({
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
  customerAccountId: string;
}) {
  if (role !== "PARENT_USER" && role !== "CHILD_USER") {
    throw new Error("Customer login role must be Parent Customer or Child Customer.");
  }

  return prisma.userProfile.create({
    data: {
      authUserId,
      email,
      fullName,
      role,
      active,
      customerAccountId
    }
  });
}

export async function setCustomerUserActiveStateFromDb({
  userId,
  customerAccountId,
  active
}: {
  userId: string;
  customerAccountId: string;
  active: boolean;
}) {
  return prisma.userProfile.update({
    where: {
      id: userId,
      customerAccountId
    } as any,
    data: {
      active
    }
  });
}
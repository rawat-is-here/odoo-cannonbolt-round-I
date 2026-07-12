import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { DEPARTMENT_CODE_TO_ROUTE } from "@/lib/dashboard-config";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      organizationId: true,
      departmentId: true,
      role: true,
      status: true,
      department: {
        select: {
          code: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (!user.organizationId) {
    redirect("/onboarding/join");
  }

  if (user.status === "PENDING") {
    redirect("/pending-approval");
  }

  if (user.status === "SUSPENDED") {
    redirect("/account-suspended");
  }

  if (user.status !== "ACTIVE") {
    redirect("/pending-approval");
  }

  if (user.role === "ORG_ADMIN") {
    redirect("/dashboard/admin");
  }

  if (!user.departmentId || !user.department) {
    redirect("/pending-approval");
  }

  const route = DEPARTMENT_CODE_TO_ROUTE[user.department.code];

  if (!route) {
    redirect("/pending-approval");
  }

  redirect(route);
}
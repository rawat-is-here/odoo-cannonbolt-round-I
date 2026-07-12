import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEPARTMENT_ROUTES: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  HR: "/dashboard/hr",
  FIN: "/dashboard/finance",
  PUR: "/dashboard/purchase",
  MFG: "/dashboard/manufacturing",
  TRN: "/dashboard/transport",
  WH: "/dashboard/warehouse",
  COMP: "/dashboard/compliance",
  ESG: "/dashboard/sustainability",
};

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
    include: {
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
    redirect("/");
  }

  if (user.status === "PENDING") {
    redirect("/pending-approval");
  }

  if (user.status === "SUSPENDED") {
    redirect("/account-suspended");
  }

  if (user.role === "ORG_ADMIN") {
    redirect("/dashboard/employees");
  }

  if (!user.department) {
    redirect("/pending-approval");
  }

  const departmentRoute =
    DEPARTMENT_ROUTES[user.department.code];

  if (!departmentRoute) {
    redirect("/pending-approval");
  }

  redirect(departmentRoute);
}
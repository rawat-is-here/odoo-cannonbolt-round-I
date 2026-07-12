import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { DepartmentDashboard } from "@/components/dashboard/department-dashboard";
import { auth } from "@/lib/auth";
import { DASHBOARD_CONFIGS } from "@/lib/dashboard-config";
import { prisma } from "@/lib/prisma";

type DepartmentPageProps = {
  params: Promise<{
    department: string;
  }>;
};

export default async function DepartmentPage({
  params,
}: DepartmentPageProps) {
  const { department } = await params;

  const config = DASHBOARD_CONFIGS[department];

  if (!config) {
    notFound();
  }

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
      name: true,
      email: true,
      role: true,
      status: true,
      designation: true,
      organizationId: true,
      departmentId: true,
      organization: {
        select: {
          name: true,
        },
      },
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

  const isOrganizationAdmin = user.role === "ORG_ADMIN";

  const belongsToDepartment =
    user.department?.code === config.code;

  if (!isOrganizationAdmin && !belongsToDepartment) {
    redirect("/dashboard");
  }

  return (
    <DepartmentDashboard
      config={config}
      organizationName={
        user.organization?.name ?? "Organization"
      }
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation,
      }}
    />
  );
}
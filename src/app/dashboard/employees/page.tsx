import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { EmployeeManagement } from "@/components/dashboard/employee-management";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EmployeesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      organization: {
        select: {
          name: true,
          joinCode: true,
        },
      },
    },
  });

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.status === "PENDING") {
    redirect("/pending-approval");
  }

  if (
    currentUser.status !== "ACTIVE" ||
    currentUser.role !== "ORG_ADMIN" ||
    !currentUser.organizationId
  ) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Organization administration
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-slate-950">
              Employee access management
            </h1>

            <p className="mt-3 text-slate-600">
              Approve employees and assign department-level access.
            </p>
          </div>

          <div className="rounded-xl border bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Organization join code
            </p>

            <p className="mt-1 font-mono text-lg font-semibold text-slate-950">
              {currentUser.organization?.joinCode ?? "Not generated"}
            </p>
          </div>
        </div>

        <EmployeeManagement />
      </div>
    </main>
  );
}
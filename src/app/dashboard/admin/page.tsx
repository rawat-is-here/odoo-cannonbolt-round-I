import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const admin = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      name: true,
      role: true,
      status: true,
      organizationId: true,
      organization: {
        select: {
          name: true,
          joinCode: true,
        },
      },
    },
  });

  if (
    !admin ||
    admin.role !== "ORG_ADMIN" ||
    admin.status !== "ACTIVE" ||
    !admin.organizationId
  ) {
    redirect("/dashboard");
  }

  const [pendingEmployees, activeEmployees] = await Promise.all([
    prisma.user.count({
      where: {
        organizationId: admin.organizationId,
        status: "PENDING",
      },
    }),

    prisma.user.count({
      where: {
        organizationId: admin.organizationId,
        status: "ACTIVE",
        id: {
          not: session.user.id,
        },
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Organization administration
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          Welcome, {admin.name}
        </h1>

        <p className="mt-2 text-slate-600">
          {admin.organization?.name}
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <article className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Pending requests
            </p>
            <p className="mt-3 text-3xl font-semibold text-amber-700">
              {pendingEmployees}
            </p>
          </article>

          <article className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Active employees
            </p>
            <p className="mt-3 text-3xl font-semibold text-emerald-700">
              {activeEmployees}
            </p>
          </article>

          <article className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Organization join code
            </p>
            <p className="mt-3 font-mono text-xl font-semibold text-slate-950">
              {admin.organization?.joinCode ?? "Not generated"}
            </p>
          </article>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Link
            className="rounded-2xl bg-slate-950 p-7 text-white shadow-sm transition hover:bg-slate-800"
            href="/dashboard/employees"
          >
            <h2 className="text-xl font-semibold">
              Manage employees
            </h2>

            <p className="mt-2 text-slate-300">
              Approve pending requests and assign roles and departments.
            </p>
          </Link>

          <Link
            className="rounded-2xl bg-emerald-700 p-7 text-white shadow-sm transition hover:bg-emerald-800"
            href="/dashboard/sustainability"
          >
            <h2 className="text-xl font-semibold">
              ESG overview
            </h2>

            <p className="mt-2 text-emerald-100">
              Open the organization sustainability dashboard.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
} 
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PendingApprovalPage() {
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
      organization: {
        select: {
          name: true,
        },
      },
      department: {
        select: {
          name: true,
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

  if (user.status === "ACTIVE") {
    redirect("/dashboard");
  }

  if (user.status === "SUSPENDED") {
    redirect("/account-suspended");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-12">
      <section className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white p-8 shadow-2xl sm:p-12">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
          ⏳
        </div>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          Approval pending
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Your organization administrator must approve your account
        </h1>

        <p className="mt-5 leading-7 text-slate-600">
          Your account has successfully joined{" "}
          <span className="font-semibold text-slate-900">
            {user.organization?.name ?? "the organization"}
          </span>
          , but access has not been activated yet.
        </p>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-semibold text-amber-950">
            What happens next?
          </h2>

          <div className="mt-4 space-y-3 text-sm leading-6 text-amber-900">
            <p>1. The organization administrator reviews your request.</p>
            <p>2. The administrator assigns your department and role.</p>
            <p>3. Your account status is changed from Pending to Active.</p>
            <p>4. You can then access your assigned department dashboard.</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Employee
            </p>
            <p className="mt-1 font-semibold text-slate-950">
              {user.name}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Account status
            </p>
            <p className="mt-1 font-semibold text-amber-700">
              Pending approval
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Organization
            </p>
            <p className="mt-1 font-semibold text-slate-950">
              {user.organization?.name ?? "Assigned organization"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Department
            </p>
            <p className="mt-1 font-semibold text-slate-950">
              {user.department?.name ?? "Not assigned yet"}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            className="flex-1 rounded-xl bg-emerald-700 px-5 py-3 text-center font-semibold text-white transition hover:bg-emerald-800"
            href="/dashboard"
          >
            Check approval status
          </Link>

          <Link
            className="flex-1 rounded-xl border border-slate-300 px-5 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
            href="/"
          >
            Return home
          </Link>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          Refreshing or checking the dashboard will automatically redirect you
          once the administrator activates your account.
        </p>
      </section>
    </main>
  );
}
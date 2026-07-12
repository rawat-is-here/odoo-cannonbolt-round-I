import Link from "next/link";

import { DepartmentActivityPanel } from "@/components/dashboard/department-activity-panel";
import { TransportActivityPanel } from "@/components/dashboard/transport-activity-panel";
import type { DashboardConfig } from "@/lib/dashboard-config";

type DepartmentDashboardProps = {
  config: DashboardConfig;
  user: {
    name: string;
    email: string;
    role: string;
    designation: string | null;
  };
  organizationName: string;
};

const menuClass =
  "block rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white";

export function DepartmentDashboard({
  config,
  user,
  organizationName,
}: DepartmentDashboardProps) {
  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-emerald-700">EcoSphere</p>
            <h1 className="text-xl font-semibold text-slate-950">
              {organizationName}
            </h1>
          </div>

          <div className="text-right">
            <p className="font-semibold text-slate-950">{user.name}</p>
            <p className="text-sm text-slate-500">{formatRole(user.role)}</p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-2xl bg-slate-950 p-5 text-white lg:sticky lg:top-6">
          <p className="text-lg font-semibold">EcoSphere</p>

          <nav className="mt-8 space-y-2">
            <Link
              className="block rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold"
              href={`/dashboard/${config.slug}#overview`}
            >
              Overview
            </Link>

            <Link className={menuClass} href={`/dashboard/${config.slug}#activities`}>
              Activities
            </Link>

            <Link className={menuClass} href={`/dashboard/${config.slug}#reports`}>
              Reports
            </Link>

            <Link className={menuClass} href="/dashboard/social">
              Social feed
            </Link>

            <Link className={menuClass} href="/dashboard/social#leaderboard">
              Leaderboard
            </Link>
          </nav>
        </aside>

        <section className="min-w-0">
          <div
            className="scroll-mt-6 rounded-3xl bg-gradient-to-r from-emerald-800 to-emerald-600 p-8 text-white"
            id="overview"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-100">
              {user.designation ?? formatRole(user.role)}
            </p>
            <h2 className="mt-3 text-3xl font-semibold">{config.title}</h2>
            <p className="mt-3 max-w-3xl text-emerald-50/80">
              {config.description}
            </p>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {config.metrics.map((metric) => (
              <article className="rounded-2xl border bg-white p-5 shadow-sm" key={metric.label}>
                <p className="text-sm text-slate-500">{metric.label}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">{metric.value}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-950">
                Department responsibilities
              </h3>
              <div className="mt-5 space-y-3">
                {config.responsibilities.map((responsibility) => (
                  <div
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                    key={responsibility}
                  >
                    {responsibility}
                  </div>
                ))}
              </div>
            </article>

            <article className="scroll-mt-6 rounded-2xl border bg-white p-6 shadow-sm" id="reports">
              <h3 className="text-lg font-semibold text-slate-950">Reports</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Department records submitted below are included automatically in
                the organization admin carbon report and governance checks.
              </p>
              <Link
                className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                href="/dashboard/social"
              >
                Open sustainability feed
              </Link>
            </article>
          </div>

          <div className="scroll-mt-6" id="activities">
            {config.code === "TRN" ? (
              <TransportActivityPanel />
            ) : (
              <DepartmentActivityPanel />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function formatRole(role: string) {
  return role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

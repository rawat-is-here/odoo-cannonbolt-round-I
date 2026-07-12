import Link from "next/link";
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
            <p className="text-sm font-semibold text-emerald-700">
              EcoSphere
            </p>

            <h1 className="text-xl font-semibold text-slate-950">
              {organizationName}
            </h1>
          </div>

          <div className="text-right">
            <p className="font-semibold text-slate-950">{user.name}</p>
            <p className="text-sm text-slate-500">
              {formatRole(user.role)}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl bg-slate-950 p-5 text-white">
          <p className="text-lg font-semibold">EcoSphere</p>

          <nav className="mt-8 space-y-2">
            <Link
              className="block rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold"
              href={`/dashboard/${config.slug}`}
            >
              Overview
            </Link>

            <button
              className="block w-full rounded-xl px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/10"
              type="button"
            >
              Activities
            </button>

            <button
              className="block w-full rounded-xl px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/10"
              type="button"
            >
              Reports
            </button>

            <button
              className="block w-full rounded-xl px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/10"
              type="button"
            >
              Notifications
            </button>
          </nav>
        </aside>

        <section>
          <div className="rounded-3xl bg-gradient-to-r from-emerald-800 to-emerald-600 p-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-100">
              {user.designation ?? formatRole(user.role)}
            </p>

            <h2 className="mt-3 text-3xl font-semibold">
              {config.title}
            </h2>

            <p className="mt-3 max-w-3xl text-emerald-50/80">
              {config.description}
            </p>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {config.metrics.map((metric) => (
              <article
                className="rounded-2xl border bg-white p-5 shadow-sm"
                key={metric.label}
              >
                <p className="text-sm text-slate-500">
                  {metric.label}
                </p>

                <p className="mt-3 text-2xl font-semibold text-slate-950">
                  {metric.value}
                </p>
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

            <article className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-950">
                Recent activity
              </h3>

              <div className="mt-8 rounded-xl border border-dashed p-8 text-center">
                <p className="font-medium text-slate-900">
                  No activity recorded yet
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Department records will appear here.
                </p>
              </div>
            </article>
          </div>
          {config.code === "TRN" ? <TransportActivityPanel /> : null}
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
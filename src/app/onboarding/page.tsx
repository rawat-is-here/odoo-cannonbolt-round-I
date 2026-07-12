import Link from "next/link";

export default function OnboardingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-4xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
            EcoSphere onboarding
          </p>

          <h1 className="mt-3 text-4xl font-semibold text-slate-950">
            How would you like to continue?
          </h1>

          <p className="mt-4 text-slate-600">
            Create a new company workspace or join an existing organization as
            an employee.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Link
            href="/onboarding/organization"
            className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-xl font-semibold text-emerald-800">
              O
            </div>

            <h2 className="mt-6 text-2xl font-semibold text-slate-950">
              Create an organization
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Create a new ESG workspace, configure your company and become its
              organization administrator.
            </p>

            <p className="mt-6 font-semibold text-emerald-700">
              Create organization →
            </p>
          </Link>

          <Link
            href="/onboarding/join"
            className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl font-semibold text-blue-800">
              E
            </div>

            <h2 className="mt-6 text-2xl font-semibold text-slate-950">
              Join as an employee
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Join an existing company using the organization code provided by
              its administrator.
            </p>

            <p className="mt-6 font-semibold text-blue-700">
              Join organization →
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
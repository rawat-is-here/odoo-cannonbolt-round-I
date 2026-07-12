import Link from "next/link";

const capabilities = [
  {
    title: "Environmental intelligence",
    description:
      "Measure carbon emissions from transport, purchases, manufacturing, expenses and operational activities.",
    label: "E",
  },
  {
    title: "Social participation",
    description:
      "Manage CSR initiatives, employee participation, training, diversity and sustainability challenges.",
    label: "S",
  },
  {
    title: "Governance visibility",
    description:
      "Track policies, acknowledgements, audits, compliance issues, owners and deadlines.",
    label: "G",
  },
];

const highlights = [
  {
    value: "3",
    label: "ESG pillars connected",
  },
  {
    value: "9",
    label: "Departments created automatically",
  },
  {
    value: "1",
    label: "Unified organization dashboard",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link className="flex items-center gap-3" href="/">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400 text-lg font-bold text-emerald-950">
              E
            </span>

            <div>
              <p className="font-semibold">EcoSphere</p>
              <p className="text-xs text-slate-400">
                ESG Management Platform
              </p>
            </div>
          </Link>

          <a
            className="text-sm font-medium text-slate-300 transition hover:text-white"
            href="#get-started"
          >
            Get started
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute right-0 top-10 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-32">
          <div>
            <div className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
              Enterprise sustainability, connected to daily operations
            </div>

            <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Transform operational data into measurable ESG progress.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
              EcoSphere helps organizations measure carbon impact, improve
              employee participation, manage governance compliance and monitor
              ESG performance from one unified workspace.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                className="rounded-xl bg-emerald-400 px-6 py-3.5 text-center font-semibold text-emerald-950 transition hover:bg-emerald-300"
                href="/register/organization"
              >
                Create an organization
              </Link>

              <Link
                className="rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-center font-semibold text-white transition hover:bg-white/10"
                href="/register/employee"
              >
                Join as an employee
              </Link>
            </div>

            <p className="mt-5 text-sm text-slate-400">
              Organization administrators create the company workspace.
              Employees join using a code supplied by their administrator.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">
                    Organization ESG score
                  </p>
                  <p className="mt-2 text-4xl font-semibold">82.4</p>
                </div>

                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-medium text-emerald-300">
                  Improving
                </span>
              </div>

              <div className="mt-8 space-y-5">
                <ScoreBar label="Environmental" score="78" width="78%" />
                <ScoreBar label="Social" score="86" width="86%" />
                <ScoreBar label="Governance" score="84" width="84%" />
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Carbon this month</p>
                  <p className="mt-2 text-xl font-semibold">12.8 tCO₂e</p>
                </div>

                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Open compliance issues</p>
                  <p className="mt-2 text-xl font-semibold">3</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-12 sm:grid-cols-3 lg:px-8">
          {highlights.map((highlight) => (
            <div
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
              key={highlight.label}
            >
              <p className="text-4xl font-semibold text-emerald-300">
                {highlight.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {highlight.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            One connected ESG system
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-tight">
            Built around the way organizations actually operate.
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-300">
            Instead of keeping sustainability data in disconnected
            spreadsheets, EcoSphere connects departments, employees,
            activities, emissions and compliance records.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {capabilities.map((capability) => (
            <article
              className="rounded-2xl border border-white/10 bg-white/5 p-7"
              key={capability.title}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400 text-xl font-bold text-emerald-950">
                {capability.label}
              </div>

              <h3 className="mt-6 text-xl font-semibold">
                {capability.title}
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                {capability.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="border-t border-white/10 bg-emerald-950/40"
        id="get-started"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Start your EcoSphere journey
            </p>

            <h2 className="mt-4 text-4xl font-semibold">
              Choose how you want to continue
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-300">
              Create a new organization workspace or join an existing company
              as an employee.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
            <Link
              className="group rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-8 transition hover:-translate-y-1 hover:bg-emerald-400/15"
              href="/register/organization"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400 text-xl font-bold text-emerald-950">
                O
              </div>

              <h3 className="mt-7 text-2xl font-semibold">
                Create an organization
              </h3>

              <p className="mt-4 leading-7 text-slate-300">
                Register as an organization administrator, configure your
                company and automatically create its common departments.
              </p>

              <p className="mt-7 font-semibold text-emerald-300">
                Create administrator account →
              </p>
            </Link>

            <Link
              className="group rounded-3xl border border-cyan-400/30 bg-cyan-400/10 p-8 transition hover:-translate-y-1 hover:bg-cyan-400/15"
              href="/register/employee"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300 text-xl font-bold text-cyan-950">
                E
              </div>

              <h3 className="mt-7 text-2xl font-semibold">
                Join as an employee
              </h3>

              <p className="mt-4 leading-7 text-slate-300">
                Create an employee account, enter your organization join code
                and wait for department assignment and approval.
              </p>

              <p className="mt-7 font-semibold text-cyan-300">
                Create employee account →
              </p>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>EcoSphere ESG Management Platform</p>
          <p>Measure. Improve. Report.</p>
        </div>
      </footer>
    </main>
  );
}

function ScoreBar({
  label,
  score,
  width,
}: {
  label: string;
  score: string;
  width: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-medium">{score}</span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-emerald-400"
          style={{ width }}
        />
      </div>
    </div>
  );
}
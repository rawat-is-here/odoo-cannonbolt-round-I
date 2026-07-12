"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinOrganizationPage() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const joinCode = String(formData.get("joinCode") ?? "")
      .trim()
      .toUpperCase();

    if (!joinCode) {
      setError("Organization join code is required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/organizations/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          joinCode,
        }),
      });

      const responseText = await response.text();

      let result: {
        message?: string;
      };

      try {
        result = JSON.parse(responseText) as {
          message?: string;
        };
      } catch {
        throw new Error(
          `Server returned invalid JSON. Status: ${response.status}`,
        );
      }

      if (!response.ok) {
        setError(
          result.message ?? "Unable to join the organization.",
        );
        setIsSubmitting(false);
        return;
      }

      router.push("/pending-approval");
      router.refresh();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to connect to the server.";

      console.error("Organization join error:", caughtError);
      setError(message);
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden overflow-hidden bg-emerald-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />

          <div className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative">
            <Link className="inline-flex items-center gap-3" href="/">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-xl font-bold text-emerald-950">
                E
              </span>

              <div>
                <p className="text-lg font-semibold">EcoSphere</p>
                <p className="text-sm text-emerald-100/60">
                  ESG Management Platform
                </p>
              </div>
            </Link>
          </div>

          <div className="relative max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
              Employee onboarding
            </p>

            <h1 className="mt-6 text-5xl font-semibold leading-tight tracking-tight">
              Join your organization workspace.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-emerald-100/80">
              Enter the join code provided by your organization
              administrator. Your account will remain pending until the
              administrator approves and assigns your department.
            </p>

            <div className="mt-10 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="font-semibold text-emerald-100">
                  Step 1
                </p>
                <p className="mt-1 text-sm text-emerald-100/70">
                  Enter your organization join code.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="font-semibold text-emerald-100">
                  Step 2
                </p>
                <p className="mt-1 text-sm text-emerald-100/70">
                  Wait for administrator approval.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="font-semibold text-emerald-100">
                  Step 3
                </p>
                <p className="mt-1 text-sm text-emerald-100/70">
                  Access your assigned department dashboard.
                </p>
              </div>
            </div>
          </div>

          <p className="relative text-sm text-emerald-100/55">
            Measure. Improve. Report.
          </p>
        </div>

        <div className="flex items-center bg-slate-50 px-5 py-10 sm:px-10 lg:px-14">
          <div className="mx-auto w-full max-w-lg">
            <div className="mb-8 lg:hidden">
              <Link
                className="inline-flex items-center gap-3"
                href="/"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 font-bold text-white">
                  E
                </span>

                <div>
                  <p className="font-semibold text-slate-950">
                    EcoSphere
                  </p>

                  <p className="text-xs text-slate-500">
                    ESG Management Platform
                  </p>
                </div>
              </Link>
            </div>

            <Link
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              href="/"
            >
              <span aria-hidden="true">←</span>
              Back to home
            </Link>

            <div className="mt-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Join organization
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Enter your organization code
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Ask your organization administrator for the join code shown
                on their employee management page.
              </p>
            </div>

            <form
              className="mt-8 space-y-5"
              onSubmit={handleSubmit}
            >
              <div>
                <label
                  className="mb-2 block text-sm font-medium text-slate-700"
                  htmlFor="joinCode"
                >
                  Organization join code
                </label>

                <input
                  autoCapitalize="characters"
                  autoComplete="off"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-lg uppercase tracking-wider text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  id="joinCode"
                  name="joinCode"
                  placeholder="EXAMPLE-123456"
                  required
                  type="text"
                />
              </div>

              {error ? (
                <div
                  className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  role="alert"
                >
                  {error}
                </div>
              ) : null}

              <button
                className="flex w-full items-center justify-center rounded-xl bg-emerald-700 px-5 py-3.5 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting
                  ? "Joining organization..."
                  : "Submit join request"}
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="font-semibold text-amber-950">
                Approval is required
              </p>

              <p className="mt-2 text-sm leading-6 text-amber-900">
                After submitting the code, your account will remain pending
                until the organization administrator assigns your role and
                department.
              </p>
            </div>

            <p className="mt-7 text-center text-sm text-slate-600">
              Already submitted a request?{" "}
              <Link
                className="font-semibold text-emerald-700 hover:text-emerald-800"
                href="/pending-approval"
              >
                Check approval status
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
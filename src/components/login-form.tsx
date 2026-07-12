"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();

    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setError("Email and password are required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(
          result.error.message ?? "Invalid email or password.",
        );
        setIsSubmitting(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to sign in. Please try again.");
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
              Secure organization access
            </p>

            <h1 className="mt-6 text-5xl font-semibold leading-tight tracking-tight">
              Sign in to your ESG workspace.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-emerald-100/80">
              Access the dashboard assigned to your role and department,
              submit ESG activity data and monitor organizational progress.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-semibold text-emerald-300">
                  E
                </p>

                <p className="mt-2 text-sm leading-5 text-emerald-50/75">
                  Environmental tracking
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-semibold text-emerald-300">
                  S
                </p>

                <p className="mt-2 text-sm leading-5 text-emerald-50/75">
                  Social participation
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-semibold text-emerald-300">
                  G
                </p>

                <p className="mt-2 text-sm leading-5 text-emerald-50/75">
                  Governance compliance
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
                Welcome back
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Sign in to EcoSphere
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Use the same credentials you entered during account
                registration.
              </p>
            </div>

            <form
              className="mt-8 space-y-5"
              onSubmit={handleSubmit}
            >
              <div>
                <label
                  className="mb-2 block text-sm font-medium text-slate-700"
                  htmlFor="email"
                >
                  Email address
                </label>

                <input
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  id="email"
                  name="email"
                  placeholder="employee@company.com"
                  required
                  type="email"
                />
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium text-slate-700"
                  htmlFor="password"
                >
                  Password
                </label>

                <input
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  type="password"
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
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="mt-8 border-t border-slate-200 pt-6">
              <p className="text-center text-sm text-slate-600">
                Do not have an account?
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  href="/register/organization"
                >
                  Create organization
                </Link>

                <Link
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  href="/register/employee"
                >
                  Join as employee
                </Link>
              </div>
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
              Pending employees can sign in, but dashboard access remains
              blocked until an organization administrator approves them.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
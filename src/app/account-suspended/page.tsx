import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AccountSuspendedPage() {
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
      status: true,
      name: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.status !== "SUSPENDED") {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5">
      <section className="w-full max-w-xl rounded-3xl bg-white p-10 text-center shadow-2xl">
        <div className="text-5xl">🔒</div>

        <h1 className="mt-6 text-3xl font-semibold text-slate-950">
          Account suspended
        </h1>

        <p className="mt-4 leading-7 text-slate-600">
          {user.name}, your organization access has been suspended. Contact
          your organization administrator for assistance.
        </p>

        <Link
          className="mt-8 inline-flex rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          href="/"
        >
          Return home
        </Link>
      </section>
    </main>
  );
}
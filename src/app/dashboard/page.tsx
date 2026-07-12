import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <section className="mx-auto max-w-4xl rounded-2xl border bg-white p-8 shadow-sm">
        <p className="text-sm text-gray-500">Protected dashboard</p>

        <h1 className="mt-2 text-3xl font-semibold text-gray-900">
          Welcome, {session.user.name}
        </h1>

        <p className="mt-2 text-gray-600">
          {session.user.email}
        </p>

        <div className="mt-8 rounded-xl border border-dashed p-8 text-center">
          <p className="font-medium text-gray-900">
            Authentication is working.
          </p>

          <p className="mt-2 text-sm text-gray-600">
            Only logged-in users can access this page.
          </p>
        </div>
      </section>
    </main>
  );
}
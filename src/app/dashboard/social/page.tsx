import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SocialFeed } from "@/components/dashboard/social-feed";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SocialPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { status: true, organizationId: true },
  });

  if (!user || user.status !== "ACTIVE" || !user.organizationId) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <Link className="text-sm font-semibold text-emerald-700" href="/dashboard">← Dashboard</Link>
        <h1 className="mt-4 text-3xl font-semibold text-slate-950">Social sustainability hub</h1>
        <p className="mt-2 text-slate-600">Share updates, challenges and achievements across the organization.</p>
        <div className="mt-8"><SocialFeed /></div>
      </div>
    </main>
  );
}

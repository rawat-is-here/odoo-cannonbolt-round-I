import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { GovernancePanel } from "@/components/dashboard/governance-panel";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function GovernancePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, status: true, organizationId: true },
  });

  if (!admin || admin.role !== "ORG_ADMIN" || admin.status !== "ACTIVE" || !admin.organizationId) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <Link className="text-sm font-semibold text-emerald-700" href="/dashboard/admin">← Admin dashboard</Link>
        <h1 className="mt-4 text-3xl font-semibold text-slate-950">Governance emission policies</h1>
        <p className="mt-2 text-slate-600">Track departments approaching or exceeding policy limits.</p>
        <div className="mt-8"><GovernancePanel /></div>
      </div>
    </main>
  );
}

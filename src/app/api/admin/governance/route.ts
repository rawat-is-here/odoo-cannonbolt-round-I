import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, status: true, organizationId: true },
  });
}

export async function GET() {
  try {
    const admin = await getAdmin();

    if (
      !admin ||
      admin.role !== "ORG_ADMIN" ||
      admin.status !== "ACTIVE" ||
      !admin.organizationId
    ) {
      return NextResponse.json({ message: "Admin access required." }, { status: 403 });
    }

    const policies = await prisma.emissionPolicy.findMany({
      where: { organizationId: admin.organizationId, active: true },
      include: { department: { select: { id: true, name: true, code: true } } },
      orderBy: { department: { name: "asc" } },
    });

    const results = await Promise.all(
      policies.map(async (policy) => {
        const from = new Date();
        from.setDate(from.getDate() - policy.periodDays);
        from.setHours(0, 0, 0, 0);

        const aggregate = await prisma.carbonRecord.aggregate({
          where: {
            organizationId: admin.organizationId!,
            departmentId: policy.departmentId,
            occurredAt: { gte: from },
          },
          _sum: { co2eAmount: true },
          _count: { id: true },
        });

        const emissions = Number(aggregate._sum.co2eAmount ?? 0);
        const limit = Number(policy.limitKgCo2e);
        const percentage = limit > 0 ? (emissions / limit) * 100 : 0;
        const state =
          percentage >= 100 ? "EXCEEDED" : percentage >= policy.warningPercent ? "WARNING" : "NORMAL";

        return {
          id: policy.id,
          name: policy.name,
          periodDays: policy.periodDays,
          limitKgCo2e: limit,
          warningPercent: policy.warningPercent,
          department: policy.department,
          emissions,
          percentage,
          remaining: Math.max(limit - emissions, 0),
          recordCount: aggregate._count.id,
          state,
        };
      }),
    );

    const departments = await prisma.department.findMany({
      where: { organizationId: admin.organizationId, status: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ policies: results, departments });
  } catch (error) {
    console.error("Governance GET failed:", error);
    return NextResponse.json({ message: "Unable to load governance policies." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdmin();

    if (
      !admin ||
      admin.role !== "ORG_ADMIN" ||
      admin.status !== "ACTIVE" ||
      !admin.organizationId
    ) {
      return NextResponse.json({ message: "Admin access required." }, { status: 403 });
    }

    const body = (await request.json()) as {
      departmentId?: string;
      name?: string;
      periodDays?: number;
      limitKgCo2e?: number;
      warningPercent?: number;
    };

    const departmentId = body.departmentId?.trim();
    const name = body.name?.trim();
    const periodDays = Number(body.periodDays);
    const limitKgCo2e = Number(body.limitKgCo2e);
    const warningPercent = Number(body.warningPercent ?? 80);

    if (
      !departmentId ||
      !name ||
      ![1, 7, 28, 365].includes(periodDays) ||
      !Number.isFinite(limitKgCo2e) ||
      limitKgCo2e <= 0 ||
      warningPercent < 1 ||
      warningPercent > 99
    ) {
      return NextResponse.json({ message: "Invalid policy values." }, { status: 400 });
    }

    const department = await prisma.department.findFirst({
      where: { id: departmentId, organizationId: admin.organizationId, status: true },
      select: { id: true },
    });

    if (!department) {
      return NextResponse.json({ message: "Department not found." }, { status: 404 });
    }

    const policy = await prisma.emissionPolicy.upsert({
      where: {
        organizationId_departmentId_periodDays: {
          organizationId: admin.organizationId,
          departmentId,
          periodDays,
        },
      },
      update: { name, limitKgCo2e, warningPercent, active: true },
      create: {
        organizationId: admin.organizationId,
        departmentId,
        name,
        periodDays,
        limitKgCo2e,
        warningPercent,
      },
    });

    return NextResponse.json({ message: "Emission policy saved.", policy }, { status: 201 });
  } catch (error) {
    console.error("Governance POST failed:", error);
    return NextResponse.json({ message: "Unable to save governance policy." }, { status: 500 });
  }
}

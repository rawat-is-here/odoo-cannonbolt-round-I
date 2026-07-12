import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const RANGE_DAYS = {
  "1d": 1,
  "7d": 7,
  "28d": 28,
  "365d": 365,
} as const;

type RangeKey = keyof typeof RANGE_DAYS;

function isRangeKey(value: string): value is RangeKey {
  return value in RANGE_DAYS;
}

function startOfHour(date: Date) {
  const result = new Date(date);
  result.setMinutes(0, 0, 0);
  return result;
}

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function createTimeline(range: RangeKey, now: Date) {
  if (range === "1d") {
    const points = [];

    for (let index = 23; index >= 0; index -= 1) {
      const date = startOfHour(now);
      date.setHours(date.getHours() - index);

      points.push({
        key: date.toISOString().slice(0, 13),
        label: date.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        emissions: 0,
      });
    }

    return points;
  }

  const days = RANGE_DAYS[range];
  const points = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = startOfDay(now);
    date.setDate(date.getDate() - index);

    points.push({
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
      emissions: 0,
    });
  }

  return points;
}

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 },
      );
    }

    const admin = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        role: true,
        status: true,
        organizationId: true,
      },
    });

    if (
      !admin ||
      admin.role !== "ORG_ADMIN" ||
      admin.status !== "ACTIVE" ||
      !admin.organizationId
    ) {
      return NextResponse.json(
        { message: "Organization administrator access is required." },
        { status: 403 },
      );
    }

    const url = new URL(request.url);
    const requestedRange = url.searchParams.get("range") ?? "7d";

    const range: RangeKey = isRangeKey(requestedRange)
      ? requestedRange
      : "7d";

    const now = new Date();
    const startDate = new Date(now);

    if (range === "1d") {
      startDate.setHours(startDate.getHours() - 23);
      startDate.setMinutes(0, 0, 0);
    } else {
      startDate.setDate(
        startDate.getDate() - (RANGE_DAYS[range] - 1),
      );
      startDate.setHours(0, 0, 0, 0);
    }

    const records = await prisma.carbonRecord.findMany({
      where: {
        organizationId: admin.organizationId,
        occurredAt: {
          gte: startDate,
          lte: now,
        },
      },
      select: {
        co2eAmount: true,
        scope: true,
        occurredAt: true,
        department: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        occurredAt: "asc",
      },
    });

    const timeline = createTimeline(range, now);
    const timelineMap = new Map(
      timeline.map((point) => [point.key, point]),
    );

    let totalEmissions = 0;

    const scopeTotals = {
      SCOPE_1: 0,
      SCOPE_2: 0,
      SCOPE_3: 0,
    };

    const departmentTotals: Record<string, number> = {};

    for (const record of records) {
      const emission = Number(record.co2eAmount);

      totalEmissions += emission;
      scopeTotals[record.scope] += emission;

      const departmentName =
        record.department?.name ?? "Unassigned";

      departmentTotals[departmentName] =
        (departmentTotals[departmentName] ?? 0) + emission;

      const key =
        range === "1d"
          ? record.occurredAt.toISOString().slice(0, 13)
          : record.occurredAt.toISOString().slice(0, 10);

      const point = timelineMap.get(key);

      if (point) {
        point.emissions += emission;
      }
    }

    return NextResponse.json({
      range,
      summary: {
        totalEmissions,
        recordCount: records.length,
        averageEmission:
          records.length > 0
            ? totalEmissions / records.length
            : 0,
      },
      scopeTotals,
      departmentTotals: Object.entries(departmentTotals)
        .map(([department, emissions]) => ({
          department,
          emissions,
        }))
        .sort((a, b) => b.emissions - a.emissions),
      timeline,
    });
  } catch (error) {
    console.error("Unable to load carbon analytics:", error);

    return NextResponse.json(
      { message: "Unable to load carbon analytics." },
      { status: 500 },
    );
  }
}
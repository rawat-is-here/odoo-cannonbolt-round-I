import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TRUCK_TYPE_TO_ACTIVITY_CODE = {
  LIGHT_DIESEL: "TRUCK_DIESEL_LIGHT_TONNE_KM",
  MEDIUM_DIESEL: "TRUCK_DIESEL_MEDIUM_TONNE_KM",
  HEAVY_DIESEL: "TRUCK_DIESEL_HEAVY_TONNE_KM",
  ELECTRIC: "TRUCK_ELECTRIC_TONNE_KM",
} as const;

type TruckType = keyof typeof TRUCK_TYPE_TO_ACTIVITY_CODE;

function isTruckType(value: string): value is TruckType {
  return value in TRUCK_TYPE_TO_ACTIVITY_CODE;
}

async function getTransportUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  return prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      role: true,
      status: true,
      organizationId: true,
      departmentId: true,
      department: {
        select: {
          code: true,
        },
      },
    },
  });
}

export async function GET() {
  try {
    const user = await getTransportUser();

    if (
      !user ||
      user.status !== "ACTIVE" ||
      !user.organizationId ||
      !user.departmentId ||
      user.department?.code !== "TRN"
    ) {
      return NextResponse.json(
        { message: "Active Transport department access is required." },
        { status: 403 },
      );
    }

    const records = await prisma.carbonRecord.findMany({
      where: {
        organizationId: user.organizationId,
        departmentId: user.departmentId,

        ...(user.role === "DEPARTMENT_MANAGER"
          ? {}
          : {
              submittedById: user.id,
            }),
      },
      select: {
        id: true,
        activityName: true,
        activityAmount: true,
        activityUnit: true,
        co2eAmount: true,
        co2eUnit: true,
        occurredAt: true,
        submittedAt: true,
        status: true,
        activityData: true,
      },
      orderBy: {
        submittedAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json({
      records: records.map((record) => ({
        ...record,
        activityAmount: record.activityAmount.toString(),
        co2eAmount: record.co2eAmount.toString(),
        activityData: record.activityData
          ? JSON.parse(record.activityData)
          : null,
      })),
    });
  } catch (error) {
    console.error("Unable to load transport activities:", error);

    return NextResponse.json(
      { message: "Unable to load transport activities." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getTransportUser();

    if (
      !user ||
      user.status !== "ACTIVE" ||
      !user.organizationId ||
      !user.departmentId ||
      user.department?.code !== "TRN"
    ) {
      return NextResponse.json(
        { message: "Active Transport department access is required." },
        { status: 403 },
      );
    }

    const body = (await request.json()) as {
      truckIdentifier?: string;
      truckType?: string;
      loadKg?: string | number;
      distanceKm?: string | number;
      tripCount?: string | number;
      occurredAt?: string;
      origin?: string;
      destination?: string;
      notes?: string;
    };

    const truckIdentifier = body.truckIdentifier?.trim();
    const truckType = body.truckType?.trim() ?? "";
    const origin = body.origin?.trim() || null;
    const destination = body.destination?.trim() || null;
    const notes = body.notes?.trim() || null;
    const occurredAtInput = body.occurredAt?.trim();

    if (
      !truckIdentifier ||
      !isTruckType(truckType) ||
      !occurredAtInput
    ) {
      return NextResponse.json(
        {
          message:
            "Truck, truck type and activity date are required.",
        },
        { status: 400 },
      );
    }

    let loadKg: Prisma.Decimal;
    let distanceKm: Prisma.Decimal;
    let tripCount: Prisma.Decimal;

    try {
      loadKg = new Prisma.Decimal(String(body.loadKg ?? ""));
      distanceKm = new Prisma.Decimal(
        String(body.distanceKm ?? ""),
      );
      tripCount = new Prisma.Decimal(
        String(body.tripCount ?? ""),
      );
    } catch {
      return NextResponse.json(
        {
          message:
            "Load, distance and trip count must be valid numbers.",
        },
        { status: 400 },
      );
    }

    if (
      loadKg.lte(0) ||
      loadKg.gt(100000000) ||
      distanceKm.lte(0) ||
      distanceKm.gt(1000000) ||
      tripCount.lte(0) ||
      tripCount.gt(100000)
    ) {
      return NextResponse.json(
        {
          message:
            "Load, distance and trip count must be positive and within the permitted range.",
        },
        { status: 400 },
      );
    }

    if (!tripCount.isInteger()) {
      return NextResponse.json(
        { message: "Trip count must be a whole number." },
        { status: 400 },
      );
    }

    const occurredAt = new Date(
      `${occurredAtInput}T12:00:00.000Z`,
    );

    if (Number.isNaN(occurredAt.getTime())) {
      return NextResponse.json(
        { message: "Invalid activity date." },
        { status: 400 },
      );
    }

    const now = new Date();

    if (occurredAt.getTime() > now.getTime()) {
      return NextResponse.json(
        { message: "Activity date cannot be in the future." },
        { status: 400 },
      );
    }

    const activityCode =
      TRUCK_TYPE_TO_ACTIVITY_CODE[truckType];

    const factor = await prisma.emissionFactor.findFirst({
      where: {
        activityCode,
        status: "ACTIVE",
        departmentCode: "TRN",
        OR: [
          {
            organizationId: user.organizationId,
          },
          {
            organizationId: null,
          },
        ],
      },
      orderBy: [
        {
          organizationId: "desc",
        },
        {
          sourceYear: "desc",
        },
      ],
    });

    if (!factor) {
      return NextResponse.json(
        {
          message:
            "No active emission factor exists for the selected truck type.",
        },
        { status: 422 },
      );
    }

    const loadTonnes = loadKg.div(1000);

    const tonneKilometres = loadTonnes
      .mul(distanceKm)
      .mul(tripCount);

    const co2eAmount = tonneKilometres.mul(
      factor.factorValue,
    );

    const factorUnit = `${factor.outputUnit}/${factor.inputUnit}`;

    const activityData = JSON.stringify({
      truckIdentifier,
      truckType,
      loadKg: loadKg.toString(),
      distanceKm: distanceKm.toString(),
      tripCount: tripCount.toString(),
      loadTonnes: loadTonnes.toString(),
      tonneKilometres: tonneKilometres.toString(),
      origin,
      destination,
    });

    const record = await prisma.carbonRecord.create({
      data: {
        organizationId: user.organizationId,
        departmentId: user.departmentId,
        submittedById: user.id,
        emissionFactorId: factor.id,

        activityCode: factor.activityCode,
        activityName: factor.activityName,
        industryCode: factor.industryCode,
        category: factor.category,
        subcategory: factor.subcategory,
        scope: factor.scope,

        activityAmount: tonneKilometres,
        activityUnit: factor.inputUnit,

        factorValue: factor.factorValue,
        factorUnit,

        co2eAmount,
        co2eUnit: factor.outputUnit,

        occurredAt,
        notes,
        activityData,

        status: "SUBMITTED",

        calculationFormula:
          `(${loadKg.toString()} kg ÷ 1000) × ` +
          `${distanceKm.toString()} km × ` +
          `${tripCount.toString()} trips × ` +
          `${factor.factorValue.toString()} ${factorUnit}`,
      },
      select: {
        id: true,
        activityName: true,
        activityAmount: true,
        activityUnit: true,
        co2eAmount: true,
        co2eUnit: true,
        status: true,
      },
    });

    return NextResponse.json(
      {
        message: "Transport activity recorded successfully.",
        calculation: {
          tonneKilometres: tonneKilometres.toString(),
          factorValue: factor.factorValue.toString(),
          co2eAmount: record.co2eAmount.toString(),
          co2eUnit: record.co2eUnit,
        },
        record: {
          ...record,
          activityAmount: record.activityAmount.toString(),
          co2eAmount: record.co2eAmount.toString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Unable to create transport activity:", error);

    return NextResponse.json(
      { message: "Unable to record transport activity." },
      { status: 500 },
    );
  }
}
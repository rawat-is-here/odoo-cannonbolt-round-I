import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getCurrentEmployee() {
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
          name: true,
        },
      },
    },
  });
}

export async function GET() {
  try {
    const user = await getCurrentEmployee();

    if (
      !user ||
      user.status !== "ACTIVE" ||
      !user.organizationId ||
      !user.departmentId ||
      !user.department
    ) {
      return NextResponse.json(
        {
          message:
            "Active employee access and an assigned department are required.",
        },
        { status: 403 },
      );
    }

    const [factors, records] = await Promise.all([
      prisma.emissionFactor.findMany({
        where: {
          status: "ACTIVE",
          departmentCode: user.department.code,
          OR: [
            {
              organizationId: user.organizationId,
            },
            {
              organizationId: null,
            },
          ],
        },
        select: {
          id: true,
          activityCode: true,
          activityName: true,
          category: true,
          subcategory: true,
          scope: true,
          inputUnit: true,
          outputUnit: true,
          factorValue: true,
          description: true,
        },
        orderBy: [
          {
            category: "asc",
          },
          {
            activityName: "asc",
          },
        ],
      }),

      prisma.carbonRecord.findMany({
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
          category: true,
          scope: true,
          activityAmount: true,
          activityUnit: true,
          co2eAmount: true,
          co2eUnit: true,
          occurredAt: true,
          submittedAt: true,
          status: true,
          notes: true,
        },
        orderBy: {
          submittedAt: "desc",
        },
        take: 50,
      }),
    ]);

    return NextResponse.json({
      department: user.department,
      factors: factors.map((factor) => ({
        ...factor,
        factorValue: factor.factorValue.toString(),
      })),
      records: records.map((record) => ({
        ...record,
        activityAmount: record.activityAmount.toString(),
        co2eAmount: record.co2eAmount.toString(),
      })),
    });
  } catch (error) {
    console.error("Unable to load department activities:", error);

    return NextResponse.json(
      { message: "Unable to load department activities." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentEmployee();

    if (
      !user ||
      user.status !== "ACTIVE" ||
      !user.organizationId ||
      !user.departmentId ||
      !user.department
    ) {
      return NextResponse.json(
        {
          message:
            "Active employee access and an assigned department are required.",
        },
        { status: 403 },
      );
    }

    const body = (await request.json()) as {
      emissionFactorId?: string;
      activityAmount?: string | number;
      occurredAt?: string;
      notes?: string;
    };

    const emissionFactorId =
      body.emissionFactorId?.trim();

    const rawAmount = String(
      body.activityAmount ?? "",
    ).trim();

    const occurredAtInput = body.occurredAt?.trim();
    const notes = body.notes?.trim() || null;

    if (
      !emissionFactorId ||
      !rawAmount ||
      !occurredAtInput
    ) {
      return NextResponse.json(
        {
          message:
            "Activity type, amount and activity date are required.",
        },
        { status: 400 },
      );
    }

    let activityAmount: Prisma.Decimal;

    try {
      activityAmount = new Prisma.Decimal(rawAmount);
    } catch {
      return NextResponse.json(
        { message: "Activity amount must be a valid number." },
        { status: 400 },
      );
    }

    if (
      !activityAmount.isFinite() ||
      activityAmount.lte(0) ||
      activityAmount.gt("1000000000000")
    ) {
      return NextResponse.json(
        {
          message:
            "Activity amount must be greater than zero and within the permitted range.",
        },
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

    if (occurredAt.getTime() > Date.now()) {
      return NextResponse.json(
        { message: "Activity date cannot be in the future." },
        { status: 400 },
      );
    }

    const organizationFactor =
      await prisma.emissionFactor.findFirst({
        where: {
          id: emissionFactorId,
          organizationId: user.organizationId,
          departmentCode: user.department.code,
          status: "ACTIVE",
        },
      });

    const globalFactor =
      await prisma.emissionFactor.findFirst({
        where: {
          id: emissionFactorId,
          organizationId: null,
          departmentCode: user.department.code,
          status: "ACTIVE",
        },
      });

    const factor = organizationFactor ?? globalFactor;

    if (!factor) {
      return NextResponse.json(
        {
          message:
            "The selected emission activity is not available for your department.",
        },
        { status: 404 },
      );
    }

    const co2eAmount = activityAmount.mul(
      factor.factorValue,
    );

    const factorUnit =
      `${factor.outputUnit}/${factor.inputUnit}`;

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

        activityAmount,
        activityUnit: factor.inputUnit,

        factorValue: factor.factorValue,
        factorUnit,

        co2eAmount,
        co2eUnit: factor.outputUnit,

        calculationFormula:
          `${activityAmount.toString()} ${factor.inputUnit} × ` +
          `${factor.factorValue.toString()} ${factorUnit}`,

        occurredAt,
        notes,
        status: "SUBMITTED",
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
        message: "Carbon activity recorded successfully.",
        calculation: {
          activityAmount:
            record.activityAmount.toString(),
          activityUnit: record.activityUnit,
          co2eAmount: record.co2eAmount.toString(),
          co2eUnit: record.co2eUnit,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Unable to create department activity:", error);

    return NextResponse.json(
      { message: "Unable to record carbon activity." },
      { status: 500 },
    );
  }
}
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_ROLES = ["EMPLOYEE", "DEPARTMENT_MANAGER"] as const;
const ALLOWED_STATUSES = ["PENDING", "ACTIVE", "SUSPENDED"] as const;

async function getCurrentAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      role: true,
      organizationId: true,
      status: true,
    },
  });

  if (
    !user ||
    user.role !== "ORG_ADMIN" ||
    user.status !== "ACTIVE" ||
    !user.organizationId
  ) {
    return null;
  }

  return user;
}

export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Administrator access is required." },
        { status: 403 },
      );
    }
    const organizationId = admin.organizationId;

if (!organizationId) {
  return NextResponse.json(
    { message: "Administrator organization was not found." },
    { status: 400 },
  );
}

    const [employees, departments] = await Promise.all([
      prisma.user.findMany({
        where: {
          organizationId,
          id: {
            not: admin.id,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          designation: true,
          employeeCode: true,
          departmentId: true,
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          createdAt: true,
        },
        orderBy: [
          {
            status: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
      }),

      prisma.department.findMany({
        where: {
          organizationId,
          status: true,
        },
        select: {
          id: true,
          name: true,
          code: true,
        },
        orderBy: {
          name: "asc",
        },
      }),
    ]);

    return NextResponse.json({
      employees,
      departments,
    });
  } catch (error) {
    console.error("Unable to load employees:", error);

    return NextResponse.json(
      { message: "Unable to load employees." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Administrator access is required." },
        { status: 403 },
      );
    }
    const organizationId = admin.organizationId;

if (!organizationId) {
  return NextResponse.json(
    { message: "Administrator organization was not found." },
    { status: 400 },
  );
}

    const body = (await request.json()) as {
      employeeId?: string;
      departmentId?: string;
      role?: string;
      status?: string;
      designation?: string;
      employeeCode?: string;
    };

    const employeeId = body.employeeId?.trim();
    const departmentId = body.departmentId?.trim();
    const role = body.role?.trim();
    const status = body.status?.trim();
    const designation = body.designation?.trim() || null;
    const employeeCode = body.employeeCode?.trim() || null;

    if (!employeeId || !departmentId || !role || !status) {
      return NextResponse.json(
        {
          message:
            "Employee, department, role and account status are required.",
        },
        { status: 400 },
      );
    }

    if (
      !ALLOWED_ROLES.includes(
        role as (typeof ALLOWED_ROLES)[number],
      )
    ) {
      return NextResponse.json(
        { message: "Invalid employee role." },
        { status: 400 },
      );
    }

    if (
      !ALLOWED_STATUSES.includes(
        status as (typeof ALLOWED_STATUSES)[number],
      )
    ) {
      return NextResponse.json(
        { message: "Invalid employee status." },
        { status: 400 },
      );
    }

    const employee = await prisma.user.findFirst({
      where: {
        id: employeeId,
        organizationId,
      },
      select: {
        id: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { message: "Employee was not found in your organization." },
        { status: 404 },
      );
    }

    const department = await prisma.department.findFirst({
      where: {
        id: departmentId,
        organizationId,
        status: true,
      },
      select: {
        id: true,
      },
    });

    if (!department) {
      return NextResponse.json(
        { message: "Department was not found." },
        { status: 404 },
      );
    }

    const updatedEmployee = await prisma.user.update({
      where: {
        id: employeeId,
      },
      data: {
        departmentId,
        role,
        status:
          status as "PENDING" | "ACTIVE" | "SUSPENDED",
        designation,
        employeeCode,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        designation: true,
        employeeCode: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Employee access updated successfully.",
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error("Unable to update employee:", error);

    return NextResponse.json(
      { message: "Unable to update employee." },
      { status: 500 },
    );
  }
}
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_DEPARTMENTS = [
  {
    name: "Administration",
    code: "ADMIN",
    description: "Company administration and organizational management",
  },
  {
    name: "Human Resources",
    code: "HR",
    description: "Employee management, training and CSR activities",
  },
  {
    name: "Finance",
    code: "FIN",
    description: "Financial operations and ESG budgeting",
  },
  {
    name: "Purchase",
    code: "PUR",
    description: "Procurement and supplier operations",
  },
  {
    name: "Manufacturing",
    code: "MFG",
    description: "Manufacturing and production activities",
  },
  {
    name: "Transport",
    code: "TRN",
    description: "Transport, logistics and fleet activities",
  },
  {
    name: "Warehouse",
    code: "WH",
    description: "Inventory storage and warehouse operations",
  },
  {
    name: "Compliance",
    code: "COMP",
    description: "Policies, audits and compliance management",
  },
  {
    name: "Sustainability",
    code: "ESG",
    description: "ESG goals, reporting and sustainability management",
  },
];

function createSlug(name: string) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}
function createJoinCode(name: string): string {
  const prefix = name
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 6)
    .toUpperCase();

  const randomPart = crypto.randomUUID().slice(0, 6).toUpperCase();

  return `${prefix}-${randomPart}`;
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { message: "You must be logged in." },
        { status: 401 },
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        organizationId: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { message: "User account not found." },
        { status: 404 },
      );
    }

    if (currentUser.organizationId) {
      return NextResponse.json(
        { message: "You already belong to an organization." },
        { status: 409 },
      );
    }

    const body = (await request.json()) as {
      name?: string;
      legalName?: string;
      gstin?: string;
      industry?: string;
      country?: string;
      companySize?: string;
    };

    const name = body.name?.trim();
    const legalName = body.legalName?.trim() || null;
    const gstin = body.gstin?.trim().toUpperCase() || null;
    const industry = body.industry?.trim() || null;
    const country = body.country?.trim() || "India";
    const companySize = body.companySize?.trim() || null;

    if (!name || name.length < 2) {
      return NextResponse.json(
        { message: "Organization name is required." },
        { status: 400 },
      );
    }

    if (gstin) {
      const existingOrganization = await prisma.organization.findUnique({
        where: {
          gstin,
        },
      });

      if (existingOrganization) {
        return NextResponse.json(
          { message: "An organization with this GSTIN already exists." },
          { status: 409 },
        );
      }
    }

    const organization = await prisma.$transaction(async (tx) => {
      const createdOrganization = await tx.organization.create({
        data: {
          name,
          legalName,
          slug: createSlug(name),
          joinCode: createJoinCode(name),
          gstin,
          industry,
          country,
          companySize,
          departments: {
            create: DEFAULT_DEPARTMENTS,
          },
        },
      });

      const adminDepartment = await tx.department.findUnique({
        where: {
          organizationId_code: {
            organizationId: createdOrganization.id,
            code: "ADMIN",
          },
        },
      });

      await tx.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          organizationId: createdOrganization.id,
          departmentId: adminDepartment?.id ?? null,
          role: "ORG_ADMIN",
          status: "ACTIVE",
          designation: "Organization Administrator",
        },
      });

      return createdOrganization;
    });

    return NextResponse.json(
      {
        message: "Organization created successfully.",
        organization,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Organization onboarding failed:", error);

    return NextResponse.json(
      { message: "Unable to create organization." },
      { status: 500 },
    );
  }
}
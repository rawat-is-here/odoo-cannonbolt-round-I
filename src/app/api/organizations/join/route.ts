import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { message: "You must sign in first." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      joinCode?: string;
    };

    const joinCode = body.joinCode?.trim().toUpperCase();

    if (!joinCode) {
      return NextResponse.json(
        { message: "Organization join code is required." },
        { status: 400 },
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        organizationId: true,
        role: true,
        status: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { message: "User account was not found." },
        { status: 404 },
      );
    }

    if (currentUser.organizationId) {
      return NextResponse.json(
        { message: "Your account already belongs to an organization." },
        { status: 409 },
      );
    }

    const organization = await prisma.organization.findUnique({
      where: {
        joinCode,
      },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    if (!organization || !organization.status) {
      return NextResponse.json(
        { message: "Invalid or inactive organization join code." },
        { status: 404 },
      );
    }

    await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        organizationId: organization.id,
        departmentId: null,
        role: "EMPLOYEE",
        status: "PENDING",
      },
    });

    return NextResponse.json({
      message: `Join request submitted to ${organization.name}.`,
      organization: {
        id: organization.id,
        name: organization.name,
      },
    });
  } catch (error) {
    console.error("Organization join failed:", error);

    return NextResponse.json(
      { message: "Unable to submit organization join request." },
      { status: 500 },
    );
  }
}
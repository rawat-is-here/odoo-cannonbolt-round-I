import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function currentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      role: true,
      status: true,
      organizationId: true,
      departmentId: true,
    },
  });
}

export async function GET() {
  try {
    const user = await currentUser();
    if (!user || user.status !== "ACTIVE" || !user.organizationId) {
      return NextResponse.json({ message: "Active organization access required." }, { status: 403 });
    }

    const [posts, leaderboard] = await Promise.all([
      prisma.socialPost.findMany({
        where: { organizationId: user.organizationId },
        include: {
          author: { select: { name: true, role: true, xp: true } },
          department: { select: { name: true, code: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.user.findMany({
        where: { organizationId: user.organizationId, status: "ACTIVE" },
        select: { id: true, name: true, xp: true, rewardPoints: true, department: { select: { name: true } } },
        orderBy: [{ xp: "desc" }, { name: "asc" }],
        take: 10,
      }),
    ]);

    return NextResponse.json({ posts, leaderboard, currentUserId: user.id });
  } catch (error) {
    console.error("Social GET failed:", error);
    return NextResponse.json({ message: "Unable to load social feed." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user || user.status !== "ACTIVE" || !user.organizationId) {
      return NextResponse.json({ message: "Active organization access required." }, { status: 403 });
    }

    const body = (await request.json()) as { content?: string; postType?: string };
    const content = body.content?.trim();
    const postType = body.postType?.trim() || "UPDATE";

    if (!content || content.length < 3 || content.length > 1000) {
      return NextResponse.json({ message: "Post must contain 3 to 1000 characters." }, { status: 400 });
    }

    const [post] = await prisma.$transaction([
      prisma.socialPost.create({
        data: {
          organizationId: user.organizationId,
          departmentId: user.departmentId,
          authorId: user.id,
          content,
          postType,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { xp: { increment: 5 }, rewardPoints: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ message: "Post published. +5 XP", post }, { status: 201 });
  } catch (error) {
    console.error("Social POST failed:", error);
    return NextResponse.json({ message: "Unable to publish post." }, { status: 500 });
  }
}

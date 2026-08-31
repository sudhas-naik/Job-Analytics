import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.id && !session?.user?.email) {
    return null;
  }

  return prisma.user.findFirst({
    where: session.user.id
      ? { id: session.user.id }
      : { email: session.user.email ?? "" },
    select: {
      id: true,
      name: true,
      email: true,
      profileImage: true,
      createdAt: true,
      _count: {
        select: {
          applications: true,
          interviews: true,
          resumes: true,
        },
      },
    },
  });
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
    },
    stats: {
      applications: user._count.applications,
      interviews: user._count.interviews,
      resumes: user._count.resumes,
    },
  });
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const profileImage =
      typeof body.profileImage === "string" ? body.profileImage.trim() : "";

    if (!name || !email) {
      return NextResponse.json(
        { message: "Name and email are required" },
        { status: 400 }
      );
    }

    if (email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });

      if (existing && existing.id !== user.id) {
        return NextResponse.json(
          { message: "Email is already in use" },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        email,
        profileImage: profileImage || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: "Profile updated",
      user: updated,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

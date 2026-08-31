import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id: jobId } = await params;
  const job = await prisma.job.findUnique({ where: { id: jobId } });

  if (!job) {
    return NextResponse.json({ message: "Job not found" }, { status: 404 });
  }

  const application = await prisma.application.upsert({
    where: {
      userId_jobId: {
        userId: user.id,
        jobId,
      },
    },
    create: {
      userId: user.id,
      jobId,
      status: "SAVED",
    },
    update: {},
  });

  return NextResponse.json({
    success: true,
    saved: true,
    data: application,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id: jobId } = await params;

  const existing = await prisma.application.findUnique({
    where: {
      userId_jobId: {
        userId: user.id,
        jobId,
      },
    },
  });

  if (!existing) {
    return NextResponse.json({ success: true, saved: false });
  }

  if (existing.status !== "SAVED") {
    return NextResponse.json(
      {
        message: "This job is already in your applications",
        saved: true,
      },
      { status: 409 }
    );
  }

  await prisma.application.delete({
    where: { id: existing.id },
  });

  return NextResponse.json({ success: true, saved: false });
}

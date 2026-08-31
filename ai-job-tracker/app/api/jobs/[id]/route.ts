import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      applications: {
        where: { userId: user.id },
        select: { id: true, status: true },
      },
    },
  });

  if (!job) {
    return NextResponse.json({ message: "Job not found" }, { status: 404 });
  }

  const { applications, ...jobData } = job;

  return NextResponse.json({
    success: true,
    data: {
      ...jobData,
      saved: applications.length > 0,
      applicationStatus: applications[0]?.status ?? null,
      applicationId: applications[0]?.id ?? null,
    },
  });
}

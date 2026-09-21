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

function emptyToNull(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.job.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    const body = await request.json();
    const title = emptyToNull(body.title);
    const company = emptyToNull(body.company);

    if (!title || !company) {
      return NextResponse.json(
        { message: "Title and company are required" },
        { status: 400 }
      );
    }

    const job = await prisma.job.update({
      where: { id },
      data: {
        title,
        company,
        location: emptyToNull(body.location),
        jobType: emptyToNull(body.jobType),
        salary: emptyToNull(body.salary),
        experience: emptyToNull(body.experience),
        description: emptyToNull(body.description),
        jobUrl: emptyToNull(body.jobUrl),
        source: emptyToNull(body.source),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Job updated",
      data: job,
    });
  } catch (error) {
    console.error(error);

    const code =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : "";

    if (code === "ECONNREFUSED") {
      return NextResponse.json(
        {
          message:
            "Database is not running. Start it with `npx prisma dev` and try again.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

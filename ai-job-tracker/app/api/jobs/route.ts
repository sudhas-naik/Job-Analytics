import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/require-user";

function emptyToNull(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function GET(request: Request) {
  const user = await requireUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number(searchParams.get("limit") ?? 9) || 9)
  );

  const where: Prisma.JobWhereInput = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { company: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [total, jobs] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        applications: {
          where: { userId: user.id },
          select: { id: true, status: true },
        },
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: jobs.map(({ applications, ...job }) => ({
      ...job,
      saved: applications.length > 0,
      applicationStatus: applications[0]?.status ?? null,
      applicationId: applications[0]?.id ?? null,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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

    const job = await prisma.job.create({
      data: {
        title,
        company,
        location: emptyToNull(body.location),
        jobType: emptyToNull(body.jobType),
        salary: emptyToNull(body.salary),
        experience: emptyToNull(body.experience),
        description: emptyToNull(body.description),
        jobUrl: emptyToNull(body.jobUrl),
        source: emptyToNull(body.source) ?? "Manual",
      },
    });

    return NextResponse.json(
      { success: true, message: "Job created", data: job },
      { status: 201 }
    );
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

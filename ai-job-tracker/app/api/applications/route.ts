import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import type { ApplicationStatus } from "@prisma/client";

const STATUSES: ApplicationStatus[] = [
  "SAVED",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
];

function isStatus(value: unknown): value is ApplicationStatus {
  return typeof value === "string" && STATUSES.includes(value as ApplicationStatus);
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search") || "";

    const applications = await prisma.application.findMany({
      where: {
        userId: user.id,
        ...(status && isStatus(status) ? { status } : {}),
        ...(search
          ? {
              job: {
                OR: [
                  { title: { contains: search, mode: "insensitive" } },
                  { company: { contains: search, mode: "insensitive" } },
                ],
              },
            }
          : {}),
      },
      include: {
        job: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("GET APPLICATIONS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch applications",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const jobId = typeof body.jobId === "string" ? body.jobId : "";
    const status: ApplicationStatus = isStatus(body.status)
      ? body.status
      : "APPLIED";
    const notes =
      typeof body.notes === "string" ? body.notes.trim() || null : null;
    const resumeUsed =
      typeof body.resumeUsed === "string"
        ? body.resumeUsed.trim() || null
        : null;

    if (!jobId) {
      return NextResponse.json(
        { message: "Job ID is required" },
        { status: 400 }
      );
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_jobId: {
          userId: user.id,
          jobId,
        },
      },
      include: { job: true },
    });

    if (existingApplication) {
      if (existingApplication.status === "SAVED" && status !== "SAVED") {
        const application = await prisma.application.update({
          where: { id: existingApplication.id },
          data: {
            status,
            appliedDate: new Date(),
            ...(notes !== null ? { notes } : {}),
            ...(resumeUsed !== null ? { resumeUsed } : {}),
          },
          include: { job: true },
        });

        return NextResponse.json({
          success: true,
          message: "Application updated successfully",
          data: application,
        });
      }

      return NextResponse.json(
        {
          message: "You already have an application for this job",
          data: existingApplication,
        },
        { status: 409 }
      );
    }

    const application = await prisma.application.create({
      data: {
        userId: user.id,
        jobId,
        status,
        appliedDate: status === "SAVED" ? null : new Date(),
        notes,
        resumeUsed,
      },
      include: {
        job: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Application created successfully",
        data: application,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE APPLICATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create application",
      },
      { status: 500 }
    );
  }
}

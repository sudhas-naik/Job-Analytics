import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import type { InterviewStatus } from "@prisma/client";

const STATUSES: InterviewStatus[] = ["SCHEDULED", "COMPLETED", "CANCELLED"];

function isStatus(value: unknown): value is InterviewStatus {
  return typeof value === "string" && STATUSES.includes(value as InterviewStatus);
}

function emptyToNull(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const status = request.nextUrl.searchParams.get("status");
    const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";

    const interviews = await prisma.interview.findMany({
      where: {
        userId: user.id,
        ...(status && isStatus(status) ? { status } : {}),
        ...(search
          ? {
              application: {
                job: {
                  OR: [
                    { title: { contains: search, mode: "insensitive" } },
                    { company: { contains: search, mode: "insensitive" } },
                  ],
                },
              },
            }
          : {}),
      },
      include: {
        application: {
          include: {
            job: true,
          },
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: interviews,
    });
  } catch (error) {
    console.error("GET INTERVIEWS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch interviews",
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
    const applicationId =
      typeof body.applicationId === "string" ? body.applicationId : "";
    const scheduledAt =
      typeof body.scheduledAt === "string" ? body.scheduledAt : "";
    const type = emptyToNull(body.type);
    const meetingUrl = emptyToNull(body.meetingUrl);
    const notes = emptyToNull(body.notes);

    if (!applicationId || !scheduledAt) {
      return NextResponse.json(
        { message: "Application and interview date are required" },
        { status: 400 }
      );
    }

    const scheduledDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) {
      return NextResponse.json(
        { message: "Interview date is invalid" },
        { status: 400 }
      );
    }

    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: user.id,
      },
    });

    if (!application) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      );
    }

    const interview = await prisma.interview.create({
      data: {
        userId: user.id,
        applicationId,
        type,
        scheduledAt: scheduledDate,
        meetingUrl,
        notes,
      },
      include: {
        application: {
          include: {
            job: true,
          },
        },
      },
    });

    if (
      application.status === "SAVED" ||
      application.status === "APPLIED" ||
      application.status === "SCREENING"
    ) {
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: "INTERVIEW" },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Interview scheduled successfully",
        data: interview,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE INTERVIEW ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to schedule interview",
      },
      { status: 500 }
    );
  }
}

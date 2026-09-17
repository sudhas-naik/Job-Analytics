import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import type { InterviewStatus } from "@prisma/client";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

const STATUSES: InterviewStatus[] = ["SCHEDULED", "COMPLETED", "CANCELLED"];

function isStatus(value: unknown): value is InterviewStatus {
  return typeof value === "string" && STATUSES.includes(value as InterviewStatus);
}

function emptyToNull(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const interview = await prisma.interview.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        application: {
          include: {
            job: true,
          },
        },
      },
    });

    if (!interview) {
      return NextResponse.json(
        { message: "Interview not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: interview,
    });
  } catch (error) {
    console.error("GET INTERVIEW ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch interview",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existingInterview = await prisma.interview.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingInterview) {
      return NextResponse.json(
        { message: "Interview not found" },
        { status: 404 }
      );
    }

    const scheduledAt =
      typeof body.scheduledAt === "string" && body.scheduledAt
        ? new Date(body.scheduledAt)
        : undefined;

    if (scheduledAt && Number.isNaN(scheduledAt.getTime())) {
      return NextResponse.json(
        { message: "Interview date is invalid" },
        { status: 400 }
      );
    }

    const interview = await prisma.interview.update({
      where: { id },
      data: {
        ...(body.type !== undefined && { type: emptyToNull(body.type) }),
        ...(scheduledAt && { scheduledAt }),
        ...(body.meetingUrl !== undefined && {
          meetingUrl: emptyToNull(body.meetingUrl),
        }),
        ...(body.notes !== undefined && { notes: emptyToNull(body.notes) }),
        ...(body.feedback !== undefined && {
          feedback: emptyToNull(body.feedback),
        }),
        ...(isStatus(body.status) && { status: body.status }),
      },
      include: {
        application: {
          include: {
            job: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Interview updated successfully",
      data: interview,
    });
  } catch (error) {
    console.error("UPDATE INTERVIEW ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update interview",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const interview = await prisma.interview.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!interview) {
      return NextResponse.json(
        { message: "Interview not found" },
        { status: 404 }
      );
    }

    await prisma.interview.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Interview deleted successfully",
    });
  } catch (error) {
    console.error("DELETE INTERVIEW ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete interview",
      },
      { status: 500 }
    );
  }
}

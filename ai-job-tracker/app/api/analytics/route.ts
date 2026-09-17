import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { isDatabaseUnavailable } from "@/lib/db-error";
import type { ApplicationStatus, InterviewStatus } from "@prisma/client";

const APPLICATION_STATUSES: ApplicationStatus[] = [
  "SAVED",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
];

const INTERVIEW_STATUSES: InterviewStatus[] = [
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
];

function percent(part: number, whole: number) {
  if (whole <= 0) {
    return 0;
  }
  return Number(((part / whole) * 100).toFixed(1));
}

export async function GET() {
  try {
    const user = await requireUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;

    const [
      totalJobs,
      totalApplications,
      totalInterviews,
      upcomingInterviews,
      interviewedApplications,
      reachedScreening,
      statusCounts,
      interviewStatusCounts,
      nextInterviews,
      recentApplications,
    ] = await Promise.all([
      prisma.job.count(),
      prisma.application.count({ where: { userId } }),
      prisma.interview.count({ where: { userId } }),
      prisma.interview.count({
        where: {
          userId,
          status: "SCHEDULED",
          scheduledAt: { gte: new Date() },
        },
      }),
      prisma.application.count({
        where: {
          userId,
          OR: [
            { status: { in: ["INTERVIEW", "OFFER"] } },
            { interviews: { some: {} } },
          ],
        },
      }),
      prisma.application.count({
        where: {
          userId,
          OR: [
            { status: { in: ["SCREENING", "INTERVIEW", "OFFER"] } },
            { interviews: { some: {} } },
          ],
        },
      }),
      prisma.application.groupBy({
        by: ["status"],
        where: { userId },
        _count: { status: true },
      }),
      prisma.interview.groupBy({
        by: ["status"],
        where: { userId },
        _count: { status: true },
      }),
      prisma.interview.findMany({
        where: {
          userId,
          status: "SCHEDULED",
          scheduledAt: { gte: new Date() },
        },
        orderBy: { scheduledAt: "asc" },
        take: 3,
        include: {
          application: {
            include: {
              job: {
                select: { title: true, company: true },
              },
            },
          },
        },
      }),
      prisma.application.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 4,
        include: {
          job: {
            select: { title: true, company: true },
          },
        },
      }),
    ]);

    const applicationStatuses = Object.fromEntries(
      APPLICATION_STATUSES.map((status) => [status, 0])
    ) as Record<ApplicationStatus, number>;

    for (const item of statusCounts) {
      applicationStatuses[item.status] = item._count.status;
    }

    const interviewStatuses = Object.fromEntries(
      INTERVIEW_STATUSES.map((status) => [status, 0])
    ) as Record<InterviewStatus, number>;

    for (const item of interviewStatusCounts) {
      interviewStatuses[item.status] = item._count.status;
    }

    const submittedApplications =
      totalApplications - applicationStatuses.SAVED;
    const totalOffers = applicationStatuses.OFFER;
    const totalRejected = applicationStatuses.REJECTED;

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalJobs,
          totalApplications,
          totalInterviews,
          totalOffers,
          totalRejected,
          upcomingInterviews,
        },
        applicationStatuses,
        interviewStatuses,
        rates: {
          applicationRate: percent(submittedApplications, totalApplications),
          interviewRate: percent(interviewedApplications, submittedApplications || totalApplications),
          offerRate: percent(totalOffers, submittedApplications || totalApplications),
          rejectionRate: percent(totalRejected, submittedApplications || totalApplications),
        },
        funnel: {
          applications: totalApplications,
          screening: reachedScreening,
          interviews: interviewedApplications,
          offers: totalOffers,
        },
        highlights: {
          nextInterviews: nextInterviews.map((interview) => ({
            id: interview.id,
            type: interview.type,
            scheduledAt: interview.scheduledAt,
            jobTitle: interview.application.job.title,
            company: interview.application.job.company,
          })),
          recentApplications: recentApplications.map((application) => ({
            id: application.id,
            status: application.status,
            jobTitle: application.job.title,
            company: application.job.company,
          })),
        },
      },
    });
  } catch (error) {
    console.error("ANALYTICS ERROR:", error);

    if (isDatabaseUnavailable(error)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Database is not running. Start it with `npx prisma dev` and try again.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch analytics",
      },
      { status: 500 }
    );
  }
}

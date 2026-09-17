import { NextResponse } from "next/server";
import type { ApplicationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { isDatabaseUnavailable } from "@/lib/db-error";
import {
  isApplicationStatus,
  isInterviewType,
} from "@/lib/settings-options";

type SettingsPatch = {
  emailNotifications?: boolean;
  jobAlerts?: boolean;
  interviewReminders?: boolean;
  defaultApplicationStatus?: ApplicationStatus;
  defaultInterviewType?: string;
};

async function getOrCreateSettings(userId: string) {
  return prisma.userSettings.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

function databaseErrorResponse(error: unknown, fallback: string) {
  console.error(fallback, error);

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
    { success: false, message: fallback },
    { status: 500 }
  );
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

    const settings = await getOrCreateSettings(user.id);

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    return databaseErrorResponse(error, "Failed to fetch settings");
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data: SettingsPatch = {};

    if ("emailNotifications" in body) {
      if (typeof body.emailNotifications !== "boolean") {
        return NextResponse.json(
          { success: false, message: "Invalid email notifications value" },
          { status: 400 }
        );
      }
      data.emailNotifications = body.emailNotifications;
    }

    if ("jobAlerts" in body) {
      if (typeof body.jobAlerts !== "boolean") {
        return NextResponse.json(
          { success: false, message: "Invalid job alerts value" },
          { status: 400 }
        );
      }
      data.jobAlerts = body.jobAlerts;
    }

    if ("interviewReminders" in body) {
      if (typeof body.interviewReminders !== "boolean") {
        return NextResponse.json(
          { success: false, message: "Invalid interview reminders value" },
          { status: 400 }
        );
      }
      data.interviewReminders = body.interviewReminders;
    }

    if ("defaultApplicationStatus" in body) {
      if (!isApplicationStatus(body.defaultApplicationStatus)) {
        return NextResponse.json(
          { success: false, message: "Invalid default application status" },
          { status: 400 }
        );
      }
      data.defaultApplicationStatus = body.defaultApplicationStatus;
    }

    if ("defaultInterviewType" in body) {
      if (!isInterviewType(body.defaultInterviewType)) {
        return NextResponse.json(
          { success: false, message: "Invalid default interview type" },
          { status: 400 }
        );
      }
      data.defaultInterviewType = body.defaultInterviewType;
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: data,
      create: {
        userId: user.id,
        ...data,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Settings saved",
      data: settings,
    });
  } catch (error) {
    return databaseErrorResponse(error, "Failed to save settings");
  }
}

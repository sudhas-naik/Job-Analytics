import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CalendarDays, Clock, Video } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import InterviewStatusForm from "@/app/Components/Interviews/InterviewStatusForm";
import BackButton from "@/app/Components/Layout/BackButton";

export default async function InterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();

  if (!user) {
    redirect("/Auth/Login");
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
    notFound();
  }

  const job = interview.application.job;
  const scheduled = interview.scheduledAt;

  return (
    <div className="space-y-6">
      <div>
        <BackButton href="/Interviews" label="Back to interviews" />
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          {job.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{job.company}</p>
      </div>

      <div className="ui-card p-6">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {interview.status}
        </span>

        <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} />
            {scheduled.toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} />
            {scheduled.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          {interview.meetingUrl ? (
            <a
              href={interview.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-indigo-600 hover:underline"
            >
              <Video size={16} />
              Join meeting
            </a>
          ) : null}
        </div>

        <Link
          href={`/Applications/${interview.applicationId}`}
          className="mt-5 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          View application
        </Link>

        <InterviewStatusForm
          interviewId={interview.id}
          initialStatus={interview.status}
          initialType={interview.type}
          initialScheduledAt={interview.scheduledAt.toISOString()}
          initialMeetingUrl={interview.meetingUrl}
          initialNotes={interview.notes}
          initialFeedback={interview.feedback}
        />
      </div>
    </div>
  );
}

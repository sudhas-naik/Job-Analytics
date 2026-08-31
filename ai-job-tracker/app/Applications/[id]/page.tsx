import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BriefcaseBusiness, CalendarDays, MapPin } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import ApplicationStatusForm from "@/app/Components/Applications/ApplicationStatusForm";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();

  if (!user) {
    redirect("/Auth/Login");
  }

  const { id } = await params;
  const application = await prisma.application.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      job: true,
    },
  });

  if (!application) {
    notFound();
  }

  const applied = application.appliedDate
    ? application.appliedDate.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/Applications"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          Back to applications
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          {application.job.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{application.job.company}</p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {application.status}
        </span>

        <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          {application.job.location ? (
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              {application.job.location}
            </div>
          ) : null}
          {application.job.jobType ? (
            <div className="flex items-center gap-2">
              <BriefcaseBusiness size={16} />
              {application.job.jobType}
            </div>
          ) : null}
          {applied ? (
            <div className="flex items-center gap-2">
              <CalendarDays size={16} />
              Applied {applied}
            </div>
          ) : null}
        </div>

        <Link
          href={`/Jobs/${application.job.id}`}
          className="mt-5 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          View job details
        </Link>

        <ApplicationStatusForm
          applicationId={application.id}
          initialStatus={application.status}
          initialNotes={application.notes}
        />
      </div>
    </div>
  );
}

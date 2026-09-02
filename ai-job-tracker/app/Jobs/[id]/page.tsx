import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BriefcaseBusiness,
  CalendarDays,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import SaveJobButton from "@/app/Components/Jobs/SaveJobButton";
import ApplyJobButton from "@/app/Components/Jobs/ApplyJobButton";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const job = await prisma.job.findUnique({ where: { id } });

  if (!job) {
    notFound();
  }

  const application = user
    ? await prisma.application.findUnique({
        where: {
          userId_jobId: {
            userId: user.id,
            jobId: job.id,
          },
        },
      })
    : null;

  const posted = job.createdAt.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/Jobs"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          Back to jobs
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {job.title}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{job.company}</p>
          </div>
          {job.source ? (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {job.source}
            </span>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60">
        <div className="grid gap-4 sm:grid-cols-2">
          {job.location ? (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin size={16} />
              <span>{job.location}</span>
            </div>
          ) : null}
          {job.jobType ? (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <BriefcaseBusiness size={16} />
              <span>{job.jobType}</span>
            </div>
          ) : null}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CalendarDays size={16} />
            <span>Posted {posted}</span>
          </div>
          {job.salary ? (
            <p className="text-sm font-semibold text-slate-900">{job.salary}</p>
          ) : null}
        </div>

        {job.experience ? (
          <p className="mt-4 text-sm text-slate-500">{job.experience}</p>
        ) : null}

        {job.description ? (
          <div className="mt-6 border-t border-slate-100 pt-6">
            <h2 className="text-sm font-semibold text-slate-900">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {job.description}
            </p>
          </div>
        ) : null}

        {job.jobUrl ? (
          <a
            href={job.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Open listing
            <ExternalLink size={16} />
          </a>
        ) : null}

        <div className="mt-6 flex flex-wrap items-start gap-3">
          <ApplyJobButton
            jobId={job.id}
            applicationStatus={application?.status ?? null}
            applicationId={application?.id ?? null}
          />
          <SaveJobButton jobId={job.id} saved={Boolean(application)} />
        </div>
      </div>
    </div>
  );
}

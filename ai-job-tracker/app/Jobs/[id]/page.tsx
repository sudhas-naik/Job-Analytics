import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BriefcaseBusiness,
  CalendarDays,
  CircleDollarSign,
  ExternalLink,
  MapPin,
  Pencil,
  Timer,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import SaveJobButton from "@/app/Components/Jobs/SaveJobButton";
import ApplyJobButton from "@/app/Components/Jobs/ApplyJobButton";
import BackButton from "@/app/Components/Layout/BackButton";

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
  const companyInitial = job.company?.charAt(0).toUpperCase() ?? "J";

  const details = [
    job.location
      ? {
          title: "Location",
          value: job.location,
          icon: <MapPin size={18} />,
          accent: "bg-indigo-50 text-indigo-600",
        }
      : null,
    job.jobType
      ? {
          title: "Job type",
          value: job.jobType,
          icon: <BriefcaseBusiness size={18} />,
          accent: "bg-sky-50 text-sky-600",
        }
      : null,
    {
      title: "Posted",
      value: posted,
      icon: <CalendarDays size={18} />,
      accent: "bg-slate-100 text-slate-600",
    },
    job.salary
      ? {
          title: "Salary",
          value: job.salary,
          icon: <CircleDollarSign size={18} />,
          accent: "bg-emerald-50 text-emerald-600",
        }
      : null,
    job.experience
      ? {
          title: "Experience",
          value: job.experience,
          icon: <Timer size={18} />,
          accent: "bg-amber-50 text-amber-700",
        }
      : null,
  ].filter(Boolean) as Array<{
    title: string;
    value: string;
    icon: ReactNode;
    accent: string;
  }>;

  return (
    <div className="space-y-6">
      <div>
        <BackButton href="/Jobs" label="Back to jobs" />
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-xl font-semibold text-indigo-600">
              {companyInitial}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {job.title}
              </h1>
              <p className="mt-1 text-sm text-slate-500">{job.company}</p>
              {job.source ? (
                <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {job.source}
                </span>
              ) : null}
            </div>
          </div>
          <Link
            href={`/Jobs/${job.id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          >
            <Pencil size={14} />
            Edit
          </Link>
        </div>
      </div>

      <div className="ui-card p-6 sm:p-7">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {details.map((item) => (
            <DetailItem key={item.title} {...item} />
          ))}
        </div>

        {job.description ? (
          <div className="mt-7 border-t border-slate-100 pt-7">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Description
            </h2>
            <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {job.description}
            </p>
          </div>
        ) : null}

        <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
          {job.jobUrl ? (
            <a
              href={job.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            >
              Open listing
              <ExternalLink size={16} />
            </a>
          ) : null}
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

function DetailItem({
  icon,
  title,
  value,
  accent,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          {title}
        </p>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 wrap-break-word text-base font-semibold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}

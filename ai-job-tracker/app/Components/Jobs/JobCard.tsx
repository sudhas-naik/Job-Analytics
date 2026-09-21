import Link from "next/link";
import {
  BriefcaseBusiness,
  CalendarDays,
  MapPin,
} from "lucide-react";

import type { Job } from "@/app/Types/job";
import SaveJobButton from "./SaveJobButton";

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const companyInitial = job.company?.charAt(0).toUpperCase();

  return (
    <div
      data-tilt
      className="ui-card p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-600">
            {companyInitial}
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">{job.title}</h2>
            <p className="text-sm text-slate-500">{job.company}</p>
          </div>
        </div>
        {job.source ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {job.source}
          </span>
        ) : null}
      </div>

      <div className="mt-5 space-y-2 text-sm text-slate-600">
        {job.location ? (
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-indigo-400" />
            <span>{job.location}</span>
          </div>
        ) : null}
        {job.jobType ? (
          <div className="flex items-center gap-2">
            <BriefcaseBusiness size={16} className="text-indigo-400" />
            <span>{job.jobType}</span>
          </div>
        ) : null}
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-indigo-400" />
          <span>{new Date(job.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {job.salary ? (
        <p className="mt-4 font-semibold text-slate-900">{job.salary}</p>
      ) : null}
      {job.experience ? (
        <p className="mt-1 text-sm text-slate-500">{job.experience}</p>
      ) : null}

      <div className="mt-5 flex gap-3">
        <Link
          href={`/Jobs/${job.id}`}
          className="flex-1 rounded-xl bg-slate-950 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-indigo-600"
        >
          View Details
        </Link>
        <Link
          href={`/Jobs/${job.id}/edit`}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Edit
        </Link>
        <SaveJobButton jobId={job.id} saved={Boolean(job.saved)} />
      </div>
    </div>
  );
}

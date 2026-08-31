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
  const companyInitial = job.company
    ?.charAt(0)
    .toUpperCase();

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-lg font-bold">
            {companyInitial}
          </div>

          <div>
            <h2 className="font-semibold">
              {job.title}
            </h2>

            <p className="text-sm text-gray-500">
              {job.company}
            </p>
          </div>
        </div>

        {job.source && (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
            {job.source}
          </span>
        )}
      </div>

      <div className="mt-5 space-y-2 text-sm text-gray-600">
        {job.location && (
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span>{job.location}</span>
          </div>
        )}

        {job.jobType && (
          <div className="flex items-center gap-2">
            <BriefcaseBusiness size={16} />
            <span>{job.jobType}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <CalendarDays size={16} />

          <span>
            {new Date(job.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {job.salary && (
        <p className="mt-4 font-semibold">
          {job.salary}
        </p>
      )}

      {job.experience && (
        <p className="mt-1 text-sm text-gray-500">
          {job.experience}
        </p>
      )}

      <div className="mt-5 flex gap-3">
        <Link
          href={`/Jobs/${job.id}`}
          className="flex-1 rounded-lg bg-black px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-gray-800"
        >
          View Details
        </Link>

        <SaveJobButton jobId={job.id} saved={Boolean(job.saved)} />
      </div>
    </div>
  );
}
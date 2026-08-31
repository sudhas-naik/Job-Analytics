"use client";

import { useQuery } from "@tanstack/react-query";
import { BriefcaseBusiness, MapPin } from "lucide-react";
import Link from "next/link";

import type { Job } from "@/app/Types/job";

interface Application {
  id: string;
  status: string;
  appliedDate: string | null;
  notes: string | null;
  job: Job;
}

async function fetchApplications() {
  const response = await fetch("/api/applications");

  if (!response.ok) {
    throw new Error("Failed to fetch applications");
  }

  return response.json();
}

export default function ApplicationsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["applications"],
    queryFn: fetchApplications,
  });

  const applications: Application[] = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="py-10 text-center text-slate-500">
        Loading applications...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
        Failed to load applications.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Applications
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track all your saved and submitted applications.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center">
          <h2 className="font-semibold">No applications yet</h2>
          <p className="mt-1 text-sm text-slate-500">
            Save or apply to a job to start tracking it.
          </p>
          <Link
            href="/Jobs"
            className="mt-5 inline-block rounded-lg bg-slate-950 px-5 py-2 text-sm text-white"
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {applications.map((application) => (
            <div
              key={application.id}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold">{application.job.title}</h2>
                  <p className="text-sm text-slate-500">
                    {application.job.company}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {application.status}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-500">
                {application.job.location && (
                  <div className="flex gap-2">
                    <MapPin size={16} />
                    {application.job.location}
                  </div>
                )}
                {application.job.jobType && (
                  <div className="flex gap-2">
                    <BriefcaseBusiness size={16} />
                    {application.job.jobType}
                  </div>
                )}
              </div>

              <Link
                href={`/Applications/${application.id}`}
                className="mt-5 block rounded-lg border px-4 py-2 text-center text-sm font-medium hover:bg-slate-50"
              >
                View Application
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

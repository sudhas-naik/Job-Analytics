"use client";

import { Suspense } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { BriefcaseBusiness, MapPin } from "lucide-react";
import Link from "next/link";

import type { Job } from "@/app/Types/job";
import BackButton from "@/app/Components/Layout/BackButton";
import FilterPills from "@/app/Components/Search/FilterPills";
import SearchInput from "@/app/Components/Search/SearchInput";
import { useListSearch } from "@/app/Hooks/useListSearch";
import { APPLICATION_STATUSES, isApplicationStatus } from "@/lib/settings-options";
import { formatEnumLabel } from "@/lib/search";

interface Application {
  id: string;
  status: string;
  appliedDate: string | null;
  notes: string | null;
  job: Job;
}

const STATUS_TONE: Record<string, string> = {
  SAVED: "bg-slate-100 text-slate-700",
  APPLIED: "bg-sky-100 text-sky-700",
  SCREENING: "bg-amber-100 text-amber-800",
  INTERVIEW: "bg-indigo-100 text-indigo-700",
  OFFER: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  WITHDRAWN: "bg-slate-200 text-slate-600",
};

const STATUS_FILTERS = [
  { value: "", label: "All" },
  ...APPLICATION_STATUSES.map((status) => ({
    value: status,
    label: formatEnumLabel(status),
  })),
];

async function fetchApplications(search: string, status: string) {
  const params = new URLSearchParams();
  if (search) {
    params.set("search", search);
  }
  if (status) {
    params.set("status", status);
  }

  const query = params.toString();
  const response = await fetch(
    `/api/applications${query ? `?${query}` : ""}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch applications");
  }

  return response.json();
}

function ApplicationsPageContent() {
  const {
    draft,
    setDraft,
    committedQuery,
    status,
    setStatus,
    commitQuery,
    clearQuery,
  } = useListSearch();

  const activeStatus = isApplicationStatus(status) ? status : "";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["applications", { search: committedQuery, status: activeStatus }],
    queryFn: () => fetchApplications(committedQuery, activeStatus),
    placeholderData: keepPreviousData,
  });

  const applications: Application[] = data?.data ?? [];
  const hasFilters = Boolean(committedQuery || activeStatus);

  return (
    <div>
      <BackButton href="/Dashboard" label="Back to dashboard" />
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Applications
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track all your saved and submitted applications.
        </p>
      </div>

      <div className="mb-6 space-y-4">
        <SearchInput
          value={draft}
          onChange={setDraft}
          onSubmit={commitQuery}
          placeholder="Search by job title or company..."
        />
        <FilterPills
          options={STATUS_FILTERS}
          value={activeStatus}
          onChange={setStatus}
        />
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-slate-500">
          Loading applications...
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
          Failed to load applications.
        </div>
      ) : applications.length === 0 ? (
        <div className="ui-card p-10 text-center">
          <h2 className="font-semibold">
            {hasFilters ? "No applications match" : "No applications yet"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {hasFilters
              ? "Try a different search or status filter."
              : "Save or apply to a job to start tracking it."}
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={() => {
                clearQuery();
                setStatus("");
              }}
              className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear filters
            </button>
          ) : (
            <Link
              href="/Jobs"
              className="mt-5 inline-block rounded-xl bg-slate-950 px-5 py-2.5 text-sm text-white hover:bg-indigo-600"
            >
              Browse Jobs
            </Link>
          )}
        </div>
      ) : (
        <>
          {hasFilters ? (
            <p className="mb-3 text-sm text-slate-400">
              {applications.length} result{applications.length === 1 ? "" : "s"}
            </p>
          ) : null}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {applications.map((application) => (
              <div key={application.id} className="ui-card p-5" data-tilt>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold">{application.job.title}</h2>
                    <p className="text-sm text-slate-500">
                      {application.job.company}
                    </p>
                  </div>
                  <span
                    className={`status-pill ${
                      STATUS_TONE[application.status] ??
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {formatEnumLabel(application.status)}
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
                  className="mt-5 block rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-medium transition hover:bg-indigo-50 hover:text-indigo-700"
                >
                  View Application
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-10 text-center text-slate-500">
          Loading applications...
        </div>
      }
    >
      <ApplicationsPageContent />
    </Suspense>
  );
}

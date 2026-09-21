"use client";

import { Suspense } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CalendarDays, Clock, Video } from "lucide-react";
import BackButton from "@/app/Components/Layout/BackButton";
import FilterPills from "@/app/Components/Search/FilterPills";
import SearchInput from "@/app/Components/Search/SearchInput";
import { useListSearch } from "@/app/Hooks/useListSearch";
import { formatEnumLabel } from "@/lib/search";

type Interview = {
  id: string;
  status: string;
  type: string | null;
  scheduledAt: string;
  meetingUrl: string | null;
  application?: {
    job?: {
      title: string;
      company: string;
    };
  };
};

const INTERVIEW_STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED"] as const;

const STATUS_FILTERS = [
  { value: "", label: "All" },
  ...INTERVIEW_STATUSES.map((status) => ({
    value: status,
    label: formatEnumLabel(status),
  })),
];

function isInterviewStatus(
  value: string
): value is (typeof INTERVIEW_STATUSES)[number] {
  return INTERVIEW_STATUSES.includes(value as (typeof INTERVIEW_STATUSES)[number]);
}

async function fetchInterviews(search: string, status: string) {
  const params = new URLSearchParams();
  if (search) {
    params.set("search", search);
  }
  if (status) {
    params.set("status", status);
  }

  const query = params.toString();
  const response = await fetch(`/api/interviews${query ? `?${query}` : ""}`);

  if (!response.ok) {
    throw new Error("Failed to fetch interviews");
  }

  return response.json();
}

function InterviewsPageContent() {
  const {
    draft,
    setDraft,
    committedQuery,
    status,
    setStatus,
    commitQuery,
    clearQuery,
  } = useListSearch();

  const activeStatus = isInterviewStatus(status) ? status : "";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["interviews", { search: committedQuery, status: activeStatus }],
    queryFn: () => fetchInterviews(committedQuery, activeStatus),
    placeholderData: keepPreviousData,
  });

  const interviews: Interview[] = data?.data ?? [];
  const hasFilters = Boolean(committedQuery || activeStatus);

  return (
    <div>
      <BackButton href="/Dashboard" label="Back to dashboard" />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Interviews
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your upcoming and completed interviews.
          </p>
        </div>

        <Link
          href="/Interviews/new"
          className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-600"
        >
          + Schedule Interview
        </Link>
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
          Loading interviews...
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
          Failed to load interviews.
        </div>
      ) : interviews.length === 0 ? (
        <div className="ui-card p-10 text-center">
          <CalendarDays className="mx-auto text-slate-400" size={40} />
          <h2 className="mt-4 font-semibold">
            {hasFilters ? "No interviews match" : "No interviews scheduled"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {hasFilters
              ? "Try a different search or status filter."
              : "Schedule an interview from one of your applications."}
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
              href="/Applications"
              className="mt-5 inline-block rounded-lg bg-slate-950 px-5 py-2 text-sm text-white"
            >
              View applications
            </Link>
          )}
        </div>
      ) : (
        <>
          {hasFilters ? (
            <p className="mb-3 text-sm text-slate-400">
              {interviews.length} result{interviews.length === 1 ? "" : "s"}
            </p>
          ) : null}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {interviews.map((interview) => {
              const job = interview.application?.job;
              const interviewDate = new Date(interview.scheduledAt);

              return (
                <div key={interview.id} className="ui-card p-5" data-tilt>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-semibold">{job?.title}</h2>
                      <p className="text-sm text-slate-500">{job?.company}</p>
                    </div>
                    <span
                      className={`status-pill ${
                        interview.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-700"
                          : interview.status === "CANCELLED"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      {formatEnumLabel(interview.status)}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} />
                      {interviewDate.toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      {interviewDate.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    {interview.type ? (
                      <div>
                        <strong>Type:</strong> {interview.type}
                      </div>
                    ) : null}
                    {interview.meetingUrl ? (
                      <div className="flex items-center gap-2">
                        <Video size={16} />
                        <a
                          href={interview.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          Join meeting
                        </a>
                      </div>
                    ) : null}
                  </div>

                  <Link
                    href={`/Interviews/${interview.id}`}
                    className="mt-5 block rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-medium transition hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    View Interview
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function InterviewsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-10 text-center text-slate-500">
          Loading interviews...
        </div>
      }
    >
      <InterviewsPageContent />
    </Suspense>
  );
}

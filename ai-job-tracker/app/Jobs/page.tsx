"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";

import JobList from "@/app/Components/Jobs/JobList";
import SearchInput from "@/app/Components/Search/SearchInput";
import BackButton from "@/app/Components/Layout/BackButton";
import { useListSearch } from "@/app/Hooks/useListSearch";
import { useJobs } from "@/app/Hooks/useJobs";

function JobsPageContent() {
  const {
    draft,
    setDraft,
    committedQuery,
    page,
    setPage,
    commitQuery,
    clearQuery,
  } = useListSearch();

  const { data, isLoading, isError } = useJobs({
    search: committedQuery,
    page,
    limit: 9,
  });

  const jobs = data?.data ?? [];
  const pagination = data?.pagination;

  useEffect(() => {
    if (pagination && page > pagination.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [page, pagination, setPage]);

  return (
    <div>
      <BackButton href="/Dashboard" label="Back to dashboard" />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Jobs
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Discover and manage jobs you&apos;re interested in.
          </p>
        </div>
        <Link
          href="/Jobs/new"
          className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-600"
        >
          + Add Job
        </Link>
      </div>

      <div className="mb-6">
        <SearchInput
          value={draft}
          onChange={setDraft}
          onSubmit={commitQuery}
          placeholder="Search jobs or companies..."
        />
      </div>

      {isLoading && (
        <div className="py-10 text-center text-slate-500">Loading jobs...</div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
          Failed to load jobs.
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {committedQuery ? (
            <p className="mb-3 text-sm text-slate-400">
              {pagination?.total ?? jobs.length} result
              {(pagination?.total ?? jobs.length) === 1 ? "" : "s"} for “
              {committedQuery}”
            </p>
          ) : null}

          <JobList
            jobs={jobs}
            search={committedQuery}
            onClearSearch={clearQuery}
          />

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={page === pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-10 text-center text-slate-500">Loading jobs...</div>
      }
    >
      <JobsPageContent />
    </Suspense>
  );
}

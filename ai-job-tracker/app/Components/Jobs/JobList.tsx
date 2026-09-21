import JobCard from "./JobCard";
import type { Job } from "@/app/Types/job";
import Link from "next/link";

interface JobListProps {
  jobs: Job[];
  search?: string;
  onClearSearch?: () => void;
}

export default function JobList({ jobs, search, onClearSearch }: JobListProps) {
  if (jobs.length === 0) {
    const hasSearch = Boolean(search?.trim());
    return (
      <div className="ui-card p-10 text-center">
        <h3 className="font-semibold">
          {hasSearch ? "No jobs match your search" : "No jobs found"}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {hasSearch
            ? `Nothing found for “${search}”. Try a different title or company.`
            : "Add a role to start tracking your job search."}
        </p>
        {hasSearch && onClearSearch ? (
          <button
            type="button"
            onClick={onClearSearch}
            className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Clear search
          </button>
        ) : (
          <Link
            href="/Jobs/new"
            className="mt-5 inline-block rounded-xl bg-slate-950 px-5 py-2.5 text-sm text-white hover:bg-indigo-600"
          >
            Add job
          </Link>
        )}
      </div>
    );
  }
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

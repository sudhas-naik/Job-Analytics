import JobCard from "./JobCard";
import type { Job } from "@/app/Types/job";

interface JobListProps {
  jobs: Job[];
}

export default function JobList({ jobs }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center">
        <h3 className="font-semibold">
          No jobs found
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Try changing your search.
        </p>
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
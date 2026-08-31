import Link from "next/link";
import JobForm from "@/app/Components/Jobs/JobForm";

export default function NewJobPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/Jobs"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          Back to jobs
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          Add job
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Save a role you want to track.
        </p>
      </div>

      <JobForm />
    </div>
  );
}

import JobForm from "@/app/Components/Jobs/JobForm";
import BackButton from "@/app/Components/Layout/BackButton";

export default function NewJobPage() {
  return (
    <div className="space-y-6">
      <div>
        <BackButton href="/Jobs" label="Back to jobs" />
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
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

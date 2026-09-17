import { Suspense } from "react";
import ScheduleInterviewForm from "@/app/Components/Interviews/ScheduleInterviewForm";
import BackButton from "@/app/Components/Layout/BackButton";

export default function NewInterviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <BackButton href="/Interviews" label="Back to interviews" />
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Schedule interview
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Attach a date and meeting details to one of your applications.
        </p>
      </div>

      <Suspense fallback={<p className="text-sm text-slate-500">Loading form...</p>}>
        <ScheduleInterviewForm />
      </Suspense>
    </div>
  );
}

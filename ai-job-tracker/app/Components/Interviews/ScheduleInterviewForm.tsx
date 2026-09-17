"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { INTERVIEW_TYPES, isInterviewType } from "@/lib/settings-options";
import BackButton from "@/app/Components/Layout/BackButton";

type ApplicationOption = {
  id: string;
  status: string;
  job: {
    title: string;
    company: string;
  };
};

export default function ScheduleInterviewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const preselected = searchParams.get("applicationId") ?? "";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const response = await fetch("/api/applications");
      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }
      return response.json();
    },
  });

  const { data: settingsData } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await fetch("/api/settings");
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }
      return response.json();
    },
  });

  const applications: ApplicationOption[] = data?.data ?? [];
  const defaultApplicationId = useMemo(() => {
    if (preselected && applications.some((item) => item.id === preselected)) {
      return preselected;
    }
    return applications[0]?.id ?? "";
  }, [applications, preselected]);

  const defaultType = isInterviewType(settingsData?.data?.defaultInterviewType)
    ? settingsData.data.defaultInterviewType
    : "Technical";

  const [applicationId, setApplicationId] = useState("");
  const [type, setType] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  const selectedId = applicationId || defaultApplicationId;
  const selectedType = type || defaultType;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const response = await fetch("/api/interviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId: selectedId,
        type: selectedType,
        scheduledAt,
        meetingUrl,
        notes,
      }),
    });

    const result = await response.json();
    setPending(false);

    if (!response.ok) {
      setMessage(result.message ?? "Could not schedule interview");
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["interviews"] });
    await queryClient.invalidateQueries({ queryKey: ["applications"] });
    await queryClient.invalidateQueries({ queryKey: ["analytics"] });
    router.push(`/Interviews/${result.data.id}`);
    router.refresh();
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading applications...</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-rose-600">Failed to load applications.</p>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="ui-card p-6">
        <p className="text-sm text-slate-600">
          You need an application before you can schedule an interview.
        </p>
        <a
          href="/Applications"
          className="mt-4 inline-block rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white"
        >
          Go to applications
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 ui-card p-6"
    >
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-600">
          Application
        </span>
        <select
          required
          value={selectedId}
          onChange={(event) => setApplicationId(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
        >
          {applications.map((application) => (
            <option key={application.id} value={application.id}>
              {application.job.title} at {application.job.company} (
              {application.status})
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-600">
            Type
          </span>
          <select
            value={selectedType}
            onChange={(event) => setType(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          >
            {INTERVIEW_TYPES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-600">
            Date and time
          </span>
          <input
            required
            type="datetime-local"
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-600">
          Meeting URL
        </span>
        <input
          type="url"
          value={meetingUrl}
          onChange={(event) => setMeetingUrl(event.target.value)}
          placeholder="https://..."
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-600">
          Notes
        </span>
        <textarea
          rows={4}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
        />
      </label>

      {message ? <p className="text-sm text-rose-600">{message}</p> : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {pending ? "Scheduling..." : "Schedule interview"}
        </button>
        <BackButton href="/Interviews" label="Cancel" className="" />
      </div>
    </form>
  );
}

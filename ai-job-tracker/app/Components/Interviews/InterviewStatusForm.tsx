"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

const STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED"] as const;

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function InterviewStatusForm({
  interviewId,
  initialStatus,
  initialType,
  initialScheduledAt,
  initialMeetingUrl,
  initialNotes,
  initialFeedback,
}: {
  interviewId: string;
  initialStatus: string;
  initialType: string | null;
  initialScheduledAt: string;
  initialMeetingUrl: string | null;
  initialNotes: string | null;
  initialFeedback: string | null;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(initialStatus);
  const [type, setType] = useState(initialType ?? "");
  const [scheduledAt, setScheduledAt] = useState(
    toDateTimeLocal(initialScheduledAt)
  );
  const [meetingUrl, setMeetingUrl] = useState(initialMeetingUrl ?? "");
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [feedback, setFeedback] = useState(initialFeedback ?? "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const response = await fetch(`/api/interviews/${interviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        type,
        scheduledAt,
        meetingUrl,
        notes,
        feedback,
      }),
    });
    const data = await response.json();
    setPending(false);
    setMessage(data.message ?? "");
    if (response.ok) {
      await queryClient.invalidateQueries({ queryKey: ["interviews"] });
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
      await queryClient.invalidateQueries({ queryKey: ["analytics"] });
      router.refresh();
    }
  }
  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 border-t border-slate-100 pt-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-600">
            Status
          </span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          >
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-600">
            Type
          </span>
          <input
            type="text"
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-600">
          Date and time
        </span>
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(event) => setScheduledAt(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-600">
          Meeting URL
        </span>
        <input
          type="url"
          value={meetingUrl}
          onChange={(event) => setMeetingUrl(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-600">
          Notes
        </span>
        <textarea
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-600">
          Feedback
        </span>
        <textarea
          rows={3}
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
        />
      </label>
      {message ? <p className="text-sm text-slate-500">{message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Update interview"}
      </button>
    </form>
  );
}

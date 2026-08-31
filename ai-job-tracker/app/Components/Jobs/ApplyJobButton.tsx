"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

const TRACKED_STATUSES = new Set([
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
]);

export default function ApplyJobButton({
  jobId,
  applicationStatus,
  applicationId,
}: {
  jobId: string;
  applicationStatus?: string | null;
  applicationId?: string | null;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const alreadyTracked = TRACKED_STATUSES.has(applicationStatus ?? "");

  async function handleApply() {
    setPending(true);
    setMessage("");

    const response = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId,
        status: "APPLIED",
      }),
    });

    const data = await response.json();
    setPending(false);

    if (!response.ok && response.status !== 409) {
      setMessage(data.message ?? "Could not create application");
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["jobs"] });
    await queryClient.invalidateQueries({ queryKey: ["applications"] });

    const nextId = data.data?.id ?? applicationId;
    if (nextId) {
      router.push(`/Applications/${nextId}`);
      router.refresh();
      return;
    }

    router.push("/Applications");
    router.refresh();
  }

  if (alreadyTracked && applicationId) {
    return (
      <button
        type="button"
        onClick={() => router.push(`/Applications/${applicationId}`)}
        className="rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
      >
        View application
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleApply}
        disabled={pending}
        className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {pending ? "Applying..." : "Apply / Track application"}
      </button>
      {message ? <p className="text-xs text-rose-600">{message}</p> : null}
    </div>
  );
}

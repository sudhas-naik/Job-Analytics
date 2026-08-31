"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";

export default function SaveJobButton({
  jobId,
  saved: initialSaved,
}: {
  jobId: string;
  saved: boolean;
}) {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleClick() {
    setPending(true);
    setMessage("");

    const response = await fetch(`/api/jobs/${jobId}/save`, {
      method: saved ? "DELETE" : "POST",
    });

    const data = await response.json();
    setPending(false);

    if (!response.ok) {
      setMessage(data.message ?? "Could not update saved job");
      return;
    }

    setSaved(Boolean(data.saved));
    await queryClient.invalidateQueries({ queryKey: ["jobs"] });
    await queryClient.invalidateQueries({ queryKey: ["applications"] });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
          saved
            ? "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            : "border-slate-200 hover:bg-slate-50"
        }`}
      >
        <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
        {pending ? "Saving..." : saved ? "Saved" : "Save"}
      </button>
      {message ? <p className="text-xs text-rose-600">{message}</p> : null}
    </div>
  );
}

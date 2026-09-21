"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import BackButton from "@/app/Components/Layout/BackButton";

const emptyForm = {
  title: "",
  company: "",
  location: "",
  jobType: "",
  salary: "",
  experience: "",
  jobUrl: "",
  source: "",
  description: "",
};

type FormState = typeof emptyForm;

export type JobFormValues = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  jobType: string | null;
  salary: string | null;
  experience: string | null;
  jobUrl: string | null;
  source: string | null;
  description: string | null;
};

function toForm(job: JobFormValues): FormState {
  return {
    title: job.title ?? "",
    company: job.company ?? "",
    location: job.location ?? "",
    jobType: job.jobType ?? "",
    salary: job.salary ?? "",
    experience: job.experience ?? "",
    jobUrl: job.jobUrl ?? "",
    source: job.source ?? "",
    description: job.description ?? "",
  };
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-600">
        {label}
      </span>
      <input
        required={required}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
      />
    </label>
  );
}

export default function JobForm({
  job,
  cancelHref = "/Jobs",
}: {
  job?: JobFormValues;
  cancelHref?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = Boolean(job?.id);
  const [form, setForm] = useState<FormState>(() =>
    job ? toForm(job) : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const jobId = job?.id;
    const snapshot = job;

    if (!jobId || !snapshot) {
      return;
    }

    setForm(toForm(snapshot));

    let cancelled = false;

    async function loadSavedJob() {
      const response = await fetch(`/api/jobs/${jobId}`);
      const result = await response.json();

      if (cancelled || !response.ok || !result.data) {
        return;
      }

      setForm(toForm(result.data));
    }

    void loadSavedJob();

    return () => {
      cancelled = true;
    };
  }, [job?.id]);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const response = await fetch(isEdit ? `/api/jobs/${job?.id}` : "/api/jobs", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      setMessage(
        data.message ?? (isEdit ? "Failed to update job" : "Failed to create job")
      );
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["jobs"] });
    await queryClient.invalidateQueries({ queryKey: ["applications"] });
    await queryClient.invalidateQueries({ queryKey: ["interviews"] });
    await queryClient.invalidateQueries({ queryKey: ["analytics"] });
    router.push(isEdit && job ? `/Jobs/${job.id}` : "/Jobs");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 ui-card p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          required
          label="Job title"
          value={form.title}
          onChange={(value) => updateField("title", value)}
        />
        <Field
          required
          label="Company"
          value={form.company}
          onChange={(value) => updateField("company", value)}
        />
        <Field
          label="Location"
          value={form.location}
          onChange={(value) => updateField("location", value)}
        />
        <Field
          label="Job type"
          value={form.jobType}
          placeholder="Full-time, Remote..."
          onChange={(value) => updateField("jobType", value)}
        />
        <Field
          label="Salary"
          value={form.salary}
          onChange={(value) => updateField("salary", value)}
        />
        <Field
          label="Experience"
          value={form.experience}
          onChange={(value) => updateField("experience", value)}
        />
        <Field
          label="Job URL"
          value={form.jobUrl}
          onChange={(value) => updateField("jobUrl", value)}
        />
        <Field
          label="Source"
          value={form.source}
          placeholder="LinkedIn, Indeed..."
          onChange={(value) => updateField("source", value)}
        />
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-600">
          Description
        </span>
        <textarea
          rows={5}
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
        />
      </label>

      {message ? <p className="text-sm text-rose-600">{message}</p> : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? "Saving..." : isEdit ? "Save changes" : "Save job"}
        </button>

        <BackButton href={cancelHref} label="Cancel" className="" />
      </div>
    </form>
  );
}

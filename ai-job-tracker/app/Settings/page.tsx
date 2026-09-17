"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import {
  APPLICATION_STATUSES,
  INTERVIEW_TYPES,
} from "@/lib/settings-options";
import BackButton from "@/app/Components/Layout/BackButton";

interface UserSettings {
  emailNotifications: boolean;
  jobAlerts: boolean;
  interviewReminders: boolean;
  defaultApplicationStatus: string;
  defaultInterviewType: string;
}

async function fetchSettings(): Promise<UserSettings> {
  const response = await fetch("/api/settings");
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch settings");
  }

  return result.data;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [defaultApplicationStatus, setDefaultApplicationStatus] =
    useState("APPLIED");
  const [defaultInterviewType, setDefaultInterviewType] = useState("Technical");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");

  useEffect(() => {
    if (!data) {
      return;
    }

    setEmailNotifications(data.emailNotifications);
    setJobAlerts(data.jobAlerts);
    setInterviewReminders(data.interviewReminders);
    setDefaultApplicationStatus(data.defaultApplicationStatus);
    setDefaultInterviewType(data.defaultInterviewType);
  }, [data]);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailNotifications,
        jobAlerts,
        interviewReminders,
        defaultApplicationStatus,
        defaultInterviewType,
      }),
    });

    const result = await response.json();
    setSaving(false);
    setMessage(result.message ?? (response.ok ? "Settings saved" : "Save failed"));

    if (response.ok) {
      await queryClient.invalidateQueries({ queryKey: ["settings"] });
    }
  }

  async function handleDelete() {
    const email = session?.user?.email ?? "";
    if (!email || deleteEmail.trim().toLowerCase() !== email.toLowerCase()) {
      setDeleteMessage("Type your account email to confirm deletion.");
      return;
    }

    const confirmed = window.confirm(
      "This permanently deletes your applications, interviews, and account."
    );
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setDeleteMessage("");

    const response = await fetch("/api/profile", { method: "DELETE" });
    const result = await response.json();

    if (!response.ok) {
      setDeleting(false);
      setDeleteMessage(result.message ?? "Failed to delete account");
      return;
    }

    await signOut({ callbackUrl: "/Auth/Login" });
  }

  if (isLoading) {
    return (
      <div>
        <BackButton href="/Dashboard" label="Back to dashboard" />
        <div className="py-10 text-center text-slate-500">Loading settings...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <BackButton href="/Dashboard" label="Back to dashboard" />
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
          {error instanceof Error ? error.message : "Failed to load settings."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <BackButton href="/Dashboard" label="Back to dashboard" />
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage account preferences for your job search.
        </p>
      </div>

      <section className="ui-card p-6">
        <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
        <p className="mt-1 text-sm text-slate-500">
          Name, email, and password are managed on your profile.
        </p>
        <Link
          href="/Profile"
          className="mt-4 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-600"
        >
          Open profile
        </Link>
      </section>

      <form onSubmit={handleSave} className="space-y-6">
        <section className="ui-card p-6">
          <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose which reminders you want while tracking jobs.
          </p>
          <div className="mt-5 space-y-4">
            <SettingToggle
              title="Email notifications"
              description="Receive important account and application updates"
              enabled={emailNotifications}
              onChange={setEmailNotifications}
            />
            <SettingToggle
              title="Job alerts"
              description="Get notified about job-search activity"
              enabled={jobAlerts}
              onChange={setJobAlerts}
            />
            <SettingToggle
              title="Interview reminders"
              description="Receive reminders for upcoming interviews"
              enabled={interviewReminders}
              onChange={setInterviewReminders}
            />
          </div>
        </section>

        <section className="ui-card p-6">
          <h2 className="text-lg font-semibold text-slate-900">Preferences</h2>
          <p className="mt-1 text-sm text-slate-500">
            Interview type is prefilled when you schedule. Application status is
            used when a new application is created without a status.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-600">
                Default application status
              </span>
              <select
                value={defaultApplicationStatus}
                onChange={(event) =>
                  setDefaultApplicationStatus(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              >
                {APPLICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-600">
                Default interview type
              </span>
              <select
                value={defaultInterviewType}
                onChange={(event) => setDefaultInterviewType(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              >
                {INTERVIEW_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {message ? <p className="text-sm text-slate-500">{message}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save settings"}
        </button>
      </form>

      <section className="ui-card p-6">
        <h2 className="text-lg font-semibold text-slate-900">Account</h2>
        <p className="mt-1 text-sm text-slate-500">
          Sign out of this session on this device.
        </p>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/Auth/Login" })}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-100"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </section>

      <section className="ui-card border-red-200 p-6">
        <h2 className="text-lg font-semibold text-red-600">Danger zone</h2>
        <p className="mt-1 text-sm text-slate-500">
          Permanently delete your account and all job-search data.
        </p>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium text-slate-600">
            Type {session?.user?.email ?? "your email"} to confirm
          </span>
          <input
            type="email"
            value={deleteEmail}
            onChange={(event) => setDeleteEmail(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
          />
        </label>
        {deleteMessage ? (
          <p className="mt-3 text-sm text-rose-600">{deleteMessage}</p>
        ) : null}
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
        >
          {deleting ? "Deleting..." : "Delete account"}
        </button>
      </section>
    </div>
  );
}

function SettingToggle({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5">
      <div>
        <h3 className="font-medium text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative h-6 w-11 rounded-full transition ${
          enabled ? "bg-slate-950" : "bg-slate-300"
        }`}
        aria-pressed={enabled}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

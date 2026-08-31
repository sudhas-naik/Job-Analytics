"use client";

import { FormEvent, useState } from "react";
import { signOut } from "next-auth/react";
import {
  Briefcase,
  CalendarDays,
  FileText,
  LogOut,
} from "lucide-react";

type ProfileUser = {
  id: string;
  name: string | null;
  email: string;
  profileImage: string | null;
  createdAt: string;
};

type ProfileStats = {
  applications: number;
  interviews: number;
  resumes: number;
};

function initials(name: string | null, email: string) {
  const source = name?.trim() || email;
  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function ProfileForm({
  user,
  stats,
}: {
  user: ProfileUser;
  stats: ProfileStats;
}) {
  const [name, setName] = useState(user.name ?? "");
  const [email, setEmail] = useState(user.email);
  const [profileImage, setProfileImage] = useState(user.profileImage ?? "");
  const [saving, setSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setProfileMessage("");

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, profileImage }),
    });

    const data = await response.json();
    setSaving(false);
    setProfileMessage(data.message);

    if (response.ok) {
      setName(data.user.name ?? "");
      setEmail(data.user.email);
      setProfileImage(data.user.profileImage ?? "");
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    setPasswordMessage("");

    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match");
      return;
    }

    setPasswordSaving(true);

    const response = await fetch("/api/profile/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();
    setPasswordSaving(false);
    setPasswordMessage(data.message);

    if (response.ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  const joined = new Date(user.createdAt).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account and job-search details.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {profileImage ? (
            <img
              src={profileImage}
              alt={name || email}
              className="h-16 w-16 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500 text-lg font-semibold text-white">
              {initials(name, email)}
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {name || "Your profile"}
            </h2>
            <p className="text-sm text-slate-500">{email}</p>
            <p className="mt-1 text-xs text-slate-400">Joined {joined}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Applications",
            value: stats.applications,
            icon: Briefcase,
            accent: "bg-indigo-50 text-indigo-600",
          },
          {
            title: "Interviews",
            value: stats.interviews,
            icon: CalendarDays,
            accent: "bg-sky-50 text-sky-600",
          },
          {
            title: "Resumes",
            value: stats.resumes,
            icon: FileText,
            accent: "bg-emerald-50 text-emerald-600",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/60"
            >
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.accent}`}
                >
                  <Icon size={18} />
                </span>
              </div>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={handleProfileSubmit}
        className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60"
      >
        <h3 className="text-base font-semibold text-slate-900">
          Account details
        </h3>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-600">
            Name
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-600">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-600">
            Profile image URL
          </span>
          <input
            type="url"
            value={profileImage}
            onChange={(e) => setProfileImage(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        {profileMessage ? (
          <p className="text-sm text-slate-500">{profileMessage}</p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>

      <form
        onSubmit={handlePasswordSubmit}
        className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60"
      >
        <h3 className="text-base font-semibold text-slate-900">
          Change password
        </h3>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-600">
            Current password
          </span>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-600">
            New password
          </span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-600">
            Confirm new password
          </span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        {passwordMessage ? (
          <p className="text-sm text-slate-500">{passwordMessage}</p>
        ) : null}

        <button
          type="submit"
          disabled={passwordSaving}
          className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
        >
          {passwordSaving ? "Updating..." : "Update password"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/Auth/Login" })}
        className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </div>
  );
}

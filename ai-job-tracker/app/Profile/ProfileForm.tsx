"use client";

import { FormEvent, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  Briefcase,
  CalendarDays,
  Camera,
  FileText,
  LogOut,
  Trash2,
} from "lucide-react";
import BackButton from "@/app/Components/Layout/BackButton";

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
  const { update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user.name ?? "");
  const [email, setEmail] = useState(user.email);
  const [profileImage, setProfileImage] = useState(user.profileImage ?? "");
  const [imageBroken, setImageBroken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const [showPasswordForm, setShowPasswordForm] = useState(false);
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
      body: JSON.stringify({ name, email }),
    });

    const data = await response.json();
    setSaving(false);
    setProfileMessage(data.message);

    if (response.ok) {
      setName(data.user.name ?? "");
      setEmail(data.user.email);
      await update({ name: data.user.name ?? "" });
    }
  }

  async function handlePhotoUpload(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      setProfileMessage("Image must be 2MB or smaller");
      return;
    }

    setUploading(true);
    setProfileMessage("");

    const body = new FormData();
    body.set("file", file);

    const response = await fetch("/api/profile/image", {
      method: "POST",
      body,
    });

    const data = await response.json();
    setUploading(false);
    setProfileMessage(data.message);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (response.ok) {
      setProfileImage(data.user.profileImage ?? "");
      setImageBroken(false);
      await update({ image: data.user.profileImage });
    }
  }

  async function handleRemovePhoto() {
    setUploading(true);
    setProfileMessage("");

    const response = await fetch("/api/profile/image", {
      method: "DELETE",
    });

    const data = await response.json();
    setUploading(false);
    setProfileMessage(data.message);

    if (response.ok) {
      setProfileImage("");
      setImageBroken(false);
      await update({ image: null });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
      setShowPasswordForm(false);
    }
  }

  function openPasswordForm() {
    setShowPasswordForm(true);
    setPasswordMessage("");
  }

  function closePasswordForm() {
    setShowPasswordForm(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage("");
  }

  const joined = new Date(user.createdAt).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      <div>
        <BackButton href="/Dashboard" label="Back to dashboard" />
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account and job-search details.
        </p>
      </div>

      <div className="ui-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
            aria-label="Upload profile photo"
          >
            {profileImage && !imageBroken ? (
              <img
                src={profileImage}
                alt={name || email}
                className="h-full w-full object-cover"
                onError={() => setImageBroken(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-indigo-500 text-lg font-semibold text-white">
                {initials(name, email)}
              </div>
            )}
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-slate-950/70 py-1 text-white">
              <Camera size={14} />
            </span>
          </button>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900">
              {name || "Your profile"}
            </h2>
            <p className="text-sm text-slate-500">{email}</p>
            <p className="mt-1 text-xs text-slate-400">Joined {joined}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="rounded-xl bg-slate-950 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
              >
                {uploading ? "Uploading..." : "Upload photo"}
              </button>
              {profileImage ? (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              ) : null}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              JPG, PNG, WEBP, or GIF · up to 2MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handlePhotoUpload(file);
                }
              }}
            />
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
              className="ui-card p-5"
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
        className="space-y-4 ui-card p-6"
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

      {showPasswordForm ? (
        <form
          onSubmit={handlePasswordSubmit}
          className="space-y-4 ui-card p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Change password
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Enter your current password, then choose a new one.
              </p>
            </div>
            <button
              type="button"
              onClick={closePasswordForm}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-600">
              Current password
            </span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
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
              autoComplete="new-password"
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
              autoComplete="new-password"
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
            {passwordSaving ? "Updating..." : "Save password"}
          </button>
        </form>
      ) : (
        <div className="ui-card p-6">
          <h3 className="text-base font-semibold text-slate-900">Password</h3>
          <p className="mt-1 text-sm text-slate-500">
            Keep your account secure with a new password.
          </p>
          {passwordMessage ? (
            <p className="mt-3 text-sm text-slate-500">{passwordMessage}</p>
          ) : null}
          <button
            type="button"
            onClick={openPasswordForm}
            className="mt-4 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Update password
          </button>
        </div>
      )}

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

"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { CSSProperties } from "react";
import {
  ArrowUpRight,
  Briefcase,
  CalendarDays,
  CircleCheck,
  CircleX,
  Plus,
  Sparkles,
} from "lucide-react";
import CountUp from "@/app/Components/Effects/CountUp";

type DashboardData = {
  overview: {
    totalApplications: number;
    totalInterviews: number;
    totalOffers: number;
    totalRejected: number;
    upcomingInterviews: number;
  };
  applicationStatuses: {
    SAVED: number;
    APPLIED: number;
    SCREENING: number;
    INTERVIEW: number;
    OFFER: number;
    REJECTED: number;
    WITHDRAWN: number;
  };
  rates: {
    interviewRate: number;
    offerRate: number;
  };
  highlights: {
    nextInterviews: Array<{
      id: string;
      type: string | null;
      scheduledAt: string;
      jobTitle: string;
      company: string;
    }>;
    recentApplications: Array<{
      id: string;
      status: string;
      jobTitle: string;
      company: string;
    }>;
  };
};

const STATUS_TONE: Record<string, string> = {
  SAVED: "bg-slate-100 text-slate-700",
  APPLIED: "bg-sky-100 text-sky-700",
  SCREENING: "bg-amber-100 text-amber-800",
  INTERVIEW: "bg-indigo-100 text-indigo-700",
  OFFER: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  WITHDRAWN: "bg-slate-200 text-slate-600",
};

async function fetchAnalytics(): Promise<DashboardData> {
  const response = await fetch("/api/analytics");
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch analytics");
  }

  return result.data;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
  });

  const firstName =
    session?.user?.name?.split(" ")[0] ||
    session?.user?.email?.split("@")[0] ||
    "there";
  const overview = data?.overview;
  const statuses = data?.applicationStatuses;
  const nextInterviews = data?.highlights.nextInterviews ?? [];
  const recentApplications = data?.highlights.recentApplications ?? [];

  const stats = [
    {
      title: "Applications",
      value: overview?.totalApplications ?? 0,
      hint: "Saved and submitted",
      icon: Briefcase,
      accent: "bg-indigo-50 text-indigo-600",
      glow: "rgb(99 102 241 / 0.55)",
    },
    {
      title: "Interviews",
      value: overview?.totalInterviews ?? 0,
      hint: `${overview?.upcomingInterviews ?? 0} upcoming`,
      icon: CalendarDays,
      accent: "bg-sky-50 text-sky-600",
      glow: "rgb(14 165 233 / 0.5)",
    },
    {
      title: "Offers",
      value: overview?.totalOffers ?? 0,
      hint: `${data?.rates.offerRate ?? 0}% conversion`,
      icon: CircleCheck,
      accent: "bg-emerald-50 text-emerald-600",
      glow: "rgb(16 185 129 / 0.5)",
    },
    {
      title: "Rejected",
      value: overview?.totalRejected ?? 0,
      hint: "Keep iterating",
      icon: CircleX,
      accent: "bg-rose-50 text-rose-600",
      glow: "rgb(244 63 94 / 0.45)",
    },
  ];

  const pipeline = [
    ["Saved", statuses?.SAVED ?? 0],
    ["Applied", statuses?.APPLIED ?? 0],
    ["Screening", statuses?.SCREENING ?? 0],
    ["Interview", statuses?.INTERVIEW ?? 0],
    ["Offer", statuses?.OFFER ?? 0],
  ] as const;

  return (
    <div className="space-y-8">
      <section className="ui-hero rounded-3xl p-7 text-white shadow-2xl shadow-indigo-950/30 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-indigo-100">
              <Sparkles size={14} />
              Live pipeline
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome back, {firstName}.
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-indigo-100">
              {overview?.upcomingInterviews
                ? `${overview.upcomingInterviews} interview${overview.upcomingInterviews === 1 ? "" : "s"} coming up. Stay sharp.`
                : "Your next interview slot is open. Keep the pipeline moving."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="float-y rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.18em] text-indigo-200">
                Interview rate
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {isLoading ? "—" : <CountUp value={data?.rates.interviewRate ?? 0} suffix="%" />}
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.18em] text-indigo-200">
                Offer rate
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {isLoading ? "—" : <CountUp value={data?.rates.offerRate ?? 0} suffix="%" />}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/Jobs"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-950 hover:bg-indigo-50"
          >
            Browse jobs
            <ArrowUpRight size={16} />
          </Link>
          <Link
            href="/Interviews/new"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20"
          >
            <Plus size={16} />
            Schedule interview
          </Link>
        </div>
      </section>

      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
          {error instanceof Error ? error.message : "Failed to load analytics."}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  data-tilt
                  className="ui-card stat-glow p-5"
                  style={{ "--glow": stat.glow } as CSSProperties}
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.accent}`}
                    >
                      <Icon size={18} />
                    </span>
                  </div>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                    {isLoading ? "—" : <CountUp value={stat.value} />}
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">{stat.hint}</p>
                </div>
              );
            })}
          </div>

          <section className="ui-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Pipeline</h2>
                <p className="text-sm text-slate-500">Where every application sits right now.</p>
              </div>
              <Link href="/Analytics" className="text-sm font-medium text-indigo-600 hover:underline">
                Full analytics
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-5">
              {pipeline.map(([label, value], index) => (
                <div
                  key={label}
                  className="rounded-2xl bg-slate-50 px-4 py-4 text-center"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {index + 1}. {label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {isLoading ? "—" : <CountUp value={value} />}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="ui-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Upcoming interviews
                </h2>
                <Link href="/Interviews" className="text-sm font-medium text-indigo-600">
                  View all
                </Link>
              </div>
              {nextInterviews.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No upcoming interviews. Schedule one from an application.
                </p>
              ) : (
                <div className="space-y-3">
                  {nextInterviews.map((interview) => {
                    const when = new Date(interview.scheduledAt);
                    return (
                      <Link
                        key={interview.id}
                        href={`/Interviews/${interview.id}`}
                        className="block rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/60"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-900">{interview.jobTitle}</p>
                            <p className="text-sm text-slate-500">{interview.company}</p>
                          </div>
                          <span className="status-pill bg-indigo-100 text-indigo-700">
                            {interview.type || "Interview"}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          {when.toLocaleDateString()} ·{" "}
                          {when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="ui-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Recent applications
                </h2>
                <Link href="/Applications" className="text-sm font-medium text-indigo-600">
                  View all
                </Link>
              </div>
              {recentApplications.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No applications yet. Save or apply to a job to start tracking.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentApplications.map((application) => (
                    <Link
                      key={application.id}
                      href={`/Applications/${application.id}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/60"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{application.jobTitle}</p>
                        <p className="text-sm text-slate-500">{application.company}</p>
                      </div>
                      <span
                        className={`status-pill ${STATUS_TONE[application.status] ?? "bg-slate-100 text-slate-700"}`}
                      >
                        {application.status}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

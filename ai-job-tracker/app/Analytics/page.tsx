"use client";

import { useQuery } from "@tanstack/react-query";
import CountUp from "@/app/Components/Effects/CountUp";
import BackButton from "@/app/Components/Layout/BackButton";
import {
  Briefcase,
  CalendarDays,
  CircleCheck,
  CircleX,
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalJobs: number;
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
  interviewStatuses: {
    SCHEDULED: number;
    COMPLETED: number;
    CANCELLED: number;
  };
  rates: {
    applicationRate: number;
    interviewRate: number;
    offerRate: number;
    rejectionRate: number;
  };
  funnel: {
    applications: number;
    screening: number;
    interviews: number;
    offers: number;
  };
}

async function fetchAnalytics(): Promise<AnalyticsData> {
  const response = await fetch("/api/analytics");
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch analytics");
  }

  return result.data;
}

export default function AnalyticsPage() {
  const { data: analytics, isLoading, isError, error } = useQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
  });

  if (isLoading) {
    return (
      <div>
        <BackButton href="/Dashboard" label="Back to dashboard" />
        <div className="py-10 text-center text-slate-500">
          Loading analytics...
        </div>
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div>
        <BackButton href="/Dashboard" label="Back to dashboard" />
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
          {error instanceof Error ? error.message : "Failed to load analytics."}
        </div>
      </div>
    );
  }

  const { overview, applicationStatuses, interviewStatuses, rates, funnel } =
    analytics;
  const funnelMax = Math.max(funnel.applications, 1);

  return (
    <div className="space-y-8">
      <div>
        <BackButton href="/Dashboard" label="Back to dashboard" />
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track your job search performance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewCard
          title="Jobs in catalog"
          value={overview.totalJobs}
          icon={Briefcase}
          accent="bg-indigo-50 text-indigo-600"
        />
        <OverviewCard
          title="Applications"
          value={overview.totalApplications}
          icon={Briefcase}
          accent="bg-sky-50 text-sky-600"
        />
        <OverviewCard
          title="Interviews"
          value={overview.totalInterviews}
          hint={`${overview.upcomingInterviews} upcoming`}
          icon={CalendarDays}
          accent="bg-amber-50 text-amber-600"
        />
        <OverviewCard
          title="Offers"
          value={overview.totalOffers}
          icon={CircleCheck}
          accent="bg-emerald-50 text-emerald-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="ui-card p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Application status
          </h2>
          <div className="mt-5 space-y-3">
            {(
              [
                ["Saved", applicationStatuses.SAVED],
                ["Applied", applicationStatuses.APPLIED],
                ["Screening", applicationStatuses.SCREENING],
                ["Interview", applicationStatuses.INTERVIEW],
                ["Offer", applicationStatuses.OFFER],
                ["Rejected", applicationStatuses.REJECTED],
                ["Withdrawn", applicationStatuses.WITHDRAWN],
              ] as const
            ).map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"
              >
                <span className="text-sm text-slate-600">{label}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="ui-card p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Interview statistics
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Scheduled</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                <CountUp value={interviewStatuses.SCHEDULED} />
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Completed</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                <CountUp value={interviewStatuses.COMPLETED} />
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Cancelled</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                <CountUp value={interviewStatuses.CANCELLED} />
              </p>
            </div>
          </div>
          <div className="mt-5 rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Upcoming interviews</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              <CountUp value={overview.upcomingInterviews} />
            </p>
          </div>
        </section>
      </div>

      <section className="ui-card p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Conversion rates
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Based on submitted applications, not saved jobs.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <RateCard title="Applied from saved" value={rates.applicationRate} />
          <RateCard title="Interview rate" value={rates.interviewRate} />
          <RateCard title="Offer rate" value={rates.offerRate} />
          <RateCard title="Rejection rate" value={rates.rejectionRate} />
        </div>
      </section>

      <section className="ui-card p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Application funnel
        </h2>
        <div className="mt-5 space-y-3">
          {(
            [
              ["Applications", funnel.applications],
              ["Reached screening+", funnel.screening],
              ["Reached interview", funnel.interviews],
              ["Offers", funnel.offers],
            ] as const
          ).map(([label, value]) => (
            <div key={label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{label}</span>
                <span className="font-semibold text-slate-900">{value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="funnel-fill h-full rounded-full bg-linear-to-r from-indigo-500 to-sky-400"
                  style={{ width: `${Math.min(100, (value / funnelMax) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {overview.totalRejected > 0 ? (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <CircleX size={16} className="text-rose-500" />
          {overview.totalRejected} applications marked rejected.
        </p>
      ) : null}
    </div>
  );
}

function OverviewCard({
  title,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  title: string;
  value: number;
  hint?: string;
  icon: typeof Briefcase;
  accent: string;
}) {
  return (
    <div data-tilt className="ui-card p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}>
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
        <CountUp value={value} />
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

function RateCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">
        <CountUp value={value} suffix="%" />
      </p>
    </div>
  );
}

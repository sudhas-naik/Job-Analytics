"use client";

import {
  Briefcase,
  CalendarDays,
  CircleCheck,
  CircleX,
} from "lucide-react";

const stats = [
  {
    title: "Total Applications",
    value: "42",
    hint: "This month",
    icon: Briefcase,
    accent: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "Interviews",
    value: "12",
    hint: "3 upcoming",
    icon: CalendarDays,
    accent: "bg-sky-50 text-sky-600",
  },
  {
    title: "Offers",
    value: "3",
    hint: "2 pending",
    icon: CircleCheck,
    accent: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Rejected",
    value: "15",
    hint: "Keep iterating",
    icon: CircleX,
    accent: "bg-rose-50 text-rose-600",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track and manage your job search.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/60 transition-shadow hover:shadow-md"
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
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                {stat.value}
              </h2>
              <p className="mt-1 text-xs text-slate-400">{stat.hint}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

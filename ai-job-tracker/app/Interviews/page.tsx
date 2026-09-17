"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CalendarDays, Clock, Video } from "lucide-react";
import BackButton from "@/app/Components/Layout/BackButton";

type Interview = {
  id: string;
  status: string;
  type: string | null;
  scheduledAt: string;
  meetingUrl: string | null;
  application?: {
    job?: {
      title: string;
      company: string;
    };
  };
};

async function fetchInterviews() {
  const response = await fetch("/api/interviews");

  if (!response.ok) {
    throw new Error("Failed to fetch interviews");
  }

  return response.json();
}

export default function InterviewsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["interviews"],
    queryFn: fetchInterviews,
  });

  const interviews: Interview[] = data?.data ?? [];

  if (isLoading) {
    return (
      <div>
        <BackButton href="/Dashboard" label="Back to dashboard" />
        <div className="py-10 text-center text-slate-500">
          Loading interviews...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <BackButton href="/Dashboard" label="Back to dashboard" />
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
          Failed to load interviews.
        </div>
      </div>
    );
  }

  return (
    <div>
      <BackButton href="/Dashboard" label="Back to dashboard" />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Interviews
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your upcoming and completed interviews.
          </p>
        </div>

        <Link
          href="/Interviews/new"
          className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-600"
        >
          + Schedule Interview
        </Link>
      </div>

      {interviews.length === 0 ? (
        <div className="ui-card p-10 text-center">
          <CalendarDays className="mx-auto text-slate-400" size={40} />
          <h2 className="mt-4 font-semibold">No interviews scheduled</h2>
          <p className="mt-1 text-sm text-slate-500">
            Schedule an interview from one of your applications.
          </p>
          <Link
            href="/Applications"
            className="mt-5 inline-block rounded-lg bg-slate-950 px-5 py-2 text-sm text-white"
          >
            View applications
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {interviews.map((interview) => {
            const job = interview.application?.job;
            const interviewDate = new Date(interview.scheduledAt);

            return (
              <div
                key={interview.id}
                className="ui-card p-5"
                data-tilt
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold">{job?.title}</h2>
                    <p className="text-sm text-slate-500">{job?.company}</p>
                  </div>
                  <span className={`status-pill ${
                    interview.status === "COMPLETED"
                      ? "bg-emerald-100 text-emerald-700"
                      : interview.status === "CANCELLED"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-indigo-100 text-indigo-700"
                  }`}>
                    {interview.status}
                  </span>
                </div>

                <div className="mt-5 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={16} />
                    {interviewDate.toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    {interviewDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  {interview.type ? (
                    <div>
                      <strong>Type:</strong> {interview.type}
                    </div>
                  ) : null}
                  {interview.meetingUrl ? (
                    <div className="flex items-center gap-2">
                      <Video size={16} />
                      <a
                        href={interview.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        Join meeting
                      </a>
                    </div>
                  ) : null}
                </div>

                <Link
                  href={`/Interviews/${interview.id}`}
                  className="mt-5 block rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-medium transition hover:bg-indigo-50 hover:text-indigo-700"
                >
                  View Interview
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

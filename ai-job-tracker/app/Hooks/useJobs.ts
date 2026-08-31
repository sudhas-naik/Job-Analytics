"use client";

import { useQuery } from "@tanstack/react-query";

import type { JobsResponse } from "@/app/Types/job";

interface UseJobsParams {
  search?: string;
  page?: number;
  limit?: number;
}

async function fetchJobs({
  search = "",
  page = 1,
  limit = 9,
}: UseJobsParams): Promise<JobsResponse> {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  params.set("page", String(page));
  params.set("limit", String(limit));

  const response = await fetch(
    `/api/jobs?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch jobs");
  }

  return response.json();
}

export function useJobs({
  search = "",
  page = 1,
  limit = 9,
}: UseJobsParams = {}) {
  return useQuery({
    queryKey: ["jobs", { search, page, limit }],
    queryFn: () =>
      fetchJobs({
        search,
        page,
        limit,
      }),
  });
}
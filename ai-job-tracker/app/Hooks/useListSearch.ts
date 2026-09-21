"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type QueryUpdates = {
  q?: string | null;
  status?: string | null;
  page?: string | null;
};

export function useListSearch(debounceMs = 300) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const editedRef = useRef(false);

  const committedQuery = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);

  const [draft, setDraftState] = useState(committedQuery);

  useEffect(() => {
    if (editedRef.current) {
      if (draft.trim() === committedQuery) {
        editedRef.current = false;
      }
      return;
    }

    setDraftState(committedQuery);
  }, [committedQuery, draft]);

  const replaceQuery = useCallback(
    (updates: QueryUpdates) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value == null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      const next = params.toString();
      if (next === searchParams.toString()) {
        return;
      }

      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    if (!editedRef.current) {
      return;
    }

    const next = draft.trim();
    if (next === committedQuery) {
      return;
    }

    const timer = window.setTimeout(
      () => {
        replaceQuery({ q: next || null, page: null });
      },
      next === "" ? 0 : debounceMs
    );

    return () => window.clearTimeout(timer);
  }, [committedQuery, debounceMs, draft, replaceQuery]);

  const setDraft = useCallback((value: string) => {
    editedRef.current = true;
    setDraftState(value);
  }, []);

  const setStatus = useCallback(
    (next: string) => {
      replaceQuery({ status: next || null, page: null });
    },
    [replaceQuery]
  );

  const setPage = useCallback(
    (next: number) => {
      replaceQuery({ page: next <= 1 ? null : String(next) });
    },
    [replaceQuery]
  );

  const commitQuery = useCallback(() => {
    editedRef.current = false;
    replaceQuery({ q: draft.trim() || null, page: null });
  }, [draft, replaceQuery]);

  const clearQuery = useCallback(() => {
    editedRef.current = false;
    setDraftState("");
    replaceQuery({ q: null, page: null });
  }, [replaceQuery]);

  return {
    draft,
    setDraft,
    committedQuery,
    status,
    page,
    setStatus,
    setPage,
    commitQuery,
    clearQuery,
  };
}

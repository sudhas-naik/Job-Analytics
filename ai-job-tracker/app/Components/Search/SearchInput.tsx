"use client";

import { FormEvent } from "react";
import { Search, X } from "lucide-react";

export default function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Search...",
  variant = "page",
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  variant?: "page" | "navbar";
}) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit?.();
  }

  const isNavbar = variant === "navbar";

  return (
    <form role="search" onSubmit={handleSubmit} className="relative">
      <Search
        size={isNavbar ? 16 : 20}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
        className={
          isNavbar
            ? "h-10 w-56 rounded-full border border-slate-200 bg-white/80 py-2 pl-9 pr-9 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 [&::-webkit-search-cancel-button]:hidden focus:w-72 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 lg:w-64"
            : "w-full rounded-xl border border-slate-200 bg-white/90 py-3 pl-10 pr-10 text-sm outline-none transition placeholder:text-slate-400 [&::-webkit-search-cancel-button]:hidden focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
        }
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
        >
          <X size={16} />
        </button>
      ) : null}
    </form>
  );
}

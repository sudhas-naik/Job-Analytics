"use client";

import Link from "next/link";
import { Bell, Search, UserCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const displayName = session?.user?.name || session?.user?.email || "User";

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    const next = query.trim();
    router.push(next ? `/Jobs?q=${encodeURIComponent(next)}` : "/Jobs");
  }

  return (
    <header className="fixed left-64 right-0 top-0 z-10 flex h-16 items-center justify-between border-b border-white/60 bg-white/70 px-6 backdrop-blur-xl">
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">
          Job Tracker
        </h2>
        <p className="text-xs text-slate-500">Your search at a glance</p>
      </div>

      <div className="flex items-center gap-3">
        <form onSubmit={handleSearch} className="relative hidden md:block">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search jobs, companies..."
            className="h-10 w-64 rounded-full border border-slate-200 bg-white/80 pl-9 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:w-72 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
        </form>

        <Link
          href="/Interviews"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:-translate-y-0.5 hover:text-indigo-600 hover:shadow-md"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_0_4px_rgb(99_102_241/0.2)]" />
        </Link>

        <Link
          href="/Profile"
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <UserCircle size={28} className="text-indigo-500" />
          <span className="max-w-40 truncate text-sm font-medium text-slate-700">
            {displayName}
          </span>
        </Link>
      </div>
    </header>
  );
}

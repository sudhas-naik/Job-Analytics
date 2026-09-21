"use client";

import Link from "next/link";
import { Bell, UserCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import SearchInput from "@/app/Components/Search/SearchInput";
import {
  isListSearchPage,
  listSearchHref,
  listSearchPath,
  searchPlaceholder,
} from "@/lib/search";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = isListSearchPage(pathname) ? (searchParams.get("q") ?? "") : "";
  const [query, setQuery] = useState(urlQuery);
  const displayName = session?.user?.name || session?.user?.email || "User";

  useEffect(() => {
    if (!isListSearchPage(pathname)) {
      return;
    }

    setQuery(searchParams.get("q") ?? "");
  }, [pathname, searchParams]);

  function applySearch(nextQuery: string) {
    const next = nextQuery.trim();
    const dest = listSearchPath(pathname);

    if (isListSearchPage(pathname) && dest === pathname) {
      router.replace(listSearchHref(pathname, searchParams.toString(), next), {
        scroll: false,
      });
      return;
    }

    router.push(next ? `${dest}?q=${encodeURIComponent(next)}` : dest);
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
        <div className="hidden md:block">
          <SearchInput
            variant="navbar"
            value={query}
            onChange={(value) => {
              setQuery(value);
              if (value === "" && isListSearchPage(pathname)) {
                applySearch("");
              }
            }}
            onSubmit={() => applySearch(query)}
            placeholder={searchPlaceholder(pathname)}
          />
        </div>
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
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={displayName}
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <UserCircle size={28} className="text-indigo-500" />
          )}
          <span className="max-w-40 truncate text-sm font-medium text-slate-700">
            {displayName}
          </span>
        </Link>
      </div>
    </header>
  );
}

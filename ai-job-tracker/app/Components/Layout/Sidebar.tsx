"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  ClipboardList,
  CalendarDays,
  BarChart3,
  UserRound,
  Settings,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    href: "/Dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Jobs",
    href: "/Jobs",
    icon: Briefcase,
  },
  {
    name: "Applications",
    href: "/Applications",
    icon: ClipboardList,
  },
  {
    name: "Interviews",
    href: "/Interviews",
    icon: CalendarDays,
  },
  {
    name: "Analytics",
    href: "/Analytics",
    icon: BarChart3,
  },
  {
    name: "Profile",
    href: "/Profile",
    icon: UserRound,
  },
  {
    name: "Settings",
    href: "/Settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-64 flex-col border-r border-white/10 bg-slate-950/95 p-5 text-slate-200 backdrop-blur-xl">
      <div className="mb-8 flex items-center gap-3 px-1">
        <div className="logo-pulse flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-sm font-bold text-white">
          AJ
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight text-white">
            AI Job Tracker
          </h1>
          <p className="text-xs text-slate-400">Career Management</p>
        </div>
      </div>
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.toLowerCase().startsWith(item.href.toLowerCase());

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                  : "text-slate-300 hover:translate-x-0.5 hover:bg-white/10 hover:text-white"
              }`}
            >
              {active ? (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white" />
              ) : null}
              <Icon size={18} className={active ? "scale-110" : "transition-transform group-hover:scale-110"} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-2xl border border-white/10 bg-linear-to-br from-white/10 to-white/5 p-4">
        <p className="text-xs font-medium text-slate-200">Keep going</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Track every application and stay ready for the next interview.
        </p>
      </div>
    </aside>
  );
}

"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton({
  href,
  label = "Back",
  className = "mb-4",
}: {
  href: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  function handleClick() {
    const referrer = document.referrer;
    const canGoBack =
      referrer.startsWith(window.location.origin) &&
      new URL(referrer).pathname !== window.location.pathname;

    if (canGoBack) {
      router.back();
      return;
    }

    router.push(href);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`ui-back group inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-3.5 py-1.5 text-sm font-medium text-slate-600 shadow-sm backdrop-blur transition hover:-translate-x-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 ${className}`}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition group-hover:bg-indigo-100 group-hover:text-indigo-700">
        <ArrowLeft
          size={14}
          className="transition-transform duration-200 group-hover:-translate-x-0.5"
        />
      </span>
      {label}
    </button>
  );
}

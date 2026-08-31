"use client";

import { Search } from "lucide-react";

interface JobSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function JobSearch({
  value,
  onChange,
}: JobSearchProps) {
  return (
    <div className="relative">
      <Search
        size={20}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search jobs or companies..."
        className="w-full rounded-xl border bg-white py-3 pl-10 pr-4 outline-none transition focus:border-black"
      />
    </div>
  );
}
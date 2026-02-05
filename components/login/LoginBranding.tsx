"use client";

import { APP } from "@/lib/constants";

export function LoginBranding() {
  return (
    <div className="flex flex-col items-center gap-2 text-center opacity-0 animate-fade-in-up">
      <div className="flex items-center justify-center gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#c92a2a] text-white shadow-lg shadow-[#c92a2a]/25 transition-transform duration-300 hover:scale-105"
          aria-hidden
        >
          <span className="text-2xl font-bold tracking-tight">B</span>
        </div>
        <div className="text-left">
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1d21]">
            <span className="text-[#c92a2a]">{APP.namePrimary}</span>{" "}
            <span className="text-[#495057]">{APP.nameSuffix}</span>
          </h1>
          <p className="mt-0.5 text-sm font-medium tracking-wide text-[#6c757d]">
            {APP.tagline}
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { POPULAR_LOYALTY_PROGRAMS } from "../../lib/onboarding";

type ProgramSelectionProps = {
  value: string[];
  onChange: (next: string[]) => void;
};

const PROGRAMS = POPULAR_LOYALTY_PROGRAMS.sort();

export function ProgramSelection({ value, onChange }: ProgramSelectionProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return PROGRAMS;
    }
    return PROGRAMS.filter((program) =>
      program.toLowerCase().includes(query.trim().toLowerCase())
    );
  }, [query]);

  const toggleProgram = (program: string) => {
    if (value.includes(program)) {
      onChange(value.filter((entry) => entry !== program));
    } else {
      onChange([...value, program]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="program-search">
          Search programs
        </label>
        <input
          id="program-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search airlines or hotel programs"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map((program) => {
          const selected = value.includes(program);
          return (
            <button
              key={program}
              type="button"
              onClick={() => toggleProgram(program)}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                selected
                  ? "border-slate-900 bg-slate-900/90 text-white"
                  : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
              }`}
            >
              <span>{program}</span>
              {selected ? <span className="text-xs uppercase tracking-wide">Selected</span> : null}
            </button>
          );
        })}
        {filtered.length === 0 ? (
          <p className="col-span-full rounded-lg border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
            No loyalty programs found. Try another search term.
          </p>
        ) : null}
      </div>
    </div>
  );
}

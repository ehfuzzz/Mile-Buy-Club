"use client";

import { useFormContext } from "react-hook-form";
import type { UserSettings } from "../../lib/settings";

export function PrivacySettings() {
  const { register } = useFormContext<UserSettings>();

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-900">Privacy & visibility</h2>
        <p className="text-sm text-slate-600">Control what data you share with Mile Buy Club and how your profile appears to other members.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm">
          <span className="font-medium text-slate-600">Analytics data</span>
          <input type="checkbox" className="h-4 w-4" {...register("privacy.analytics")} />
        </label>
        <label className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm">
          <span className="font-medium text-slate-600">Usage statistics</span>
          <input type="checkbox" className="h-4 w-4" {...register("privacy.usageStats")} />
        </label>
        <label className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm">
          <span className="font-medium text-slate-600">Marketing data sharing</span>
          <input type="checkbox" className="h-4 w-4" {...register("privacy.marketing")} />
        </label>
        <label className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm">
          <span className="font-medium text-slate-600">Public profile</span>
          <input type="checkbox" className="h-4 w-4" {...register("privacy.publicProfile")} />
        </label>
        <label className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm">
          <span className="font-medium text-slate-600">Show in leaderboards</span>
          <input type="checkbox" className="h-4 w-4" {...register("privacy.leaderboards")} />
        </label>
        <label className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm">
          <span className="font-medium text-slate-600">Anonymous mode</span>
          <input type="checkbox" className="h-4 w-4" {...register("privacy.anonymous")} />
        </label>
      </div>
    </section>
  );
}

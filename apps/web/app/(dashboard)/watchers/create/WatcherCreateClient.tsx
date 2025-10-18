"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createWatcher, type WatcherFormValues } from "../../../lib/watchers";
import { WatcherForm } from "../../../components/watchers/WatcherForm";

export function WatcherCreateClient() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: WatcherFormValues) => {
    try {
      setError(null);
      await createWatcher(values);
      router.push("/watchers");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create watcher.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Create watcher</h1>
        <p className="text-sm text-slate-600">Set up a watcher to automatically monitor new award deals for this route.</p>
      </div>
      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}
      <WatcherForm onSubmit={handleSubmit} />
    </div>
  );
}

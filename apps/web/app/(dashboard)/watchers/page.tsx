import { requireAuth } from "../../../lib/auth";
import { fetchWatchers } from "../../../lib/watchers";
import { WatchersDashboardClient } from "./WatchersDashboardClient";

export const metadata = {
  title: "Watchers"
};

export default async function WatchersPage() {
  await requireAuth();
  const watchers = await fetchWatchers();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-12 pt-6">
      <WatchersDashboardClient initialWatchers={watchers} />
    </main>
  );
}

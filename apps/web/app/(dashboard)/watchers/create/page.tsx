import { requireAuth } from "../../../../lib/auth";
import { WatcherCreateClient } from "./WatcherCreateClient";

export const metadata = {
  title: "Create watcher"
};

export default async function WatcherCreatePage() {
  await requireAuth();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-12 pt-6">
      <WatcherCreateClient />
    </main>
  );
}

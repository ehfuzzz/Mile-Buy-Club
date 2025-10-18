import { requireAuth } from "../../../lib/auth";
import { fetchUserSettings } from "../../../lib/settings";
import { SettingsClient } from "./SettingsClient";

export const metadata = {
  title: "Settings"
};

export default async function SettingsPage() {
  const session = await requireAuth();
  const settings = await fetchUserSettings();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-12 pt-6">
      <SettingsClient initialSettings={settings} userEmail={session.user?.email ?? ""} />
    </main>
  );
}

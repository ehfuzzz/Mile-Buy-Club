import { fetchDeals } from "../../../lib/deals";
import { DealsDashboardClient } from "./DealsDashboardClient";

export const metadata = {
  title: "Deals"
};

export default async function DealsPage() {
  // Temporarily remove auth requirement to test deals
  // await requireAuth();
  const deals = await fetchDeals();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-12 pt-6">
      <DealsDashboardClient deals={deals} />
    </main>
  );
}

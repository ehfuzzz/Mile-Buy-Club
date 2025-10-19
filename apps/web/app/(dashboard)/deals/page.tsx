import { fetchDeals, type Deal } from "../../../lib/deals";
import { DealsDashboardClient } from "./DealsDashboardClient";

export const metadata = {
  title: "Deals",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface DealsPageProps {
  searchParams?: {
    userId?: string | string[];
  };
}

export default async function DealsPage({ searchParams }: DealsPageProps) {
  // Temporarily remove auth requirement to test deals
  // await requireAuth();
  const userIdParam = searchParams?.userId;
  const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;

  let initialDeals: Deal[] | undefined;

  try {
    initialDeals = await fetchDeals(userId);
  } catch (error) {
    console.error("Failed to load deals for dashboard", error);
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-12 pt-6">
      <DealsDashboardClient initialDeals={initialDeals} userId={userId} />
    </main>
  );
}

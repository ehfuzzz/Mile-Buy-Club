import { requireAuth } from "../../../lib/auth";
import { OnboardingFlow } from "../../../components/onboarding/OnboardingFlow";

export const metadata = {
  title: "Onboarding"
};

export default async function OnboardingPage() {
  await requireAuth();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col px-4 pb-12 pt-6">
      <OnboardingFlow />
    </main>
  );
}

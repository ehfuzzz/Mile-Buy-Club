export type TravelFrequency = "occasional" | "regular" | "frequent";

export type CabinClassOption = "economy" | "premium" | "business" | "first";

export interface BudgetRange {
  min: number;
  max: number;
}

export interface NotificationPreferenceState {
  email: boolean;
  push: boolean;
  digestFrequency: "daily" | "weekly" | "never";
  dealTypes: string[];
}

export interface OnboardingPreferences {
  programs: string[];
  homeAirport: string;
  cabinPreferences: CabinClassOption[];
  travelFrequency: TravelFrequency;
  budgetRange: BudgetRange;
  notifications: NotificationPreferenceState;
}

const STORAGE_KEY = "mbc:onboarding";

export const DEFAULT_ONBOARDING_PREFERENCES: OnboardingPreferences = {
  programs: [],
  homeAirport: "",
  cabinPreferences: ["economy"],
  travelFrequency: "occasional",
  budgetRange: {
    min: 150,
    max: 1500
  },
  notifications: {
    email: true,
    push: false,
    digestFrequency: "weekly",
    dealTypes: ["flights", "hotels"]
  }
};

export function loadOnboardingPreferences(): OnboardingPreferences {
  if (typeof window === "undefined") {
    return { ...DEFAULT_ONBOARDING_PREFERENCES };
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { ...DEFAULT_ONBOARDING_PREFERENCES };
    }

    const parsed = JSON.parse(stored) as Partial<OnboardingPreferences>;
    return {
      ...DEFAULT_ONBOARDING_PREFERENCES,
      ...parsed,
      notifications: {
        ...DEFAULT_ONBOARDING_PREFERENCES.notifications,
        ...parsed.notifications
      },
      budgetRange: {
        ...DEFAULT_ONBOARDING_PREFERENCES.budgetRange,
        ...parsed.budgetRange
      }
    };
  } catch (error) {
    console.warn("Failed to parse onboarding preferences", error);
    return { ...DEFAULT_ONBOARDING_PREFERENCES };
  }
}

export function persistOnboardingPreferences(preferences: OnboardingPreferences) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

export async function submitOnboardingPreferences(preferences: OnboardingPreferences) {
  const response = await fetch("/api/user/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(preferences)
  });

  if (!response.ok) {
    throw new Error("Failed to save onboarding preferences");
  }

  return response.json().catch(() => ({}));
}

export const POPULAR_LOYALTY_PROGRAMS = [
  "United MileagePlus",
  "Delta SkyMiles",
  "American AAdvantage",
  "Southwest Rapid Rewards",
  "Alaska Mileage Plan",
  "JetBlue TrueBlue",
  "British Airways Executive Club",
  "Air Canada Aeroplan",
  "Qatar Airways Privilege Club",
  "Singapore KrisFlyer",
  "Marriott Bonvoy",
  "Hilton Honors",
  "IHG One Rewards",
  "World of Hyatt",
  "Choice Privileges",
  "Accor Live Limitless"
];

export const CABIN_OPTIONS: { value: CabinClassOption; label: string }[] = [
  { value: "economy", label: "Economy" },
  { value: "premium", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First" }
];

export const DEAL_TYPE_OPTIONS = ["flights", "hotels", "activities"] as const;

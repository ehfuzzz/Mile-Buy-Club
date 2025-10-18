import { z } from "zod";

export const notificationSettingsSchema = z.object({
  email: z.object({
    dealAlerts: z.boolean(),
    weeklyDigest: z.boolean(),
    accountUpdates: z.boolean(),
    marketing: z.boolean()
  }),
  push: z.object({
    enabled: z.boolean(),
    sound: z.boolean(),
    quietHours: z.object({
      start: z.string(),
      end: z.string()
    })
  }),
  frequency: z.enum(["immediate", "hourly", "daily", "weekly"]),
  dealTypes: z.object({
    flights: z.boolean(),
    hotels: z.boolean(),
    activities: z.boolean(),
    cards: z.boolean()
  })
});

export const privacySettingsSchema = z.object({
  analytics: z.boolean(),
  usageStats: z.boolean(),
  marketing: z.boolean(),
  publicProfile: z.boolean(),
  leaderboards: z.boolean(),
  anonymous: z.boolean()
});

export const preferenceSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "auto"]),
  language: z.string(),
  timezone: z.string(),
  dateFormat: z.string(),
  defaultSort: z.string(),
  defaultView: z.enum(["grid", "list"]),
  itemsPerPage: z.number().min(5).max(100),
  autoRefresh: z.number().min(0).max(60)
});

export const userSettingsSchema = z.object({
  profile: z.object({
    displayName: z.string().min(1, "Display name is required."),
    bio: z.string().max(320).optional(),
    profilePicture: z.string().optional()
  }),
  notifications: notificationSettingsSchema,
  privacy: privacySettingsSchema,
  preferences: preferenceSettingsSchema
});

export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
export type PrivacySettings = z.infer<typeof privacySettingsSchema>;
export type PreferenceSettings = z.infer<typeof preferenceSettingsSchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;

export const DEFAULT_USER_SETTINGS: UserSettings = {
  profile: {
    displayName: "Traveler",
    bio: "",
    profilePicture: ""
  },
  notifications: {
    email: {
      dealAlerts: true,
      weeklyDigest: true,
      accountUpdates: true,
      marketing: false
    },
    push: {
      enabled: false,
      sound: true,
      quietHours: { start: "22:00", end: "07:00" }
    },
    frequency: "daily",
    dealTypes: {
      flights: true,
      hotels: true,
      activities: false,
      cards: false
    }
  },
  privacy: {
    analytics: true,
    usageStats: true,
    marketing: false,
    publicProfile: true,
    leaderboards: true,
    anonymous: false
  },
  preferences: {
    theme: "auto",
    language: "en",
    timezone: "America/Los_Angeles",
    dateFormat: "MM/dd/yyyy",
    defaultSort: "best",
    defaultView: "grid",
    itemsPerPage: 20,
    autoRefresh: 5
  }
};

export async function fetchUserSettings(): Promise<UserSettings> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return DEFAULT_USER_SETTINGS;
}

export async function updateUserSettings(settings: UserSettings) {
  const response = await fetch("/api/user/settings", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(settings)
  });

  if (!response.ok) {
    throw new Error("Failed to update settings");
  }

  return response.json().catch(() => ({}));
}

import { z } from "zod";
import { DEAL_TYPE_OPTIONS } from "../../lib/onboarding";

const cabinValues = ["economy", "premium", "business", "first"] as const;
const frequencyValues = ["occasional", "regular", "frequent"] as const;
const digestValues = ["daily", "weekly", "never"] as const;
const dealTypeValues = DEAL_TYPE_OPTIONS;

export const onboardingFormSchema = z.object({
  programs: z
    .array(z.string())
    .min(1, "Select at least one program to tailor your deals."),
  homeAirport: z
    .string()
    .min(3, "Enter a valid home airport code.")
    .max(8, "Use the short code (e.g. LAX, JFK)."),
  cabinPreferences: z
    .array(z.enum(cabinValues))
    .min(1, "Pick at least one preferred cabin."),
  travelFrequency: z.enum(frequencyValues),
  budgetRange: z
    .object({
      min: z.number().min(0, "Budget must be positive."),
      max: z.number().min(0, "Budget must be positive.")
    })
    .refine((range) => range.max >= range.min, {
      message: "Maximum budget should be greater than minimum."
    }),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    digestFrequency: z.enum(digestValues),
    dealTypes: z.array(z.enum(dealTypeValues)).min(1, "Pick at least one deal type."),
  })
});

export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;

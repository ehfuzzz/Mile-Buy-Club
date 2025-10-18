"use client";

import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import {
  DEFAULT_ONBOARDING_PREFERENCES,
  loadOnboardingPreferences,
  persistOnboardingPreferences,
  submitOnboardingPreferences,
  DEAL_TYPE_OPTIONS
} from "../../lib/onboarding";
import { requestPermission, subscribeToPush, unsubscribeFromPush } from "../../lib/notifications/client";
import { OnboardingStep } from "./OnboardingStep";
import { PreferencesForm } from "./PreferencesForm";
import { ProgramSelection } from "./ProgramSelection";
import { onboardingFormSchema, type OnboardingFormValues } from "./types";

interface OnboardingFlowProps {
  onComplete?: () => void;
}

const TOTAL_STEPS = 5;

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    mode: "onChange",
    defaultValues: DEFAULT_ONBOARDING_PREFERENCES
  });
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadOnboardingPreferences();
    form.reset(stored);
  }, [form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      persistOnboardingPreferences({
        ...DEFAULT_ONBOARDING_PREFERENCES,
        ...(value as OnboardingFormValues)
      });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const programs = form.watch("programs");
  const notifications = form.watch("notifications");

  const summary = useMemo(() => {
    const values = form.getValues();
    return {
      programs: values.programs,
      homeAirport: values.homeAirport,
      cabinPreferences: values.cabinPreferences,
      travelFrequency: values.travelFrequency,
      budgetRange: values.budgetRange,
      notifications: values.notifications
    };
  }, [form, step]);

  const goToNext = async () => {
    setError(null);
    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      const valid = await form.trigger("programs");
      if (!valid) {
        setError("Select at least one program to continue.");
        return;
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      const valid = await form.trigger([
        "homeAirport",
        "cabinPreferences",
        "travelFrequency",
        "budgetRange"
      ]);
      if (!valid) {
        setError("Please complete your travel preferences before proceeding.");
        return;
      }
      setStep(4);
      return;
    }

    if (step === 4) {
      const valid = await form.trigger("notifications");
      if (!valid) {
        setError("Pick how you want to be notified about deals.");
        return;
      }
      setStep(5);
      return;
    }
  };

  const goToPrevious = () => {
    setError(null);
    setStep((current) => Math.max(1, current - 1));
  };

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled) {
      const permission = await requestPermission();
      if (permission !== "granted") {
        setError("We need permission to send push notifications. Try enabling them in your browser settings.");
        form.setValue("notifications.push", false, { shouldValidate: true });
        return;
      }
      await subscribeToPush();
      form.setValue("notifications.push", true, { shouldValidate: true });
    } else {
      await unsubscribeFromPush();
      form.setValue("notifications.push", false, { shouldValidate: true });
    }
  };

  const handleComplete = async () => {
    const valid = await form.trigger();
    if (!valid) {
      setError("Review your answers before finishing onboarding.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const values = form.getValues();
      persistOnboardingPreferences(values);
      await submitOnboardingPreferences(values);
      setIsSaving(false);
      onComplete?.();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save preferences right now.");
      setIsSaving(false);
    }
  };

  return (
    <FormProvider {...form}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 py-8">
        <ProgressBar current={step} total={TOTAL_STEPS} />
        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : null}
        {step === 1 ? (
          <OnboardingStep
            step={1}
            totalSteps={TOTAL_STEPS}
            title="Welcome to Mile Buy Club"
            description="Let us tailor the deals you see based on your favorite loyalty programs and travel preferences."
            footer={
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">
                  We will ask a few quick questions to personalize your dashboard experience.
                </p>
                <button
                  type="button"
                  onClick={goToNext}
                  className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Get started
                </button>
              </div>
            }
          >
            <div className="grid gap-4 text-sm text-slate-600">
              <p>Track award availability, set smart watchers, and never miss a redemption opportunity.</p>
              <ul className="grid gap-2">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400" aria-hidden />
                  Personalize the deals you see by selecting the loyalty programs you care about.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400" aria-hidden />
                  Share your travel preferences so we can surface the most relevant alerts.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400" aria-hidden />
                  Decide how Mile Buy Club should keep you informed about new deals.
                </li>
              </ul>
            </div>
          </OnboardingStep>
        ) : null}
        {step === 2 ? (
          <OnboardingStep
            step={2}
            totalSteps={TOTAL_STEPS}
            title="Pick your loyalty programs"
            description="Choose the airline and hotel programs you want us to track. You can update this list anytime."
            footer={
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={goToPrevious}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Continue
                </button>
              </div>
            }
          >
            <ProgramSelection value={programs} onChange={(items) => form.setValue("programs", items, { shouldValidate: true })} />
          </OnboardingStep>
        ) : null}
        {step === 3 ? (
          <OnboardingStep
            step={3}
            totalSteps={TOTAL_STEPS}
            title="Tell us about your travel style"
            description="Knowing your home airport and preferred cabins helps us tune the deals we highlight."
            footer={
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={goToPrevious}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Continue
                </button>
              </div>
            }
          >
            <PreferencesForm form={form} />
          </OnboardingStep>
        ) : null}
        {step === 4 ? (
          <OnboardingStep
            step={4}
            totalSteps={TOTAL_STEPS}
            title="Notification preferences"
            description="Choose how and when Mile Buy Club should alert you about new opportunities."
            footer={
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={goToPrevious}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Continue
                </button>
              </div>
            }
          >
            <div className="flex flex-col gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                  <div>
                    <span className="block text-sm font-medium text-slate-700">Email notifications</span>
                    <span className="text-xs text-slate-500">Get real-time alerts in your inbox.</span>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={notifications.email}
                    onChange={(event) =>
                      form.setValue("notifications.email", event.target.checked, { shouldValidate: true })
                    }
                  />
                </label>
                <label className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                  <div>
                    <span className="block text-sm font-medium text-slate-700">Push notifications</span>
                    <span className="text-xs text-slate-500">Enable browser push alerts for instant updates.</span>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={notifications.push}
                    onChange={(event) => void handlePushToggle(event.target.checked)}
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="digestFrequency">
                    Digest frequency
                  </label>
                  <select
                    id="digestFrequency"
                    value={notifications.digestFrequency}
                    onChange={(event) =>
                      form.setValue("notifications.digestFrequency", event.target.value as OnboardingFormValues["notifications"]["digestFrequency"], {
                        shouldValidate: true
                      })
                    }
                    className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="never">Never</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">Deal types</span>
                  <div className="flex flex-wrap gap-2">
                    {DEAL_TYPE_OPTIONS.map((dealType) => {
                      const selected = notifications.dealTypes.includes(dealType);
                      return (
                        <button
                          key={dealType}
                          type="button"
                          onClick={() => {
                            const current = form.getValues("notifications.dealTypes");
                            const next = selected
                              ? current.filter((item) => item !== dealType)
                              : [...current, dealType];
                            form.setValue("notifications.dealTypes", next, { shouldValidate: true });
                          }}
                          className={`rounded-full border px-4 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                            selected
                              ? "border-slate-900 bg-slate-900/90 text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          {dealType.charAt(0).toUpperCase() + dealType.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </OnboardingStep>
        ) : null}
        {step === 5 ? (
          <OnboardingStep
            step={5}
            totalSteps={TOTAL_STEPS}
            title="You're all set"
            description="Review your preferences and start exploring curated award deals."
            footer={
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={goToPrevious}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  Back
                </button>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                  >
                    Skip for now
                  </Link>
                  <button
                    type="button"
                    onClick={handleComplete}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
                  >
                    {isSaving ? "Saving..." : "Start finding deals"}
                  </button>
                </div>
              </div>
            }
          >
            <dl className="grid gap-4 text-sm text-slate-700">
              <div>
                <dt className="font-medium text-slate-500">Loyalty programs</dt>
                <dd>{summary.programs.join(", ")}</dd>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="font-medium text-slate-500">Home airport</dt>
                  <dd className="uppercase">{summary.homeAirport || "Not set"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Cabin preferences</dt>
                  <dd>{summary.cabinPreferences.join(", ")}</dd>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="font-medium text-slate-500">Travel frequency</dt>
                  <dd>{summary.travelFrequency}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Budget range</dt>
                  <dd>
                    ${summary.budgetRange.min.toLocaleString()} – ${summary.budgetRange.max.toLocaleString()}
                  </dd>
                </div>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Notifications</dt>
                <dd className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-wide">
                    Email: {notifications.email ? "On" : "Off"}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-wide">
                    Push: {notifications.push ? "On" : "Off"}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-wide">
                    Digest: {notifications.digestFrequency}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-wide">
                    Types: {notifications.dealTypes.join(", ")}
                  </span>
                </dd>
              </div>
            </dl>
          </OnboardingStep>
        ) : null}
      </div>
    </FormProvider>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const progress = (current / total) * 100;
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
        <span>Onboarding</span>
        <span>
          {current}/{total}
        </span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-slate-900 transition-all"
          style={{ width: `${progress}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}

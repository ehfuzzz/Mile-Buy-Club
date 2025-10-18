"use client";

import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { OnboardingFormValues } from "./types";
import { CABIN_OPTIONS } from "../../lib/onboarding";

type PreferencesFormProps = {
  form: UseFormReturn<OnboardingFormValues>;
};

export function PreferencesForm({ form }: PreferencesFormProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors }
  } = form;

  const minBudget = watch("budgetRange.min");
  const maxBudget = watch("budgetRange.max");
  const cabinPreferences = watch("cabinPreferences");

  useEffect(() => {
    if (maxBudget < minBudget) {
      setValue("budgetRange.max", minBudget, { shouldValidate: true, shouldDirty: true });
    }
  }, [maxBudget, minBudget, setValue]);

  const toggleCabin = (value: string) => {
    if (cabinPreferences.includes(value as typeof cabinPreferences[number])) {
      setValue(
        "cabinPreferences",
        cabinPreferences.filter((option) => option !== value),
        { shouldDirty: true, shouldValidate: true }
      );
    } else {
      setValue("cabinPreferences", [...cabinPreferences, value as typeof cabinPreferences[number]], {
        shouldDirty: true,
        shouldValidate: true
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="homeAirport">
          Home airport
        </label>
        <input
          id="homeAirport"
          placeholder="e.g. LAX"
          {...register("homeAirport")}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
        {errors.homeAirport ? (
          <p className="text-sm text-rose-500">{errors.homeAirport.message}</p>
        ) : null}
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-slate-700">Preferred cabins</legend>
        <div className="flex flex-wrap gap-2">
          {CABIN_OPTIONS.map((option) => {
            const selected = cabinPreferences.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleCabin(option.value)}
                className={`rounded-full border px-4 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                  selected
                    ? "border-slate-900 bg-slate-900/90 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {errors.cabinPreferences ? (
          <p className="text-sm text-rose-500">{errors.cabinPreferences.message}</p>
        ) : null}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="travelFrequency">
            Travel frequency
          </label>
          <select
            id="travelFrequency"
            {...register("travelFrequency")}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="occasional">Occasional</option>
            <option value="regular">Regular</option>
            <option value="frequent">Frequent</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Budget range (USD)</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              {...register("budgetRange.min", { valueAsNumber: true })}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            <span className="text-slate-500">to</span>
            <input
              type="number"
              min={0}
              {...register("budgetRange.max", { valueAsNumber: true })}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          {(errors.budgetRange?.min || errors.budgetRange?.max) && (
            <p className="text-sm text-rose-500">
              {errors.budgetRange?.min?.message ?? errors.budgetRange?.max?.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

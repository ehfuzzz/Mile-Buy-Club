"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { DEFAULT_WATCHER_FORM_VALUES, type WatcherFormValues, watcherFormSchema } from "../../lib/watchers";

const AIRLINE_OPTIONS = ["United", "Delta", "American", "Southwest", "Alaska", "JetBlue", "British Airways"];
const CABIN_OPTIONS = ["economy", "premium", "business", "first"];
const DEPARTURE_TIME_OPTIONS = ["morning", "afternoon", "evening", "overnight"];
const AIRCRAFT_OPTIONS = ["A320", "A321", "A350", "B737", "B777", "B787"];
const ALLIANCE_OPTIONS = ["Star Alliance", "SkyTeam", "oneworld"];
const FREQUENCY_OPTIONS = [
  { value: "immediate", label: "Immediate" },
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" }
];

interface WatcherFormProps {
  defaultValues?: WatcherFormValues;
  onSubmit?: (values: WatcherFormValues) => Promise<void> | void;
}

export function WatcherForm({ defaultValues, onSubmit }: WatcherFormProps) {
  const form = useForm<WatcherFormValues>({
    resolver: zodResolver(watcherFormSchema),
    defaultValues: defaultValues ?? DEFAULT_WATCHER_FORM_VALUES
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = form;
  const [blackoutDate, setBlackoutDate] = useState("");

  const blackoutDates = watch("criteria.blackoutDates");
  const isRoundTrip = watch("route.isRoundTrip");
  const selectedAirlines = watch("criteria.airlines");
  const excludedAirlines = watch("criteria.excludeAirlines");
  const departureTimes = watch("filters.departureTime");
  const aircraftTypes = watch("filters.aircraftTypes");
  const alliances = watch("filters.alliances");

  const submitHandler = handleSubmit(async (values) => {
    await onSubmit?.(values);
  });

  const toggleCriteriaList = (key: "airlines" | "excludeAirlines", item: string) => {
    const current = form.getValues(`criteria.${key}`);
    const next = current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item];
    setValue(`criteria.${key}`, next, { shouldValidate: true });
  };

  const toggleFilterList = (key: "departureTime" | "aircraftTypes" | "alliances", item: string) => {
    const current = form.getValues(`filters.${key}`);
    const next = current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item];
    setValue(`filters.${key}`, next, { shouldValidate: true });
  };

  const addBlackoutDate = () => {
    if (!blackoutDate) return;
    if (!blackoutDates.includes(blackoutDate)) {
      setValue("criteria.blackoutDates", [...blackoutDates, blackoutDate], { shouldValidate: true });
    }
    setBlackoutDate("");
  };

  return (
    <form onSubmit={submitHandler} className="flex flex-col gap-6">
      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Route details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600">Origin</span>
            <input
              {...register("route.origin")}
              placeholder="e.g. LAX"
              className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            {errors.route?.origin ? <span className="text-xs text-rose-500">{errors.route.origin.message}</span> : null}
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600">Destination</span>
            <input
              {...register("route.destination")}
              placeholder="e.g. JFK"
              className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            {errors.route?.destination ? (
              <span className="text-xs text-rose-500">{errors.route.destination.message}</span>
            ) : null}
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600">Departure</span>
            <input
              type="date"
              {...register("route.departureDate")}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            {errors.route?.departureDate ? (
              <span className="text-xs text-rose-500">{errors.route.departureDate.message}</span>
            ) : null}
          </label>
          {isRoundTrip ? (
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-600">Return</span>
              <input
                type="date"
                {...register("route.returnDate")}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
              {errors.route?.returnDate ? (
                <span className="text-xs text-rose-500">{errors.route.returnDate.message}</span>
              ) : null}
            </label>
          ) : null}
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <input
              type="checkbox"
              {...register("route.isRoundTrip")}
              className="h-4 w-4"
            />
            Round trip
          </label>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Deal criteria</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600">Cabin</span>
            <select
              {...register("criteria.cabinClass")}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              {CABIN_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600">Passengers</span>
            <input
              type="number"
              min={1}
              max={9}
              {...register("criteria.passengers", { valueAsNumber: true })}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            {errors.criteria?.passengers ? (
              <span className="text-xs text-rose-500">{errors.criteria.passengers.message}</span>
            ) : null}
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600">Seat preference</span>
            <select
              {...register("criteria.seatPreference")}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="any">Any</option>
              <option value="window">Window</option>
              <option value="aisle">Aisle</option>
              <option value="bulkhead">Bulkhead</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600">Max cash price ($)</span>
            <input
              type="number"
              min={0}
              {...register("criteria.maxPrice", { valueAsNumber: true })}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            {errors.criteria?.maxPrice ? (
              <span className="text-xs text-rose-500">{errors.criteria.maxPrice.message}</span>
            ) : null}
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600">Min CPP</span>
            <input
              type="number"
              min={0}
              step="0.1"
              {...register("criteria.minCpp", { valueAsNumber: true })}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            {errors.criteria?.minCpp ? (
              <span className="text-xs text-rose-500">{errors.criteria.minCpp.message}</span>
            ) : null}
          </label>
          <div className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600">Airlines</span>
            <div className="flex flex-wrap gap-2">
              {AIRLINE_OPTIONS.map((airline) => {
                const selected = selectedAirlines.includes(airline);
                return (
                  <button
                    key={airline}
                    type="button"
                    onClick={() => toggleCriteriaList("airlines", airline)}
                    className={`rounded-full border px-4 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                      selected
                        ? "border-slate-900 bg-slate-900/90 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {airline}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600">Exclude airlines</span>
            <div className="flex flex-wrap gap-2">
              {AIRLINE_OPTIONS.map((airline) => {
                const selected = excludedAirlines.includes(airline);
                return (
                  <button
                    key={airline}
                    type="button"
                    onClick={() => toggleCriteriaList("excludeAirlines", airline)}
                    className={`rounded-full border px-4 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                      selected
                        ? "border-rose-400 bg-rose-500 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {airline}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-600">Blackout dates</span>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={blackoutDate}
              onChange={(event) => setBlackoutDate(event.target.value)}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            <button
              type="button"
              onClick={addBlackoutDate}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              Add date
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {blackoutDates.map((date) => (
              <span key={date} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
                {new Date(date).toLocaleDateString()}
                <button
                  type="button"
                  onClick={() =>
                    setValue(
                      "criteria.blackoutDates",
                      blackoutDates.filter((item) => item !== date),
                      { shouldValidate: true }
                    )
                  }
                  className="text-slate-400 transition hover:text-rose-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Advanced filters</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600">Maximum stops</span>
            <select
              {...register("filters.maxStops", { valueAsNumber: true })}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value={0}>Direct only</option>
              <option value={1}>Up to 1 stop</option>
              <option value={2}>Up to 2 stops</option>
            </select>
          </label>
          <div className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600">Departure time</span>
            <div className="flex flex-wrap gap-2">
              {DEPARTURE_TIME_OPTIONS.map((option) => {
                const selected = departureTimes.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleFilterList("departureTime", option)}
                    className={`rounded-full border px-4 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                      selected
                        ? "border-slate-900 bg-slate-900/90 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600">Aircraft types</span>
            <div className="flex flex-wrap gap-2">
              {AIRCRAFT_OPTIONS.map((type) => {
                const selected = aircraftTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleFilterList("aircraftTypes", type)}
                    className={`rounded-full border px-4 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                      selected
                        ? "border-slate-900 bg-slate-900/90 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600">Alliances</span>
            <div className="flex flex-wrap gap-2">
              {ALLIANCE_OPTIONS.map((alliance) => {
                const selected = alliances.includes(alliance);
                return (
                  <button
                    key={alliance}
                    type="button"
                    onClick={() => toggleFilterList("alliances", alliance)}
                    className={`rounded-full border px-4 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                      selected
                        ? "border-slate-900 bg-slate-900/90 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {alliance}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm">
            <span className="font-medium text-slate-600">Email alerts</span>
            <input type="checkbox" {...register("notifications.email")} className="h-4 w-4" />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm">
            <span className="font-medium text-slate-600">Push notifications</span>
            <input type="checkbox" {...register("notifications.push")} className="h-4 w-4" />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600">Frequency</span>
            <select
              {...register("notifications.frequency")}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              {FREQUENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600">Quiet hours start</span>
            <input
              type="time"
              {...register("notifications.quietHours.start")}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600">Quiet hours end</span>
            <input
              type="time"
              {...register("notifications.quietHours.end")}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
        >
          {isSubmitting ? "Saving watcher..." : "Save watcher"}
        </button>
      </div>
    </form>
  );
}

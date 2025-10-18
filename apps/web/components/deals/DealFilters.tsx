"use client";

import { useEffect, useState } from "react";
import type { DealFilterState } from "../../lib/deals";

interface DealFiltersProps {
  value: DealFilterState;
  onChange: (value: DealFilterState) => void;
  airlineOptions: string[];
  cabinOptions: string[];
}

export function DealFilters({ value, onChange, airlineOptions, cabinOptions }: DealFiltersProps) {
  const [filters, setFilters] = useState<DealFilterState>(value);

  useEffect(() => {
    setFilters(value);
  }, [value]);

  useEffect(() => {
    onChange(filters);
  }, [filters, onChange]);

  const updateRange = (key: "price" | "miles" | "cpp", index: 0 | 1, newValue: number) => {
    setFilters((prev) => {
      const nextRange: [number, number] = [...prev[key]] as [number, number];
      nextRange[index] = newValue;
      return { ...prev, [key]: nextRange };
    });
  };

  const toggleList = (key: "airlines" | "cabins", option: string) => {
    const normalized = key === "cabins" ? option.toLowerCase() : option;
    setFilters((prev) => {
      const next = prev[key].includes(normalized)
        ? prev[key].filter((entry) => entry !== normalized)
        : [...prev[key], normalized];
      return { ...prev, [key]: next };
    });
  };

  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <RangeField
          label="Price ($)"
          min={0}
          max={5000}
          step={50}
          value={filters.price}
          onChange={(index, newValue) => updateRange("price", index, newValue)}
        />
        <RangeField
          label="Miles"
          min={0}
          max={200000}
          step={1000}
          value={filters.miles}
          onChange={(index, newValue) => updateRange("miles", index, newValue)}
        />
        <RangeField
          label="CPP"
          min={0}
          max={10}
          step={0.1}
          value={filters.cpp}
          onChange={(index, newValue) => updateRange("cpp", index, newValue)}
        />
        <div className="flex flex-col gap-2 text-sm">
          <label className="font-medium text-slate-600">Minimum score</label>
          <input
            type="range"
            min={0}
            max={100}
            value={filters.valueScore}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, valueScore: Number(event.target.value) }))
            }
          />
          <span className="text-xs text-slate-500">{filters.valueScore}</span>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-600">Airlines</span>
          <div className="flex flex-wrap gap-2">
            {airlineOptions.map((airline) => {
              const selected = filters.airlines.includes(airline);
              return (
                <button
                  key={airline}
                  type="button"
                  onClick={() => toggleList("airlines", airline)}
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
          <span className="font-medium text-slate-600">Cabin classes</span>
          <div className="flex flex-wrap gap-2">
            {cabinOptions.map((cabin) => {
              const value = cabin.toLowerCase();
              const selected = filters.cabins.includes(value);
              return (
                <button
                  key={cabin}
                  type="button"
                  onClick={() => toggleList("cabins", cabin)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                    selected
                      ? "border-slate-900 bg-slate-900/90 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {cabin}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-600">Stops</span>
          <select
            value={filters.stops}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, stops: event.target.value as DealFilterState["stops"] }))
            }
            className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="any">Any</option>
            <option value="0">Direct</option>
            <option value="1">1 stop</option>
            <option value="2+">2+ stops</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-600">Departure window</span>
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={filters.departureWindow[0]}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  departureWindow: [event.target.value, prev.departureWindow[1]]
                }))
              }
              className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            <span className="text-slate-400">to</span>
            <input
              type="time"
              value={filters.departureWindow[1]}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  departureWindow: [prev.departureWindow[0], event.target.value]
                }))
              }
              className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-600">Date range</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.dateRange[0] ?? ""}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  dateRange: [event.target.value || null, prev.dateRange[1]]
                }))
              }
              className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={filters.dateRange[1] ?? ""}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  dateRange: [prev.dateRange[0], event.target.value || null]
                }))
              }
              className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </label>
      </div>
    </section>
  );
}

interface RangeFieldProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (index: 0 | 1, value: number) => void;
}

function RangeField({ label, min, max, step, value, onChange }: RangeFieldProps) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <label className="font-medium text-slate-600">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={(event) => onChange(0, Number(event.target.value))}
          className="w-1/2 rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
        <span className="text-slate-400">to</span>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={(event) => onChange(1, Number(event.target.value))}
          className="w-1/2 rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
      </div>
    </div>
  );
}

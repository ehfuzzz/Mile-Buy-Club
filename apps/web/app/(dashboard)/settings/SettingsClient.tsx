"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  DEFAULT_USER_SETTINGS,
  updateUserSettings,
  userSettingsSchema,
  type UserSettings
} from "../../../lib/settings";
import { NotificationSettings } from "../../../components/settings/NotificationSettings";
import { PrivacySettings } from "../../../components/settings/PrivacySettings";

interface SettingsClientProps {
  initialSettings: UserSettings;
  userEmail: string;
}

export function SettingsClient({ initialSettings, userEmail }: SettingsClientProps) {
  const methods = useForm<UserSettings>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: initialSettings ?? DEFAULT_USER_SETTINGS,
    mode: "onChange"
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty }
  } = methods;
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    setStatusMessage(null);
    setErrorMessage(null);
    try {
      await updateUserSettings(values);
      setStatusMessage("Settings updated successfully.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update settings.");
    }
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-slate-900">Account settings</h1>
          <p className="text-sm text-slate-600">Manage your profile, notification preferences, and privacy controls.</p>
        </header>
        {statusMessage ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{statusMessage}</div>
        ) : null}
        {errorMessage ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div>
        ) : null}

        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-slate-900">Profile information</h2>
            <p className="text-sm text-slate-600">Update how other travelers see you across Mile Buy Club.</p>
          </header>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-600">Display name</span>
              <input
                {...register("profile.displayName")}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
              {errors.profile?.displayName ? (
                <span className="text-xs text-rose-500">{errors.profile.displayName.message}</span>
              ) : null}
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-600">Email address</span>
              <input value={userEmail} readOnly className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500" />
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600">Profile photo URL</span>
            <input
              {...register("profile.profilePicture")}
              placeholder="https://..."
              className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-600">Bio</span>
            <textarea
              {...register("profile.bio")}
              rows={3}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-slate-900">Account security</h2>
            <p className="text-sm text-slate-600">Strengthen your account by updating your password and session controls.</p>
          </header>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-600">New password</span>
              <input type="password" placeholder="••••••••" className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200" />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-600">Confirm password</span>
              <input type="password" placeholder="••••••••" className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200" />
            </label>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm">
            <div className="flex flex-col">
              <span className="font-medium text-slate-600">Two-factor authentication</span>
              <span className="text-xs text-slate-500">Add an extra layer of security to your account.</span>
            </div>
            <button type="button" className="rounded-full border border-slate-300 px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100">
              Configure
            </button>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <div className="rounded-lg border border-slate-200 px-4 py-3">
              <span className="font-medium text-slate-600">Active sessions</span>
              <p className="text-xs text-slate-500">View and manage devices currently signed into your account.</p>
              <button type="button" className="mt-2 rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100">
                Review sessions
              </button>
            </div>
            <div className="rounded-lg border border-slate-200 px-4 py-3">
              <span className="font-medium text-slate-600">Login history</span>
              <p className="text-xs text-slate-500">Track recent logins to monitor for unusual activity.</p>
              <button type="button" className="mt-2 rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100">
                View history
              </button>
            </div>
          </div>
        </section>

        <NotificationSettings />
        <PrivacySettings />

        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-slate-900">Display & preferences</h2>
            <p className="text-sm text-slate-600">Customize how Mile Buy Club behaves on your device.</p>
          </header>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-600">Theme</span>
              <select
                {...register("preferences.theme")}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-600">Language</span>
              <select
                {...register("preferences.language")}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-600">Timezone</span>
              <input
                {...register("preferences.timezone")}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-600">Date format</span>
              <select
                {...register("preferences.dateFormat")}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                <option value="yyyy-MM-dd">YYYY-MM-DD</option>
              </select>
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-600">Default sort</span>
              <select
                {...register("preferences.defaultSort")}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="best">Best value</option>
                <option value="lowest-price">Lowest price</option>
                <option value="highest-cpp">Highest CPP</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-600">Default view</span>
              <select
                {...register("preferences.defaultView")}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="grid">Grid</option>
                <option value="list">List</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-600">Items per page</span>
              <input
                type="number"
                min={5}
                max={100}
                {...register("preferences.itemsPerPage", { valueAsNumber: true })}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-600">Auto refresh interval (min)</span>
              <input
                type="number"
                min={0}
                max={60}
                {...register("preferences.autoRefresh", { valueAsNumber: true })}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => methods.reset(initialSettings)}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}

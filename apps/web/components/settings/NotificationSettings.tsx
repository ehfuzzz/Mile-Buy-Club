"use client";

import { useFormContext } from "react-hook-form";
import type { UserSettings } from "../../lib/settings";
import { requestPermission, subscribeToPush, unsubscribeFromPush } from "../../lib/notifications/client";

export function NotificationSettings() {
  const {
    register,
    watch,
    setValue,
    formState: { errors }
  } = useFormContext<UserSettings>();

  const pushEnabled = watch("notifications.push.enabled");

  const handlePushToggle = async (next: boolean) => {
    if (next) {
      const permission = await requestPermission();
      if (permission !== "granted") {
        setValue("notifications.push.enabled", false, { shouldValidate: true });
        return;
      }
      await subscribeToPush();
      setValue("notifications.push.enabled", true, { shouldValidate: true });
    } else {
      await unsubscribeFromPush();
      setValue("notifications.push.enabled", false, { shouldValidate: true });
    }
  };

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
        <p className="text-sm text-slate-600">Choose how Mile Buy Club keeps you informed about new deals and account updates.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm">
          <span className="font-medium text-slate-600">Deal alerts</span>
          <input type="checkbox" className="h-4 w-4" {...register("notifications.email.dealAlerts")} />
        </label>
        <label className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm">
          <span className="font-medium text-slate-600">Weekly digest</span>
          <input type="checkbox" className="h-4 w-4" {...register("notifications.email.weeklyDigest")} />
        </label>
        <label className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm">
          <span className="font-medium text-slate-600">Account updates</span>
          <input type="checkbox" className="h-4 w-4" {...register("notifications.email.accountUpdates")} />
        </label>
        <label className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm">
          <span className="font-medium text-slate-600">Marketing emails</span>
          <input type="checkbox" className="h-4 w-4" {...register("notifications.email.marketing")} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm">
          <span className="font-medium text-slate-600">Push notifications</span>
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={pushEnabled}
            onChange={(event) => void handlePushToggle(event.target.checked)}
          />
        </label>
        <label className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm">
          <span className="font-medium text-slate-600">Sound alerts</span>
          <input type="checkbox" className="h-4 w-4" {...register("notifications.push.sound")} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-600">Frequency</span>
          <select
            {...register("notifications.frequency")}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="immediate">Immediate</option>
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-600">Quiet hours start</span>
          <input
            type="time"
            {...register("notifications.push.quietHours.start")}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-600">Quiet hours end</span>
          <input
            type="time"
            {...register("notifications.push.quietHours.end")}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </label>
      </div>
      <fieldset className="flex flex-col gap-2 text-sm">
        <legend className="font-medium text-slate-600">Deal categories</legend>
        <div className="flex flex-wrap gap-3">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" {...register("notifications.dealTypes.flights")} />
            Flights
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" {...register("notifications.dealTypes.hotels")} />
            Hotels
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" {...register("notifications.dealTypes.activities")} />
            Activities
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" {...register("notifications.dealTypes.cards")} />
            Card offers
          </label>
        </div>
        {errors.notifications?.dealTypes ? (
          <span className="text-xs text-rose-500">Select at least one deal category.</span>
        ) : null}
      </fieldset>
    </section>
  );
}

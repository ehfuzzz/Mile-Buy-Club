"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface SummaryHomeBase {
  code: string;
}

interface SummaryAirlines {
  prefer: string[];
  avoid: string[];
}

interface SummaryBudget {
  maxPoints: number | null;
  maxCashUsd: number | null;
  minCppCents: number | null;
}

export interface SummaryProfile {
  userId: string;
  maxPoints: number | null;
  maxCashUsd: number | null;
  minCppCents: number | null;
  homeBases: SummaryHomeBase[];
  airlines: SummaryAirlines;
}

interface SummaryChipsProps {
  profile: SummaryProfile;
  onSave: (update: {
    homeBases: string[];
    airlines: SummaryAirlines;
    budget: SummaryBudget;
  }) => Promise<void>;
  saving?: boolean;
}

export function SummaryChips({ profile, onSave, saving }: SummaryChipsProps) {
  const initialHomeBases = useMemo(() => profile.homeBases.map((home) => home.code), [profile.homeBases]);
  const [homeBases, setHomeBases] = useState<string[]>(initialHomeBases);
  const [preferAirlines, setPreferAirlines] = useState<string[]>([...profile.airlines.prefer]);
  const [avoidAirlines, setAvoidAirlines] = useState<string[]>([...profile.airlines.avoid]);
  const [maxPoints, setMaxPoints] = useState<string>(profile.maxPoints?.toString() ?? "");
  const [maxCashUsd, setMaxCashUsd] = useState<string>(profile.maxCashUsd?.toString() ?? "");
  const [minCppCents, setMinCppCents] = useState<string>(profile.minCppCents?.toString() ?? "");
  const [newHomeBase, setNewHomeBase] = useState("");
  const [newPreferAirline, setNewPreferAirline] = useState("");
  const [newAvoidAirline, setNewAvoidAirline] = useState("");

  const addHomeBase = () => {
    const code = newHomeBase.trim().toUpperCase();
    if (!code || homeBases.includes(code)) return;
    setHomeBases([...homeBases, code]);
    setNewHomeBase("");
  };

  const addPreferAirline = () => {
    const code = newPreferAirline.trim().toUpperCase();
    if (!code || preferAirlines.includes(code)) return;
    setPreferAirlines([...preferAirlines, code]);
    setNewPreferAirline("");
  };

  const addAvoidAirline = () => {
    const code = newAvoidAirline.trim().toUpperCase();
    if (!code || avoidAirlines.includes(code)) return;
    setAvoidAirlines([...avoidAirlines, code]);
    setNewAvoidAirline("");
  };

  const removeHomeBase = (code: string) => {
    setHomeBases(homeBases.filter((item) => item !== code));
  };

  const removePreferAirline = (code: string) => {
    setPreferAirlines(preferAirlines.filter((item) => item !== code));
  };

  const removeAvoidAirline = (code: string) => {
    setAvoidAirlines(avoidAirlines.filter((item) => item !== code));
  };

  const handleSave = async () => {
    await onSave({
      homeBases,
      airlines: { prefer: preferAirlines, avoid: avoidAirlines },
      budget: {
        maxPoints: maxPoints ? Number(maxPoints) : null,
        maxCashUsd: maxCashUsd ? Number(maxCashUsd) : null,
        minCppCents: minCppCents ? Number(minCppCents) : null,
      },
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Onboarding Summary</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-700">Home Bases</h3>
          <div className="flex flex-wrap gap-2">
            {homeBases.map((code) => (
              <Badge key={code} className="flex items-center gap-2">
                {code}
                <button
                  type="button"
                  className="text-xs text-slate-200"
                  onClick={() => removeHomeBase(code)}
                >
                  ✕
                </button>
              </Badge>
            ))}
            {homeBases.length === 0 ? <span className="text-sm text-slate-500">No home bases yet.</span> : null}
          </div>
          <div className="flex gap-2">
            <Input
              value={newHomeBase}
              onChange={(event) => setNewHomeBase(event.target.value)}
              placeholder="Add city code (e.g., NYC)"
            />
            <Button type="button" onClick={addHomeBase}>
              Add
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-700">Preferred Airlines</h3>
          <div className="flex flex-wrap gap-2">
            {preferAirlines.map((code) => (
              <Badge key={`pref-${code}`} className="flex items-center gap-2 bg-emerald-500 text-white">
                {code}
                <button type="button" onClick={() => removePreferAirline(code)} className="text-xs text-white">
                  ✕
                </button>
              </Badge>
            ))}
            {preferAirlines.length === 0 ? <span className="text-sm text-slate-500">No preferred airlines.</span> : null}
          </div>
          <div className="flex gap-2">
            <Input
              value={newPreferAirline}
              onChange={(event) => setNewPreferAirline(event.target.value)}
              placeholder="Add airline code (e.g., UA)"
            />
            <Button type="button" onClick={addPreferAirline}>
              Add
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-700">Airlines to Avoid</h3>
          <div className="flex flex-wrap gap-2">
            {avoidAirlines.map((code) => (
              <Badge key={`avoid-${code}`} className="flex items-center gap-2 bg-rose-500 text-white">
                {code}
                <button type="button" onClick={() => removeAvoidAirline(code)} className="text-xs text-white">
                  ✕
                </button>
              </Badge>
            ))}
            {avoidAirlines.length === 0 ? <span className="text-sm text-slate-500">No airlines to avoid.</span> : null}
          </div>
          <div className="flex gap-2">
            <Input
              value={newAvoidAirline}
              onChange={(event) => setNewAvoidAirline(event.target.value)}
              placeholder="Add airline code"
            />
            <Button type="button" onClick={addAvoidAirline}>
              Add
            </Button>
          </div>
        </section>

        <section className="grid gap-3">
          <h3 className="text-sm font-semibold text-slate-700">Budget Preferences</h3>
          <div className="grid gap-2 sm:grid-cols-3">
            <Input
              type="number"
              value={maxPoints}
              onChange={(event) => setMaxPoints(event.target.value)}
              placeholder="Max points"
            />
            <Input
              type="number"
              value={maxCashUsd}
              onChange={(event) => setMaxCashUsd(event.target.value)}
              placeholder="Max cash (USD)"
            />
            <Input
              type="number"
              step="0.1"
              value={minCppCents}
              onChange={(event) => setMinCppCents(event.target.value)}
              placeholder="Min cpp"
            />
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

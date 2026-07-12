"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Department = { id: string; name: string; code: string };
type Policy = {
  id: string;
  name: string;
  periodDays: number;
  limitKgCo2e: number;
  warningPercent: number;
  department: Department;
  emissions: number;
  percentage: number;
  remaining: number;
  recordCount: number;
  state: "NORMAL" | "WARNING" | "EXCEEDED";
};

export function GovernancePanel() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/governance", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Unable to load governance.");
      setPolicies(result.policies ?? []);
      setDepartments(result.departments ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load governance.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => void load(), [load]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/admin/governance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentId: data.get("departmentId"),
          name: data.get("name"),
          periodDays: Number(data.get("periodDays")),
          limitKgCo2e: Number(data.get("limitKgCo2e")),
          warningPercent: Number(data.get("warningPercent")),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Unable to save policy.");
      setMessage(result.message);
      form.reset();
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save policy.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Create emission policy</h2>
        <p className="mt-2 text-sm text-slate-600">
          Set a department carbon limit. The system calculates live status from carbon records.
        </p>

        {message ? <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{message}</div> : null}
        {error ? <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <select className="rounded-xl border px-4 py-3" name="departmentId" required defaultValue="">
            <option value="" disabled>Select department</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <input className="rounded-xl border px-4 py-3" name="name" placeholder="28-day emission ceiling" required />
          <select className="rounded-xl border px-4 py-3" name="periodDays" defaultValue="28">
            <option value="1">1 day</option>
            <option value="7">7 days</option>
            <option value="28">28 days</option>
            <option value="365">1 year</option>
          </select>
          <input className="rounded-xl border px-4 py-3" min="0.001" step="any" type="number" name="limitKgCo2e" placeholder="Limit in kgCO₂e" required />
          <input className="rounded-xl border px-4 py-3" min="1" max="99" type="number" name="warningPercent" defaultValue="80" required />
          <button className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white disabled:opacity-60" disabled={saving}>
            {saving ? "Saving..." : "Save policy"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Department compliance status</h2>
        {loading ? <p className="mt-5 text-slate-500">Loading...</p> : (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {policies.map((policy) => (
              <article className="rounded-2xl border p-5" key={policy.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950">{policy.department.name}</p>
                    <p className="text-sm text-slate-500">{policy.name} · {policy.periodDays} days</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                    policy.state === "EXCEEDED" ? "bg-red-100 text-red-700" :
                    policy.state === "WARNING" ? "bg-amber-100 text-amber-700" :
                    "bg-emerald-100 text-emerald-700"
                  }`}>{policy.state}</span>
                </div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full ${policy.state === "EXCEEDED" ? "bg-red-500" : policy.state === "WARNING" ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(policy.percentage, 100)}%` }} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <p>Used: <strong>{policy.emissions.toFixed(2)} kgCO₂e</strong></p>
                  <p>Limit: <strong>{policy.limitKgCo2e.toFixed(2)} kgCO₂e</strong></p>
                  <p>Usage: <strong>{policy.percentage.toFixed(1)}%</strong></p>
                  <p>Records: <strong>{policy.recordCount}</strong></p>
                </div>
              </article>
            ))}
            {policies.length === 0 ? <p className="text-sm text-slate-500">No policies created yet.</p> : null}
          </div>
        )}
      </section>
    </div>
  );
}

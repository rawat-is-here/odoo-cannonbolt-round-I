"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

type TransportRecord = {
  id: string;
  activityName: string;
  activityAmount: string;
  activityUnit: string;
  co2eAmount: string;
  co2eUnit: string;
  occurredAt: string;
  status: string;
  activityData: {
    truckIdentifier?: string;
    loadKg?: string;
    distanceKm?: string;
    tripCount?: string;
    origin?: string | null;
    destination?: string | null;
  } | null;
};

export function TransportActivityPanel() {
  const [records, setRecords] = useState<TransportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [calculation, setCalculation] = useState<{
    tonneKilometres: string;
    co2eAmount: string;
    co2eUnit: string;
  } | null>(null);

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/transport-activities", {
        cache: "no-store",
      });

      const result = (await response.json()) as {
        records?: TransportRecord[];
        message?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.message ?? "Unable to load transport records.",
        );
      }

      setRecords(result.records ?? []);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load transport records.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage("");
    setError("");
    setCalculation(null);
    setIsSaving(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      truckIdentifier: String(
        formData.get("truckIdentifier") ?? "",
      ).trim(),
      truckType: String(formData.get("truckType") ?? ""),
      loadKg: String(formData.get("loadKg") ?? ""),
      distanceKm: String(formData.get("distanceKm") ?? ""),
      tripCount: String(formData.get("tripCount") ?? ""),
      occurredAt: String(formData.get("occurredAt") ?? ""),
      origin: String(formData.get("origin") ?? "").trim(),
      destination: String(
        formData.get("destination") ?? "",
      ).trim(),
      notes: String(formData.get("notes") ?? "").trim(),
    };

    try {
      const response = await fetch("/api/transport-activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        message?: string;
        calculation?: {
          tonneKilometres: string;
          factorValue: string;
          co2eAmount: string;
          co2eUnit: string;
        };
      };

      if (!response.ok) {
        throw new Error(
          result.message ?? "Unable to record transport activity.",
        );
      }

      setMessage(
        result.message ?? "Transport activity recorded.",
      );

      setCalculation(
        result.calculation
          ? {
              tonneKilometres:
                result.calculation.tonneKilometres,
              co2eAmount: result.calculation.co2eAmount,
              co2eUnit: result.calculation.co2eUnit,
            }
          : null,
      );

      form.reset();
      await loadRecords();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to record transport activity.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Transport carbon input
        </p>

        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
          Log transported load
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Carbon emissions are calculated automatically using load,
          distance, trip count and truck type.
        </p>

        {message ? (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {calculation ? (
          <div className="mt-5 grid gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Freight activity
              </p>
              <p className="mt-1 text-xl font-semibold text-emerald-950">
                {Number(
                  calculation.tonneKilometres,
                ).toFixed(3)}{" "}
                tonne-km
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Calculated emissions
              </p>
              <p className="mt-1 text-xl font-semibold text-emerald-950">
                {Number(calculation.co2eAmount).toFixed(3)}{" "}
                {calculation.co2eUnit}
              </p>
            </div>
          </div>
        ) : null}

        <form
          className="mt-6 grid gap-5 md:grid-cols-2"
          onSubmit={handleSubmit}
        >
          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="truckIdentifier"
            >
              Truck registration / identifier
            </label>

            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950"
              id="truckIdentifier"
              maxLength={100}
              name="truckIdentifier"
              placeholder="MH-31-AB-1234"
              required
              type="text"
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="truckType"
            >
              Truck type
            </label>

            <select
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950"
              id="truckType"
              name="truckType"
              required
            >
              <option value="">Select truck type</option>
              <option value="LIGHT_DIESEL">
                Light diesel truck
              </option>
              <option value="MEDIUM_DIESEL">
                Medium diesel truck
              </option>
              <option value="HEAVY_DIESEL">
                Heavy diesel truck
              </option>
              <option value="ELECTRIC">
                Electric truck
              </option>
            </select>
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="loadKg"
            >
              Load transported
            </label>

            <div className="flex">
              <input
                className="min-w-0 flex-1 rounded-l-xl border border-r-0 border-slate-300 px-4 py-3 text-slate-950"
                id="loadKg"
                min="0.01"
                name="loadKg"
                placeholder="5000"
                required
                step="any"
                type="number"
              />

              <span className="flex items-center rounded-r-xl border border-slate-300 bg-slate-100 px-4 text-sm text-slate-600">
                kg
              </span>
            </div>
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="distanceKm"
            >
              Distance per trip
            </label>

            <div className="flex">
              <input
                className="min-w-0 flex-1 rounded-l-xl border border-r-0 border-slate-300 px-4 py-3 text-slate-950"
                id="distanceKm"
                min="0.01"
                name="distanceKm"
                placeholder="250"
                required
                step="any"
                type="number"
              />

              <span className="flex items-center rounded-r-xl border border-slate-300 bg-slate-100 px-4 text-sm text-slate-600">
                km
              </span>
            </div>
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="tripCount"
            >
              Number of trips
            </label>

            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950"
              defaultValue="1"
              id="tripCount"
              min="1"
              name="tripCount"
              required
              step="1"
              type="number"
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="occurredAt"
            >
              Activity date
            </label>

            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950"
              defaultValue={
                new Date().toISOString().split("T")[0]
              }
              id="occurredAt"
              max={new Date().toISOString().split("T")[0]}
              name="occurredAt"
              required
              type="date"
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="origin"
            >
              Origin
            </label>

            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950"
              id="origin"
              maxLength={150}
              name="origin"
              placeholder="Nagpur warehouse"
              type="text"
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="destination"
            >
              Destination
            </label>

            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950"
              id="destination"
              maxLength={150}
              name="destination"
              placeholder="Mumbai distribution centre"
              type="text"
            />
          </div>

          <div className="md:col-span-2">
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="notes"
            >
              Notes
            </label>

            <textarea
              className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950"
              id="notes"
              maxLength={1000}
              name="notes"
              placeholder="Invoice, route, cargo or operational details"
            />
          </div>

          <div className="md:col-span-2">
            <button
              className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
              disabled={isSaving}
              type="submit"
            >
              {isSaving
                ? "Calculating and saving..."
                : "Calculate and record emissions"}
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-6 py-5">
          <h2 className="text-xl font-semibold text-slate-950">
            Transport activity records
          </h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-slate-600">
            Loading transport records...
          </div>
        ) : records.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            No transport activity recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <Heading>Truck</Heading>
                  <Heading>Load</Heading>
                  <Heading>Distance</Heading>
                  <Heading>Freight activity</Heading>
                  <Heading>Emissions</Heading>
                  <Heading>Date</Heading>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {records.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 font-medium text-slate-950">
                      {record.activityData?.truckIdentifier ??
                        "Unknown"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {record.activityData?.loadKg ?? "—"} kg
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {record.activityData?.distanceKm ?? "—"} km
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {Number(
                        record.activityAmount,
                      ).toFixed(3)}{" "}
                      {record.activityUnit}
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-950">
                      {Number(record.co2eAmount).toFixed(3)}{" "}
                      {record.co2eUnit}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(
                        record.occurredAt,
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Heading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </th>
  );
}
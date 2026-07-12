"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type Factor = {
  id: string;
  activityCode: string;
  activityName: string;
  category: string;
  subcategory: string | null;
  scope: string;
  inputUnit: string;
  outputUnit: string;
  factorValue: string;
  description: string | null;
};

type RecordItem = {
  id: string;
  activityName: string;
  category: string;
  scope: string;
  activityAmount: string;
  activityUnit: string;
  co2eAmount: string;
  co2eUnit: string;
  occurredAt: string;
  status: string;
};

export function DepartmentActivityPanel() {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [departmentName, setDepartmentName] = useState("");

  const [selectedFactorId, setSelectedFactorId] =
    useState("");
  const [activityAmount, setActivityAmount] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedFactor = useMemo(
    () =>
      factors.find(
        (factor) => factor.id === selectedFactorId,
      ) ?? null,
    [factors, selectedFactorId],
  );

  const previewEmission = useMemo(() => {
    if (!selectedFactor || !activityAmount) {
      return null;
    }

    const quantity = Number(activityAmount);
    const factorValue = Number(selectedFactor.factorValue);

    if (
      !Number.isFinite(quantity) ||
      !Number.isFinite(factorValue) ||
      quantity <= 0
    ) {
      return null;
    }

    return quantity * factorValue;
  }, [activityAmount, selectedFactor]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/department-activities",
        {
          cache: "no-store",
        },
      );

      const result = (await response.json()) as {
        department?: {
          name: string;
          code: string;
        };
        factors?: Factor[];
        records?: RecordItem[];
        message?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.message ??
            "Unable to load department activities.",
        );
      }

      setDepartmentName(result.department?.name ?? "");
      setFactors(result.factors ?? []);
      setRecords(result.records ?? []);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load department activities.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage("");
    setError("");
    setIsSaving(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      emissionFactorId: String(
        formData.get("emissionFactorId") ?? "",
      ),
      activityAmount: String(
        formData.get("activityAmount") ?? "",
      ),
      occurredAt: String(
        formData.get("occurredAt") ?? "",
      ),
      notes: String(
        formData.get("notes") ?? "",
      ).trim(),
    };

    try {
      const response = await fetch(
        "/api/department-activities",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = (await response.json()) as {
        message?: string;
        calculation?: {
          activityAmount: string;
          activityUnit: string;
          co2eAmount: string;
          co2eUnit: string;
        };
      };

      if (!response.ok) {
        throw new Error(
          result.message ??
            "Unable to record carbon activity.",
        );
      }

      setMessage(
        result.calculation
          ? `${result.message} Calculated emissions: ${Number(
              result.calculation.co2eAmount,
            ).toFixed(3)} ${result.calculation.co2eUnit}.`
          : result.message ??
              "Carbon activity recorded successfully.",
      );

      setSelectedFactorId("");
      setActivityAmount("");
      form.reset();

      await loadData();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to record carbon activity.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mt-8 rounded-2xl border bg-white p-8 shadow-sm">
        Loading department carbon activities...
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
          {departmentName} carbon input
        </p>

        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
          Record operational activity
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Select an activity and enter its measured quantity.
          The server applies the appropriate emission factor.
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

        {factors.length === 0 ? (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            No emission activities are configured for this
            department. Run the department factor seed.
          </div>
        ) : (
          <form
            className="mt-6 grid gap-5 md:grid-cols-2"
            onSubmit={handleSubmit}
          >
            <div className="md:col-span-2">
              <label
                className="mb-2 block text-sm font-medium text-slate-700"
                htmlFor="emissionFactorId"
              >
                Activity type
              </label>

              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950"
                id="emissionFactorId"
                name="emissionFactorId"
                onChange={(event) =>
                  setSelectedFactorId(event.target.value)
                }
                required
                value={selectedFactorId}
              >
                <option value="">Select an activity</option>

                {factors.map((factor) => (
                  <option key={factor.id} value={factor.id}>
                    {factor.category} — {factor.activityName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-slate-700"
                htmlFor="activityAmount"
              >
                Activity amount
              </label>

              <div className="flex">
                <input
                  className="min-w-0 flex-1 rounded-l-xl border border-r-0 border-slate-300 px-4 py-3 text-slate-950"
                  id="activityAmount"
                  min="0.0001"
                  name="activityAmount"
                  onChange={(event) =>
                    setActivityAmount(event.target.value)
                  }
                  placeholder="Enter quantity"
                  required
                  step="any"
                  type="number"
                  value={activityAmount}
                />

                <span className="flex items-center rounded-r-xl border border-slate-300 bg-slate-100 px-4 text-sm font-medium text-slate-600">
                  {selectedFactor?.inputUnit ?? "unit"}
                </span>
              </div>
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
                placeholder="Equipment, invoice, location or operational details"
              />
            </div>

            {selectedFactor ? (
              <div className="md:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-emerald-700">
                      Scope
                    </p>

                    <p className="mt-1 font-semibold text-emerald-950">
                      {selectedFactor.scope.replace("_", " ")}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-emerald-700">
                      Emission factor
                    </p>

                    <p className="mt-1 font-semibold text-emerald-950">
                      {selectedFactor.factorValue} kgCO₂e/
                      {selectedFactor.inputUnit}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-emerald-700">
                      Estimated emissions
                    </p>

                    <p className="mt-1 font-semibold text-emerald-950">
                      {previewEmission === null
                        ? "Enter quantity"
                        : `${previewEmission.toFixed(
                            3,
                          )} kgCO₂e`}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="md:col-span-2">
              <button
                className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                disabled={isSaving}
                type="submit"
              >
                {isSaving
                  ? "Calculating and saving..."
                  : "Calculate and record emissions"}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-6 py-5">
          <h2 className="text-xl font-semibold text-slate-950">
            Department carbon records
          </h2>
        </div>

        {records.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            No carbon activities recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <Heading>Activity</Heading>
                  <Heading>Input</Heading>
                  <Heading>Scope</Heading>
                  <Heading>Emissions</Heading>
                  <Heading>Status</Heading>
                  <Heading>Date</Heading>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {records.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-950">
                        {record.activityName}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {record.category}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {record.activityAmount}{" "}
                      {record.activityUnit}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {record.scope.replace("_", " ")}
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-950">
                      {Number(
                        record.co2eAmount,
                      ).toFixed(3)}{" "}
                      {record.co2eUnit}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        {record.status}
                      </span>
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
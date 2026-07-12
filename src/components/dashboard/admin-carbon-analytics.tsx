"use client";

import { useCallback, useEffect, useState } from "react";
import jsPDF from "jspdf";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RangeKey = "1d" | "7d" | "28d" | "365d";

type AnalyticsResponse = {
  range: RangeKey;
  summary: {
    totalEmissions: number;
    recordCount: number;
    averageEmission: number;
  };
  scopeTotals: {
    SCOPE_1: number;
    SCOPE_2: number;
    SCOPE_3: number;
  };
  departmentTotals: {
    department: string;
    emissions: number;
  }[];
  timeline: {
    key: string;
    label: string;
    emissions: number;
  }[];
  message?: string;
};

const RANGE_OPTIONS: {
  value: RangeKey;
  label: string;
}[] = [
  { value: "1d", label: "1 Day" },
  { value: "7d", label: "7 Days" },
  { value: "28d", label: "28 Days" },
  { value: "365d", label: "1 Year" },
];

export function AdminCarbonAnalytics() {
  const [range, setRange] = useState<RangeKey>("7d");
  const [data, setData] = useState<AnalyticsResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/carbon-analytics?range=${range}`,
        {
          cache: "no-store",
        },
      );

      const result = (await response.json()) as AnalyticsResponse;

      if (!response.ok) {
        throw new Error(
          result.message ?? "Unable to load analytics.",
        );
      }

      setData(result);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load analytics.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [range]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  function downloadPdf() {
    if (!data) return;

    const pdf = new jsPDF();
    const title = `EcoSphere Carbon Report - ${range}`;
    pdf.setFontSize(18);
    pdf.text(title, 14, 18);
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);

    pdf.setFontSize(12);
    pdf.text(`Total emissions: ${data.summary.totalEmissions.toFixed(2)} kgCO2e`, 14, 36);
    pdf.text(`Records: ${data.summary.recordCount}`, 14, 43);
    pdf.text(`Average per record: ${data.summary.averageEmission.toFixed(2)} kgCO2e`, 14, 50);

    pdf.text("Scope breakdown", 14, 62);
    pdf.setFontSize(10);
    pdf.text(`Scope 1: ${data.scopeTotals.SCOPE_1.toFixed(2)} kgCO2e`, 18, 69);
    pdf.text(`Scope 2: ${data.scopeTotals.SCOPE_2.toFixed(2)} kgCO2e`, 18, 75);
    pdf.text(`Scope 3: ${data.scopeTotals.SCOPE_3.toFixed(2)} kgCO2e`, 18, 81);

    pdf.setFontSize(12);
    pdf.text("Department breakdown", 14, 93);
    pdf.setFontSize(10);
    let y = 100;
    for (const department of data.departmentTotals.slice(0, 12)) {
      pdf.text(`${department.department}: ${department.emissions.toFixed(2)} kgCO2e`, 18, y);
      y += 6;
    }

    if (y > 165) {
      pdf.addPage();
      y = 20;
    }

    pdf.setFontSize(12);
    pdf.text("Emission timeline", 14, y + 8);
    const chartX = 18;
    const chartY = y + 18;
    const chartW = 175;
    const chartH = 55;
    pdf.rect(chartX, chartY, chartW, chartH);

    const max = Math.max(...data.timeline.map((p) => p.emissions), 1);
    data.timeline.forEach((point, index) => {
      if (index === 0) return;
      const prev = data.timeline[index - 1];
      const x1 = chartX + ((index - 1) / Math.max(data.timeline.length - 1, 1)) * chartW;
      const x2 = chartX + (index / Math.max(data.timeline.length - 1, 1)) * chartW;
      const y1 = chartY + chartH - (prev.emissions / max) * chartH;
      const y2 = chartY + chartH - (point.emissions / max) * chartH;
      pdf.line(x1, y1, x2, y2);
    });

    pdf.setFontSize(8);
    pdf.text(`Range: ${range} | Peak: ${max.toFixed(2)} kgCO2e`, 18, chartY + chartH + 7);
    pdf.save(`ecosphere-carbon-report-${range}.pdf`);
  }

  return (
    <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Carbon analytics
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            Organization emissions
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Carbon activity submitted by employees across the
            organization.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
            disabled={!data}
            onClick={downloadPdf}
            type="button"
          >
            Download PDF
          </button>
          {RANGE_OPTIONS.map((option) => (
            <button
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                range === option.value
                  ? "bg-emerald-700 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              key={option.value}
              onClick={() => setRange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-8 rounded-xl border border-dashed p-10 text-center text-slate-500">
          Loading carbon analytics...
        </div>
      ) : data ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Total emissions"
              value={`${data.summary.totalEmissions.toFixed(2)} kgCO₂e`}
            />

            <MetricCard
              label="Carbon records"
              value={String(data.summary.recordCount)}
            />

            <MetricCard
              label="Average per record"
              value={`${data.summary.averageEmission.toFixed(2)} kgCO₂e`}
            />

            <MetricCard
              label="Scope 1 emissions"
              value={`${data.scopeTotals.SCOPE_1.toFixed(2)} kgCO₂e`}
            />
          </div>

          <div className="mt-8 h-96 w-full">
            <ResponsiveContainer height="100%" width="100%">
              <LineChart data={data.timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  minTickGap={24}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  width={80}
                />
                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toFixed(3)} kgCO₂e`,
                    "Emissions",
                  ]}
                />
                <Line
                  dataKey="emissions"
                  dot={false}
                  strokeWidth={3}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <article className="rounded-xl border p-5">
              <h3 className="font-semibold text-slate-950">
                Scope breakdown
              </h3>

              <div className="mt-4 space-y-3">
                <BreakdownRow
                  label="Scope 1"
                  value={data.scopeTotals.SCOPE_1}
                />
                <BreakdownRow
                  label="Scope 2"
                  value={data.scopeTotals.SCOPE_2}
                />
                <BreakdownRow
                  label="Scope 3"
                  value={data.scopeTotals.SCOPE_3}
                />
              </div>
            </article>

            <article className="rounded-xl border p-5">
              <h3 className="font-semibold text-slate-950">
                Department breakdown
              </h3>

              <div className="mt-4 space-y-3">
                {data.departmentTotals.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No department emissions in this period.
                  </p>
                ) : (
                  data.departmentTotals.map((department) => (
                    <BreakdownRow
                      key={department.department}
                      label={department.department}
                      value={department.emissions}
                    />
                  ))
                )}
              </div>
            </article>
          </div>
        </>
      ) : null}
    </section>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-xl border bg-slate-50 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">
        {value}
      </p>
    </article>
  );
}

function BreakdownRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-700">{label}</span>
      <span className="font-semibold text-slate-950">
        {value.toFixed(3)} kgCO₂e
      </span>
    </div>
  );
}
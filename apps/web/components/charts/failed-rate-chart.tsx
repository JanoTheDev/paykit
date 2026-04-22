"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface FailedRateChartProps {
  data: Array<{ date: string; value: { rate: number; failed: number; attempted: number } }>;
}

export function FailedRateChart({ data }: FailedRateChartProps) {
  const flat = data.map((d) => ({
    date: d.date,
    rate: Math.round(d.value.rate * 1000) / 10,
    failed: d.value.failed,
    attempted: d.value.attempted,
  }));
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-4 text-sm font-medium text-foreground">
        Failed charge rate
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={flat}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
          <XAxis
            dataKey="date"
            tickFormatter={(d) =>
              new Date(d + "T00:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "rgba(148,163,184,0.2)" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111114",
              border: "1px solid rgba(148,163,184,0.2)",
              borderRadius: 8,
            }}
            labelStyle={{ color: "#f3f4f6" }}
            formatter={(value, _name, payload) => {
              const row = payload.payload as { failed: number; attempted: number };
              return [
                `${Number(value).toFixed(1)}% (${row.failed}/${row.attempted})`,
                "Failed rate",
              ];
            }}
          />
          <Line
            type="monotone"
            dataKey="rate"
            stroke="#f87171"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

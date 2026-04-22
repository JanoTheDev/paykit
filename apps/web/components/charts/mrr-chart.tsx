"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface MrrChartProps {
  data: Array<{ date: string; value: number }>;
}

export function MrrChart({ data }: MrrChartProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-4 text-sm font-medium text-foreground">MRR</h3>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
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
            tickFormatter={(v) => `$${(Number(v) / 100).toFixed(0)}`}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111114",
              border: "1px solid rgba(148,163,184,0.2)",
              borderRadius: 8,
            }}
            labelStyle={{ color: "#f3f4f6" }}
            formatter={(value) => [
              `$${(Number(value) / 100).toFixed(2)}`,
              "MRR",
            ]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#06d6a0"
            fill="#06d6a0"
            fillOpacity={0.15}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

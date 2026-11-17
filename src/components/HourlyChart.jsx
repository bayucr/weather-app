import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { convertTemp, convertWind } from "../utils/unitConverter";

const METRICS = {
  temp: { label: "Suhu", color: "var(--color-sky-400)" },
  rain: { label: "Hujan", color: "#818cf8" },
  wind: { label: "Angin", color: "#34d399" },
};

function getUnitLabel(metric, unit) {
  if (metric === "temp") return unit === "imperial" ? "\u00b0F" : "\u00b0C";
  if (metric === "rain") return "%";
  return unit === "imperial" ? "mph" : "km/h";
}

function ChartTooltip({ active, payload, metric, unit }) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs shadow-lg">
      <p className="text-slate-400">
        {point.date}{" \u2022 "}{point.label}
      </p>
      <p className="mt-1 font-semibold text-white">
        {METRICS[metric].label}:{" "}
        {Number.isFinite(point.value)
          ? `${point.value}${getUnitLabel(metric, unit)}`
          : "-"}
      </p>
      <p className="mt-0.5 text-slate-400">{point.conditions}</p>
    </div>
  );
}

export default function HourlyChart({ past24Hours, next24Hours, unit }) {
  const [metric, setMetric] = useState("temp");

  const nowEpoch = next24Hours[0]?.datetimeEpoch;

  const data = useMemo(() => {
    return [...past24Hours, ...next24Hours].map((hour) => {
      let value;
      if (metric === "temp") value = convertTemp(hour.temp, unit);
      else if (metric === "rain")
        value = Number.isFinite(hour.precipprob)
          ? Math.round(hour.precipprob)
          : null;
      else value = convertWind(hour.windspeed, unit);

      return {
        epoch: hour.datetimeEpoch,
        label: hour.datetime,
        date: hour.date,
        conditions: hour.conditions,
        value,
      };
    });
  }, [past24Hours, next24Hours, metric, unit]);

  const color = METRICS[metric].color;
  const unitLabel = getUnitLabel(metric, unit);
  const labelByEpoch = useMemo(
    () => new Map(data.map((d) => [d.epoch, d.label])),
    [data],
  );

  const commonAxes = (
    <>
      <CartesianGrid
        strokeDasharray="3 3"
        stroke="var(--color-slate-700)"
        vertical={false}
      />
      <XAxis
        dataKey="epoch"
        interval={5}
        tickFormatter={(epoch) => labelByEpoch.get(epoch) ?? ""}
        tick={{ fill: "var(--color-slate-400)", fontSize: 11 }}
        axisLine={{ stroke: "var(--color-slate-700)" }}
        tickLine={false}
      />
      <YAxis
        width={44}
        domain={metric === "rain" ? [0, 100] : ["auto", "auto"]}
        tickFormatter={(v) => `${v}${metric === "rain" ? "%" : ""}`}
        tick={{ fill: "var(--color-slate-400)", fontSize: 11 }}
        axisLine={false}
        tickLine={false}
      />
      <Tooltip
        content={<ChartTooltip metric={metric} unit={unit} />}
        cursor={{ stroke: "var(--color-slate-600)", strokeDasharray: "3 3" }}
      />
      {nowEpoch !== undefined && (
        <ReferenceLine
          x={nowEpoch}
          stroke="#f59e0b"
          strokeDasharray="4 4"
          label={{
            value: "Sekarang",
            position: "insideTopRight",
            fill: "#f59e0b",
            fontSize: 11,
          }}
        />
      )}
    </>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
      className="rounded-2xl bg-slate-800/60 border border-slate-700/80 p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-lg font-bold text-white">Grafik 48 Jam</h3>
          <p className="text-xs text-slate-400">
            24 jam terakhir hingga 24 jam ke depan ({unitLabel})
          </p>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-slate-900/90 border border-slate-700/70 self-start">
          {Object.entries(METRICS).map(([key, m]) => (
            <button
              key={key}
              type="button"
              onClick={() => setMetric(key)}
              className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                metric === key
                  ? "bg-sky-500 text-slate-950 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-slate-400 py-6 text-center">
          Data per jam tidak tersedia untuk grafik.
        </p>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {metric === "rain" ? (
              <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                {commonAxes}
                <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                {commonAxes}
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2.5}
                  fill="url(#chartFill)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </motion.section>
  );
}

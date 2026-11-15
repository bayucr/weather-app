import { motion } from "framer-motion";
import { Umbrella } from "lucide-react";
import WeatherIcon from "./WeatherIcon";
import { formatTemp } from "../utils/unitConverter";

function formatDayName(dateString, index) {
  if (index === 0) return "Hari ini";
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("id-ID", { weekday: "long" });
}

function formatShortDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function DailyForecast({ daily, unit }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="rounded-2xl bg-slate-800/60 border border-slate-700/80 p-6"
    >
      <h3 className="text-lg font-bold text-white mb-5">
        Prakiraan {daily.length} Hari
      </h3>

      {daily.length === 0 ? (
        <p className="text-sm text-slate-400 py-6 text-center">
          Data harian tidak tersedia.
        </p>
      ) : (
        <ul className="divide-y divide-slate-700/60">
          {daily.map((day, index) => (
            <li
              key={day.datetimeEpoch}
              className="flex items-center gap-3 sm:gap-4 py-3"
            >
              <div className="w-24 sm:w-32 flex-shrink-0">
                <p className="text-sm font-semibold text-white capitalize">
                  {formatDayName(day.date, index)}
                </p>
                <p className="text-xs text-slate-400">
                  {formatShortDate(day.date)}
                </p>
              </div>

              <WeatherIcon icon={day.icon} className="w-7 h-7 flex-shrink-0" />

              <p className="hidden sm:block flex-1 min-w-0 truncate text-xs text-slate-400">
                {day.conditions}
              </p>

              <span className="ml-auto sm:ml-0 flex items-center gap-1 text-xs text-sky-400 w-12 flex-shrink-0">
                <Umbrella className="w-3 h-3" />
                {day.precipprob}%
              </span>

              <div className="flex items-center gap-2 text-sm w-24 sm:w-28 justify-end flex-shrink-0">
                <span className="text-slate-400">
                  {formatTemp(day.tempmin, unit)}
                </span>
                <span className="font-bold text-white">
                  {formatTemp(day.tempmax, unit)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </motion.section>
  );
}

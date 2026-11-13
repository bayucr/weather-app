import { useState } from "react";
import { motion } from "framer-motion";
import { Umbrella } from "lucide-react";
import WeatherIcon from "./WeatherIcon";

export default function HourlyTimeline({ past24Hours, next24Hours }) {
  const [activeTab, setActiveTab] = useState("next"); // 'past' | 'next'

  const items = activeTab === "next" ? next24Hours : past24Hours;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="rounded-2xl bg-slate-800/60 border border-slate-700/80 p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h3 className="text-lg font-bold text-white">Timeline Cuaca Per Jam</h3>

        <div className="inline-flex p-1 rounded-xl bg-slate-900/90 border border-slate-700/70 self-start">
          <button
            type="button"
            onClick={() => setActiveTab("past")}
            className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
              activeTab === "past"
                ? "bg-sky-500 text-slate-950 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            24 Jam Terakhir ({past24Hours.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("next")}
            className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
              activeTab === "next"
                ? "bg-sky-500 text-slate-950 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            24 Jam Ke Depan ({next24Hours.length})
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-400 py-6 text-center">
          Data per jam tidak tersedia untuk rentang ini.
        </p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin">
          {items.map((hour) => (
            <div
              key={hour.datetimeEpoch}
              className="min-w-[96px] flex-shrink-0 flex flex-col items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/60 hover:border-sky-500/50 transition"
            >
              <span className="text-xs font-medium text-slate-400">
                {hour.datetime}
              </span>
              <div className="my-2.5">
                <WeatherIcon icon={hour.icon} className="w-8 h-8" />
              </div>
              <span className="text-base font-bold text-white">
                {hour.temp}°C
              </span>
              <span className="mt-1.5 flex items-center gap-1 text-[11px] text-sky-400">
                <Umbrella className="w-3 h-3" />
                {Math.round(hour.precipprob)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
}

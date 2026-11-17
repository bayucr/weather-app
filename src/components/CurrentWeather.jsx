import { motion } from "framer-motion";
import { Wind, Umbrella, Droplets, Clock } from "lucide-react";
import WeatherIcon from "./WeatherIcon";
import { formatTemp, formatWind } from "../utils/unitConverter";

const formatPercent = (v) => (Number.isFinite(v) ? `${v}%` : "-");

export default function CurrentWeather({
  resolvedAddress,
  current,
  lastUpdated,
  unit,
}) {
  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/80 p-6 shadow-xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {resolvedAddress}
          </h2>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Diperbarui pukul {formattedTime}
          </p>
        </div>
        <span className="inline-flex items-center self-start sm:self-auto px-3 py-1 rounded-full text-xs font-medium bg-sky-500/15 text-sky-300 border border-sky-500/30">
          {current.conditions}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 items-center">
        {/* Suhu Utama */}
        <div className="flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <WeatherIcon icon={current.icon} className="w-16 h-16" />
          </div>
          <div>
            <div className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight">
              {formatTemp(current.temp, unit)}
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Terasa seperti{" "}
              <span className="text-slate-200 font-medium">
                {formatTemp(current.feelslike, unit)}
              </span>
            </p>
          </div>
        </div>

        {/* Metrik Detail */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Wind className="w-4 h-4 text-teal-400" />
              <span>Angin</span>
            </div>
            <p className="text-lg font-bold text-slate-100">
              {formatWind(current.windspeed, unit)}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Umbrella className="w-4 h-4 text-sky-400" />
              <span>Hujan</span>
            </div>
            <p className="text-lg font-bold text-slate-100">
              {formatPercent(current.precipprob)}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Droplets className="w-4 h-4 text-indigo-400" />
              <span>Kelembapan</span>
            </div>
            <p className="text-lg font-bold text-slate-100">
              {formatPercent(current.humidity)}
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

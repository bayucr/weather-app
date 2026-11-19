import { formatTemp, formatWind } from "./unitConverter.js";

// Ambang batas dalam satuan metric (C, km/h, persen)
export const THRESHOLDS = {
  rainProb: 70,
  windWarning: 40,
  windDanger: 60,
  heatWarning: 35,
  heatDanger: 40,
  freeze: 0,
};

// Cari jam dengan nilai tertinggi (dir = 1) atau terendah (dir = -1)
function findExtreme(hours, key, dir) {
  let best = null;
  for (const h of hours) {
    const v = h[key];
    if (!Number.isFinite(v)) continue;
    if (best === null || (v - best[key]) * dir > 0) best = h;
  }
  return best;
}

function timeLabel(hour, firstDate) {
  const prefix = hour.date !== firstDate ? "besok " : "";
  return `${prefix}pukul ${hour.datetime}`;
}

// Mengembalikan daftar peringatan: { id, level: "warning" | "danger", title, message }
export function getWeatherAlerts(next24Hours, unit) {
  if (!Array.isArray(next24Hours) || next24Hours.length === 0) return [];

  const firstDate = next24Hours[0].date;
  const alerts = [];

  const thunder = next24Hours.find(
    (h) => typeof h.icon === "string" && h.icon.includes("thunder"),
  );
  if (thunder) {
    alerts.push({
      id: "thunder",
      level: "danger",
      title: "Badai petir",
      message: `Badai petir diperkirakan ${timeLabel(thunder, firstDate)}. Hindari berada di area terbuka.`,
    });
  }

  const rain = findExtreme(next24Hours, "precipprob", 1);
  if (rain && rain.precipprob >= THRESHOLDS.rainProb) {
    alerts.push({
      id: "rain",
      level: "warning",
      title: "Hujan kemungkinan besar",
      message: `Peluang hujan mencapai ${Math.round(rain.precipprob)}% ${timeLabel(rain, firstDate)}.`,
    });
  }

  const wind = findExtreme(next24Hours, "windspeed", 1);
  if (wind && wind.windspeed >= THRESHOLDS.windWarning) {
    alerts.push({
      id: "wind",
      level: wind.windspeed >= THRESHOLDS.windDanger ? "danger" : "warning",
      title: "Angin kencang",
      message: `Kecepatan angin mencapai ${formatWind(wind.windspeed, unit)} ${timeLabel(wind, firstDate)}.`,
    });
  }

  const heat = findExtreme(next24Hours, "temp", 1);
  if (heat && heat.temp >= THRESHOLDS.heatWarning) {
    alerts.push({
      id: "heat",
      level: heat.temp >= THRESHOLDS.heatDanger ? "danger" : "warning",
      title: "Suhu sangat panas",
      message: `Suhu mencapai ${formatTemp(heat.temp, unit)} ${timeLabel(heat, firstDate)}. Perbanyak minum dan hindari aktivitas berat di luar.`,
    });
  }

  const cold = findExtreme(next24Hours, "temp", -1);
  if (cold && cold.temp <= THRESHOLDS.freeze) {
    alerts.push({
      id: "freeze",
      level: "warning",
      title: "Suhu beku",
      message: `Suhu turun hingga ${formatTemp(cold.temp, unit)} ${timeLabel(cold, firstDate)}. Waspadai jalan licin.`,
    });
  }

  // Bahaya lebih dulu, lalu waspada
  return alerts.sort(
    (a, b) => (a.level === "danger" ? 0 : 1) - (b.level === "danger" ? 0 : 1),
  );
}

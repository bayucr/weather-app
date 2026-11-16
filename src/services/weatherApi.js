const BASE_URL =
  "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";

export async function fetchWeatherData(location, signal) {
  const cleanLocation = location.trim();
  if (!cleanLocation) {
    throw new Error("Masukkan nama kota atau koordinat terlebih dahulu.");
  }

  // Rentang /yesterday/next7days: kemarin untuk riwayat 24 jam, lalu hari ini dan 7 hari ke depan untuk prakiraan harian
  const url = `${BASE_URL}/${encodeURIComponent(
    cleanLocation,
  )}/yesterday/next7days?unitGroup=metric&include=days,hours,current&contentType=json`;

  const response = await fetch(url, { signal });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error("Lokasi tidak ditemukan. Coba periksa ejaan nama kota.");
    }
    if (response.status === 429) {
      throw new Error(
        "Batas akses API gratis sementara tercapai. Coba lagi nanti.",
      );
    }
    throw new Error(
      `Terjadi kesalahan saat memuat data cuaca (${response.status}).`,
    );
  }

  const data = await response.json();
  return normalizeWeatherData(data);
}

function normalizeWeatherData(data) {
  const current = data.currentConditions || data.days?.[1] || {};
  const nowEpoch = current.datetimeEpoch ?? Math.floor(Date.now() / 1000);
  const TWENTY_FOUR_HOURS = 24 * 60 * 60; // 86400 detik

  // Gabungkan semua array `hours` dari kemarin, hari ini, dan besok
  const allHours = (data.days || []).flatMap((day) =>
    (day.hours || []).map((hour) => ({
      datetime: hour.datetime.slice(0, 5), // Format "14:00:00" -> "14:00"
      datetimeEpoch: hour.datetimeEpoch,
      date: day.datetime,
      temp: Math.round(hour.temp),
      windspeed: hour.windspeed,
      precipprob: hour.precipprob ?? 0,
      conditions: hour.conditions,
      icon: hour.icon,
    })),
  );

  // Filter tepat 24 jam ke belakang & 24 jam ke depan dari waktu saat ini di lokasi tersebut
  const past24Hours = allHours
    .filter(
      (h) =>
        h.datetimeEpoch >= nowEpoch - TWENTY_FOUR_HOURS &&
        h.datetimeEpoch < nowEpoch,
    )
    .slice(-24);

  const next24Hours = allHours
    .filter(
      (h) =>
        h.datetimeEpoch >= nowEpoch &&
        h.datetimeEpoch < nowEpoch + TWENTY_FOUR_HOURS,
    )
    .slice(0, 24);

  // Prakiraan harian: dari hari ini (indeks 1, setelah kemarin) maksimal 7 hari
  const daily = (data.days || []).slice(1, 8).map((day) => ({
    date: day.datetime,
    datetimeEpoch: day.datetimeEpoch,
    tempmax: Math.round(day.tempmax ?? day.temp ?? 0),
    tempmin: Math.round(day.tempmin ?? day.temp ?? 0),
    precipprob: Math.round(day.precipprob ?? 0),
    conditions: day.conditions,
    icon: day.icon,
  }));

  return {
    resolvedAddress: data.resolvedAddress,
    timezone: data.timezone,
    current: {
      temp: Math.round(current.temp ?? 0),
      feelslike: Math.round(current.feelslike ?? current.temp ?? 0),
      windspeed: current.windspeed ?? 0,
      precipprob: current.precipprob ?? 0,
      humidity: Math.round(current.humidity ?? 0),
      conditions: current.conditions || "Tidak diketahui",
      icon: current.icon || "partly-cloudy-day",
      datetime: current.datetime?.slice(0, 5) || "",
    },
    past24Hours,
    next24Hours,
    daily,
  };
}

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

  let response;
  try {
    response = await fetch(url, { signal });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new Error(
      "Tidak dapat terhubung ke server cuaca. Periksa koneksi internet kamu lalu coba lagi.",
      { cause: err },
    );
  }

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error("Lokasi tidak ditemukan. Coba periksa ejaan nama kota.");
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        "Akses ke layanan cuaca ditolak. Periksa konfigurasi akses API.",
      );
    }
    if (response.status === 404) {
      throw new Error("Layanan cuaca tidak ditemukan. Coba lagi nanti.");
    }
    if (response.status === 429) {
      throw new Error(
        "Batas akses API gratis sementara tercapai. Coba lagi nanti.",
      );
    }
    if (response.status >= 500) {
      throw new Error(
        "Server cuaca sedang bermasalah. Coba lagi beberapa saat lagi.",
      );
    }
    throw new Error(
      `Terjadi kesalahan saat memuat data cuaca (${response.status}).`,
    );
  }

  const data = await response.json();
  return normalizeWeatherData(data);
}

// Mengembalikan null (bukan 0) kalau nilai kosong atau bukan angka
function roundOrNull(value) {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? Math.round(num) : null;
}

// Hitung epoch (detik) dari tanggal "YYYY-MM-DD", jam "HH:MM:SS", dan tzoffset (jam)
function toEpoch(dateStr, timeStr, tzoffset) {
  if (!dateStr || !timeStr) return null;
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, mi, s] = timeStr.split(":").map(Number);
  const utcSeconds = Date.UTC(y, mo - 1, d, h, mi, s || 0) / 1000;
  return utcSeconds - (tzoffset || 0) * 3600;
}

function normalizeWeatherData(data) {
  const tz = data.tzoffset ?? 0;
  const current = data.currentConditions || data.days?.[1] || {};
  const nowEpoch =
    current.datetimeEpoch ??
    toEpoch(data.days?.[1]?.datetime, current.datetime, tz) ??
    Math.floor(Date.now() / 1000);
  const TWENTY_FOUR_HOURS = 24 * 60 * 60; // 86400 detik

  // Gabungkan semua array `hours` dari kemarin, hari ini, dan besok
  const allHours = (data.days || []).flatMap((day) =>
    (day.hours || []).map((hour) => ({
      datetime: hour.datetime.slice(0, 5), // Format "14:00:00" -> "14:00"
      datetimeEpoch: hour.datetimeEpoch ?? toEpoch(day.datetime, hour.datetime, tz),
      date: day.datetime,
      temp: roundOrNull(hour.temp),
      windspeed: hour.windspeed ?? null,
      precipprob: roundOrNull(hour.precipprob),
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
    datetimeEpoch: day.datetimeEpoch ?? toEpoch(day.datetime, "00:00:00", tz),
    tempmax: roundOrNull(day.tempmax ?? day.temp),
    tempmin: roundOrNull(day.tempmin ?? day.temp),
    precipprob: roundOrNull(day.precipprob),
    conditions: day.conditions,
    icon: day.icon,
  }));

  return {
    resolvedAddress: data.resolvedAddress,
    timezone: data.timezone,
    current: {
      temp: roundOrNull(current.temp),
      feelslike: roundOrNull(current.feelslike ?? current.temp),
      windspeed: current.windspeed ?? null,
      precipprob: roundOrNull(current.precipprob),
      humidity: roundOrNull(current.humidity),
      conditions: current.conditions || "Tidak diketahui",
      icon: current.icon || "partly-cloudy-day",
      datetime: current.datetime?.slice(0, 5) || "",
    },
    past24Hours,
    next24Hours,
    daily,
  };
}

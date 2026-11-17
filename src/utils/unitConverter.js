const isNum = (v) => Number.isFinite(v);

export function formatTemp(tempC, unit) {
  if (!isNum(tempC)) return "-";
  if (unit === "imperial") {
    return `${Math.round((tempC * 9) / 5 + 32)}\u00b0F`;
  }
  return `${Math.round(tempC)}\u00b0C`;
}

export function formatWind(speedKmh, unit) {
  if (!isNum(speedKmh)) return "-";
  if (unit === "imperial") {
    return `${Math.round(speedKmh * 0.621371)} mph`;
  }
  return `${Math.round(speedKmh)} km/h`;
}

export function convertTemp(tempC, unit) {
  if (!isNum(tempC)) return null;
  const value = unit === "imperial" ? (tempC * 9) / 5 + 32 : tempC;
  return Math.round(value);
}

export function convertWind(speedKmh, unit) {
  if (!isNum(speedKmh)) return null;
  const value = unit === "imperial" ? speedKmh * 0.621371 : speedKmh;
  return Math.round(value);
}

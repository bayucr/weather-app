export function formatTemp(tempC, unit) {
  if (unit === "imperial") {
    return `${Math.round((tempC * 9) / 5 + 32)}°F`;
  }
  return `${Math.round(tempC)}°C`;
}

export function formatWind(speedKmh, unit) {
  if (unit === "imperial") {
    return `${Math.round(speedKmh * 0.621371)} mph`;
  }
  return `${Math.round(speedKmh)} km/h`;
}

export function convertTemp(tempC, unit) {
  const value = unit === "imperial" ? (tempC * 9) / 5 + 32 : tempC;
  return Math.round(value);
}

export function convertWind(speedKmh, unit) {
  const value = unit === "imperial" ? speedKmh * 0.621371 : speedKmh;
  return Math.round(value);
}

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

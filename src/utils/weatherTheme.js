// Memetakan ikon Visual Crossing ke nama tema.
// Tema: sunny | night | cloudy | rain | neutral
const THEME_BY_ICON = {
  "clear-day": "sunny",
  "clear-night": "night",
  "partly-cloudy-night": "night",
  cloudy: "cloudy",
  "partly-cloudy-day": "cloudy",
  wind: "cloudy",
  rain: "rain",
  "showers-day": "rain",
  "showers-night": "rain",
};

export function getWeatherTheme(icon) {
  return THEME_BY_ICON[icon] || "neutral";
}

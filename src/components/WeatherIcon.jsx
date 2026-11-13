import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  CloudFog,
  Wind,
} from "lucide-react";

export default function WeatherIcon({ icon, className = "w-8 h-8" }) {
  const iconMap = {
    "clear-day": <Sun className={`${className} text-amber-400`} />,
    "clear-night": <Moon className={`${className} text-indigo-300`} />,
    "partly-cloudy-day": <CloudSun className={`${className} text-amber-300`} />,
    "partly-cloudy-night": (
      <CloudMoon className={`${className} text-slate-300`} />
    ),
    cloudy: <Cloud className={`${className} text-slate-400`} />,
    rain: <CloudRain className={`${className} text-sky-400`} />,
    "showers-day": <CloudRain className={`${className} text-sky-400`} />,
    "showers-night": <CloudRain className={`${className} text-sky-400`} />,
    "thunder-rain": (
      <CloudLightning className={`${className} text-purple-400`} />
    ),
    "thunder-showers-day": (
      <CloudLightning className={`${className} text-purple-400`} />
    ),
    "thunder-showers-night": (
      <CloudLightning className={`${className} text-purple-400`} />
    ),
    snow: <Snowflake className={`${className} text-cyan-200`} />,
    fog: <CloudFog className={`${className} text-slate-400`} />,
    wind: <Wind className={`${className} text-teal-300`} />,
  };

  return (
    iconMap[icon] || <CloudSun className={`${className} text-amber-300`} />
  );
}

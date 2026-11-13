import { useState, useEffect, useCallback } from "react";
import { CloudSun, AlertCircle } from "lucide-react";
import { fetchWeatherData } from "./services/weatherApi";
import SearchBar from "./components/SearchBar";
import CurrentWeather from "./components/CurrentWeather";
import HourlyTimeline from "./components/HourlyTimeline";

const DEFAULT_LOCATION = "Palembang, Indonesia";
const STORAGE_KEY = "weather_app_last_location";

export default function App() {
  const [activeLocation, setActiveLocation] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [unit, setUnit] = useState("metric"); // 'metric' | 'imperial'

  // Dipakai oleh event handler (Search, Refresh, klik tombol Lokasi Saya)
  const loadWeather = useCallback(async (locationQuery) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchWeatherData(locationQuery);
      setWeatherData(data);
      setActiveLocation(locationQuery);
      setLastUpdated(new Date());
      localStorage.setItem(STORAGE_KEY, locationQuery);
    } catch (err) {
      setError(err.message || "Gagal memuat data cuaca.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load saat aplikasi pertama kali dibuka (tanpa sync setState di dalam effect)
  useEffect(() => {
    let ignore = false;

    const loadInitialWeather = async (locationQuery) => {
      try {
        const data = await fetchWeatherData(locationQuery);
        if (ignore) return;
        setWeatherData(data);
        setActiveLocation(locationQuery);
        setLastUpdated(new Date());
        localStorage.setItem(STORAGE_KEY, locationQuery);
      } catch (err) {
        if (ignore) return;
        setError(err.message || "Gagal memuat data cuaca.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    const fallbackLocation =
      localStorage.getItem(STORAGE_KEY) || DEFAULT_LOCATION;

    if (!("geolocation" in navigator)) {
      loadInitialWeather(fallbackLocation);
      return () => {
        ignore = true;
      };
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (ignore) return;
        const { latitude, longitude } = position.coords;
        loadInitialWeather(`${latitude.toFixed(4)},${longitude.toFixed(4)}`);
      },
      () => {
        if (ignore) return;
        loadInitialWeather(fallbackLocation);
      },
      { timeout: 6000 },
    );

    return () => {
      ignore = true;
    };
  }, []);

  const handleUseCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      setError("Browser kamu tidak mendukung fitur Geolocation.");
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        loadWeather(`${latitude.toFixed(4)},${longitude.toFixed(4)}`);
      },
      () => {
        setIsLoading(false);
        setError(
          "Izin lokasi ditolak. Aktifkan izin lokasi di browser atau cari nama kota secara manual.",
        );
      },
      { timeout: 6000 },
    );
  };

  const handleRefresh = () => {
    if (!activeLocation || isLoading) return;
    loadWeather(activeLocation);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-500/30">
              <CloudSun className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                WeatherCast
              </h1>
              <p className="text-xs text-slate-400">
                Riwayat 24 Jam & Prakiraan Cuaca
              </p>
            </div>
            <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => setUnit("metric")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  unit === "metric"
                    ? "bg-sky-500 text-slate-950"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                °C, km/h
              </button>
              <button
                type="button"
                onClick={() => setUnit("imperial")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  unit === "imperial"
                    ? "bg-sky-500 text-slate-950"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                °F, mph
              </button>
            </div>
          </div>
        </header>

        {/* Search & Controls */}
        <SearchBar
          onSearch={loadWeather}
          onUseCurrentLocation={handleUseCurrentLocation}
          onRefresh={handleRefresh}
          isLoading={isLoading}
          hasData={Boolean(weatherData)}
        />

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm"
          >
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Skeleton Loader saat fetching */}
        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-56 rounded-2xl bg-slate-800/70 border border-slate-800" />
            <div className="h-48 rounded-2xl bg-slate-800/70 border border-slate-800" />
          </div>
        ) : (
          weatherData && (
            <main className="space-y-6">
              <CurrentWeather
                resolvedAddress={weatherData.resolvedAddress}
                current={weatherData.current}
                lastUpdated={lastUpdated}
                unit={unit}
              />

              <HourlyTimeline
                past24Hours={weatherData.past24Hours}
                next24Hours={weatherData.next24Hours}
                unit={unit}
              />
            </main>
          )
        )}
      </div>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto pt-10 text-center text-xs text-slate-500">
        Data cuaca oleh Visual Crossing Weather API • Proyek roadmap.sh
      </footer>
    </div>
  );
}

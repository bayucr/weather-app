import { useState } from "react";
import { Search, MapPin, RefreshCw } from "lucide-react";

export default function SearchBar({
  onSearch,
  onUseCurrentLocation,
  onRefresh,
  isLoading,
  hasData,
}) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onSearch(query.trim());
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <form onSubmit={handleSubmit} className="relative flex-1">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari kota (misal: Palembang, Jakarta, Tokyo)..."
          disabled={isLoading}
          className="w-full pl-11 pr-24 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-semibold text-sm transition cursor-pointer"
        >
          Cari
        </button>
      </form>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onUseCurrentLocation}
          disabled={isLoading}
          title="Gunakan lokasi saya saat ini"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium transition disabled:opacity-50 cursor-pointer"
        >
          <MapPin className="w-4 h-4 text-sky-400" />
          <span className="sm:hidden lg:inline">Lokasi Saya</span>
        </button>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading || !hasData}
          title="Perbarui data cuaca"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium transition disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw
            className={`w-4 h-4 text-emerald-400 ${isLoading ? "animate-spin" : ""}`}
          />
          <span className="sm:hidden lg:inline">Refresh</span>
        </button>
      </div>
    </div>
  );
}

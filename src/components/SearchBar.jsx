import { useEffect, useRef, useState } from "react";
import { Search, MapPin, RefreshCw } from "lucide-react";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { searchCities, MIN_QUERY_LENGTH } from "../services/geocodingApi";

export default function SearchBar({
  onSearch,
  onUseCurrentLocation,
  onRefresh,
  isLoading,
  hasData,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [results, setResults] = useState({ term: "", items: [] });
  const formRef = useRef(null);

  const debounced = useDebouncedValue(query, 350);
  const term = debounced.trim();

  // Ambil saran setelah pengguna berhenti mengetik
  useEffect(() => {
    if (term.length < MIN_QUERY_LENGTH) return;
    const controller = new AbortController();

    searchCities(term, controller.signal)
      .then((items) => setResults({ term, items }))
      .catch((err) => {
        if (err.name === "AbortError") return;
        setResults({ term, items: [] });
      });

    return () => controller.abort();
  }, [term]);

  // Tutup daftar saat klik di luar komponen
  useEffect(() => {
    const handleClick = (e) => {
      if (formRef.current && !formRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Saran hanya tampil kalau cocok dengan teks yang sedang diketik
  const suggestions =
    open &&
    term.length >= MIN_QUERY_LENGTH &&
    term === query.trim() &&
    results.term === term
      ? results.items
      : [];

  const selectSuggestion = (item) => {
    setQuery(item.label);
    setOpen(false);
    setActiveIndex(-1);
    if (isLoading) return;
    onSearch(item.query, item.label);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    setOpen(false);
    onSearch(query.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <form ref={formRef} onSubmit={handleSubmit} className="relative flex-1">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Cari kota (misal: Palembang, Jakarta, Tokyo)..."
          disabled={isLoading}
          role="combobox"
          aria-expanded={suggestions.length > 0}
          aria-controls="city-suggestions"
          aria-autocomplete="list"
          autoComplete="off"
          className="w-full pl-11 pr-24 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-semibold text-sm transition cursor-pointer"
        >
          Cari
        </button>

        {suggestions.length > 0 && (
          <ul
            id="city-suggestions"
            role="listbox"
            className="absolute left-0 right-0 top-full mt-2 z-20 rounded-xl bg-slate-900 border border-slate-700 shadow-xl overflow-hidden"
          >
            {suggestions.map((item, index) => (
              <li
                key={item.id}
                role="option"
                aria-selected={index === activeIndex}
              >
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectSuggestion(item)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`w-full text-left px-4 py-2.5 flex items-start gap-2.5 transition cursor-pointer ${
                    index === activeIndex ? "bg-slate-800" : "hover:bg-slate-800"
                  }`}
                >
                  <MapPin className="w-4 h-4 mt-0.5 text-sky-400 flex-shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-100 truncate">
                      {item.name}
                    </span>
                    {item.detail && (
                      <span className="block text-xs text-slate-400 truncate">
                        {item.detail}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
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

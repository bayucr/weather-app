const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

export const MIN_QUERY_LENGTH = 3;

// Mencari saran kota. Mengembalikan array kosong kalau input terlalu pendek,
// tidak ada hasil, atau API gagal. Pembatalan (AbortError) diteruskan.
export async function searchCities(query, signal) {
  const name = query.trim();
  if (name.length < MIN_QUERY_LENGTH) return [];

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(
    name,
  )}&count=6&language=id&format=json`;

  let response;
  try {
    response = await fetch(url, { signal });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    return [];
  }

  if (!response.ok) return [];

  const data = await response.json();
  return (data.results ?? []).map((item) => {
    const parts = [item.name, item.admin1, item.country].filter(Boolean);
    // Hindari duplikat berurutan, misalnya "Berlin, Berlin, Jerman"
    const unique = parts.filter((p, i) => i === 0 || p !== parts[i - 1]);
    return {
      id: item.id,
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      query: `${item.latitude.toFixed(4)},${item.longitude.toFixed(4)}`,
      detail: unique.slice(1).join(", "),
      label: unique.join(", "),
    };
  });
}

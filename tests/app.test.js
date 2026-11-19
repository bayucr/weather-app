import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatTemp,
  formatWind,
  convertTemp,
  convertWind,
} from "../src/utils/unitConverter.js";
import { getWeatherTheme } from "../src/utils/weatherTheme.js";
import { normalizeWeatherData } from "../src/services/weatherApi.js";

// ---------- unitConverter ----------

test("formatTemp metric dan imperial", () => {
  assert.equal(formatTemp(25, "metric"), "25\u00b0C");
  assert.equal(formatTemp(25, "imperial"), "77\u00b0F");
  assert.equal(formatTemp(0, "metric"), "0\u00b0C");
});

test("formatTemp nilai kosong menjadi tanda hubung", () => {
  assert.equal(formatTemp(null, "metric"), "-");
  assert.equal(formatTemp(undefined, "imperial"), "-");
  assert.equal(formatTemp(NaN, "metric"), "-");
});

test("formatWind metric, imperial, dan kosong", () => {
  assert.equal(formatWind(10, "metric"), "10 km/h");
  assert.equal(formatWind(10, "imperial"), "6 mph");
  assert.equal(formatWind(null, "metric"), "-");
});

test("convertTemp dan convertWind", () => {
  assert.equal(convertTemp(100, "imperial"), 212);
  assert.equal(convertTemp(25.4, "metric"), 25);
  assert.equal(convertTemp(null, "metric"), null);
  assert.equal(convertWind(100, "imperial"), 62);
  assert.equal(convertWind(7.6, "metric"), 8);
  assert.equal(convertWind(undefined, "imperial"), null);
});

// ---------- weatherTheme ----------

test("getWeatherTheme memetakan ikon ke tema", () => {
  assert.equal(getWeatherTheme("clear-day"), "sunny");
  assert.equal(getWeatherTheme("clear-night"), "night");
  assert.equal(getWeatherTheme("partly-cloudy-night"), "night");
  assert.equal(getWeatherTheme("cloudy"), "cloudy");
  assert.equal(getWeatherTheme("showers-night"), "rain");
});

test("getWeatherTheme: ikon tidak dikenal menjadi neutral", () => {
  assert.equal(getWeatherTheme("fog"), "neutral");
  assert.equal(getWeatherTheme("thunder-rain"), "neutral");
  assert.equal(getWeatherTheme(undefined), "neutral");
});

// ---------- normalizeWeatherData ----------

function makeHours(temp) {
  return Array.from({ length: 24 }, (_, h) => ({
    datetime: `${String(h).padStart(2, "0")}:00:00`,
    temp,
    windspeed: 5.4,
    precipprob: 10,
    conditions: "Overcast",
    icon: "cloudy",
  }));
}

function makeDay(datetime, withHours) {
  const day = {
    datetime,
    tempmax: 30.4,
    tempmin: 24.6,
    temp: 27,
    precipprob: 40,
    conditions: "Rain",
    icon: "rain",
  };
  if (withHours) day.hours = makeHours(26.2);
  return day;
}

// Format respons nyata: tanpa datetimeEpoch di level mana pun
function makeApiData() {
  return {
    resolvedAddress: "Palembang, Indonesia",
    timezone: "Asia/Jakarta",
    tzoffset: 7,
    currentConditions: {
      datetime: "21:30:00",
      temp: 26.1,
      feelslike: 27.4,
      humidity: 94.2,
      precipprob: 0,
      windspeed: 7.6,
      conditions: "Partially cloudy",
      icon: "partly-cloudy-night",
    },
    days: [
      makeDay("2026-11-16", true),
      makeDay("2026-11-17", true),
      makeDay("2026-11-18", true),
      makeDay("2026-11-19", false),
      makeDay("2026-11-20", false),
      makeDay("2026-11-21", false),
      makeDay("2026-11-22", false),
      makeDay("2026-11-23", false),
      makeDay("2026-11-24", false),
    ],
  };
}

test("normalize: tanpa datetimeEpoch tetap menghasilkan 24 jam per sisi", () => {
  const result = normalizeWeatherData(makeApiData());
  assert.equal(result.past24Hours.length, 24);
  assert.equal(result.next24Hours.length, 24);
  assert.equal(result.past24Hours[0].date, "2026-11-16");
  assert.equal(result.past24Hours[0].datetime, "22:00");
  assert.equal(result.next24Hours[0].date, "2026-11-17");
  assert.equal(result.next24Hours[0].datetime, "22:00");
});

test("normalize: epoch jam terisi dan berurutan", () => {
  const { past24Hours, next24Hours } = normalizeWeatherData(makeApiData());
  const all = [...past24Hours, ...next24Hours];
  assert.ok(all.every((h) => Number.isFinite(h.datetimeEpoch)));
  for (let i = 1; i < all.length; i++) {
    assert.equal(all[i].datetimeEpoch - all[i - 1].datetimeEpoch, 3600);
  }
});

test("normalize: prakiraan harian 7 hari mulai dari hari kedua", () => {
  const { daily } = normalizeWeatherData(makeApiData());
  assert.equal(daily.length, 7);
  assert.equal(daily[0].date, "2026-11-17");
  assert.equal(daily[6].date, "2026-11-23");
  assert.ok(daily.every((d) => Number.isFinite(d.datetimeEpoch)));
  assert.equal(daily[0].tempmax, 30);
  assert.equal(daily[0].tempmin, 25);
});

test("normalize: nilai current dibulatkan dan ikon dipertahankan", () => {
  const { current } = normalizeWeatherData(makeApiData());
  assert.equal(current.temp, 26);
  assert.equal(current.feelslike, 27);
  assert.equal(current.humidity, 94);
  assert.equal(current.icon, "partly-cloudy-night");
  assert.equal(current.datetime, "21:30");
});

test("normalize: nilai kosong menjadi null, bukan 0", () => {
  const data = makeApiData();
  data.currentConditions = {
    datetime: "21:30:00",
    conditions: "Clear",
    icon: "clear-night",
  };
  const { current } = normalizeWeatherData(data);
  assert.equal(current.temp, null);
  assert.equal(current.humidity, null);
  assert.equal(current.precipprob, null);
  assert.equal(current.windspeed, null);
});

test("normalize: datetimeEpoch dari API dipakai kalau ada", () => {
  const data = makeApiData();
  data.days[1].datetimeEpoch = 1234;
  const { daily } = normalizeWeatherData(data);
  assert.equal(daily[0].datetimeEpoch, 1234);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { getWeatherAlerts } from "../src/utils/weatherAlerts.js";

function hour(overrides = {}) {
  return {
    date: "2026-11-17",
    datetime: "12:00",
    temp: 28,
    windspeed: 10,
    precipprob: 10,
    icon: "cloudy",
    ...overrides,
  };
}

test("alerts: kondisi biasa tidak menghasilkan peringatan", () => {
  assert.deepEqual(getWeatherAlerts([hour(), hour()], "metric"), []);
});

test("alerts: data kosong atau bukan array aman", () => {
  assert.deepEqual(getWeatherAlerts([], "metric"), []);
  assert.deepEqual(getWeatherAlerts(undefined, "metric"), []);
});

test("alerts: hujan 70% ke atas memberi peringatan waspada", () => {
  const result = getWeatherAlerts(
    [hour({ precipprob: 69 }), hour({ precipprob: 85, datetime: "15:00" })],
    "metric",
  );
  assert.equal(result.length, 1);
  assert.equal(result[0].id, "rain");
  assert.equal(result[0].level, "warning");
  assert.match(result[0].message, /85%/);
  assert.match(result[0].message, /15:00/);
});

test("alerts: hujan 69% belum memicu peringatan", () => {
  assert.deepEqual(getWeatherAlerts([hour({ precipprob: 69 })], "metric"), []);
});

test("alerts: angin 40 waspada, 60 bahaya", () => {
  const warn = getWeatherAlerts([hour({ windspeed: 45 })], "metric");
  assert.equal(warn[0].id, "wind");
  assert.equal(warn[0].level, "warning");
  const danger = getWeatherAlerts([hour({ windspeed: 65 })], "metric");
  assert.equal(danger[0].level, "danger");
});

test("alerts: suhu panas 35 waspada, 40 bahaya", () => {
  const warn = getWeatherAlerts([hour({ temp: 36 })], "metric");
  assert.equal(warn[0].id, "heat");
  assert.equal(warn[0].level, "warning");
  const danger = getWeatherAlerts([hour({ temp: 41 })], "metric");
  assert.equal(danger[0].level, "danger");
});

test("alerts: suhu beku memberi peringatan", () => {
  const result = getWeatherAlerts([hour({ temp: -2 })], "metric");
  assert.equal(result[0].id, "freeze");
});

test("alerts: badai petir adalah bahaya dan tampil paling atas", () => {
  const result = getWeatherAlerts(
    [
      hour({ precipprob: 90 }),
      hour({ icon: "thunder-rain", datetime: "16:00" }),
    ],
    "metric",
  );
  assert.equal(result[0].id, "thunder");
  assert.equal(result[0].level, "danger");
  assert.equal(result[1].id, "rain");
});

test("alerts: jam di hari berikutnya diberi kata besok", () => {
  const result = getWeatherAlerts(
    [
      hour(),
      hour({ date: "2026-11-18", datetime: "03:00", precipprob: 80 }),
    ],
    "metric",
  );
  assert.match(result[0].message, /besok pukul 03:00/);
});

test("alerts: nilai kosong (null) diabaikan", () => {
  const result = getWeatherAlerts(
    [hour({ temp: null, windspeed: null, precipprob: null })],
    "metric",
  );
  assert.deepEqual(result, []);
});

test("alerts: satuan imperial memengaruhi teks, bukan ambang", () => {
  const result = getWeatherAlerts([hour({ windspeed: 50 })], "imperial");
  assert.equal(result[0].id, "wind");
  assert.match(result[0].message, /31 mph/);
});

# WeatherCast — Weather Web App

Aplikasi prakiraan dan riwayat cuaca berbasis web yang dibangun sebagai solusi proyek [Weather App di roadmap.sh](https://roadmap.sh/projects/weather-app).

## Fitur Utama

- **Cuaca Saat Ini:** Menampilkan suhu (°C), suhu terasa (_feels like_), kecepatan angin, peluang hujan (%), kelembapan, dan kondisi umum.
- **Timeline 48 Jam:** Navigasi tab untuk melihat data cuaca per jam selama **24 jam terakhir** dan **24 jam ke depan**.
- **Deteksi Lokasi Otomatis (Geolocation):** Otomatis menampilkan cuaca di lokasi pengguna saat aplikasi dibuka, serta menyimpan pencarian terakhir di `localStorage`.
- **Refresh Data:** Memperbarui data cuaca lokasi aktif kapan saja.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Ikon & Animasi:** Lucide React & Framer Motion
- **Weather API:** Visual Crossing Timeline Weather API

## Menjalankan di Lokal

```bash
npm install
npm run dev
```

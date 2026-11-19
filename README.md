# Scoutroom

Dashboard pribadi untuk meninjau peluang program, hackathon, fellowship, dan grant dari hasil scout Muse. UI memakai source component UIArc melalui React 19 islands di Astro. Slice ini memakai fixture lokal dan belum terhubung ke Muse, D1, atau Cloudflare Access.

## Jalankan lokal

```sh
npm install
bun run dev
```

Perintah lain:

```sh
bun run check
bun run build
bun run preview
```

## Batas modul

- `src/features/opportunities/` menyimpan model peluang, fixture, kartu, filter, dan detail.
- `src/features/scrape-runs/` menyimpan model run contoh dan riwayat scrape.
- `src/layouts/` memiliki app shell dan navigasi bersama.
- `src/pages/` hanya menyusun route `/` dan `/runs`.
- `src/scripts/` mengelola state browser yang kecil: filter, detail, tersimpan, dan review.

Grade scrape A–C dan skor kecocokan adalah data contoh yang terpisah. Rumusnya belum ditentukan. Semua tautan `.example` dan nama peluang di UI adalah fixture, bukan temuan aktif.

Target deploy adalah Cloudflare Workers. Sebelum memakai data nyata, tentukan kontrak ingest Muse, setujui skema D1, dan konfigurasi Cloudflare Access untuk akun pemilik.

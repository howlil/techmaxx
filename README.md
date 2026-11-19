# Scoutroom

Dashboard pribadi untuk meninjau peluang program, hackathon, fellowship, dan grant dari hasil scout Muse. UI memakai source component UIArc melalui React 19 islands di Astro. UI memakai fixture lokal jika D1 belum ter-binding; endpoint ingest Muse v1 dan skema D1 sudah disiapkan, tetapi payload Muse asli dan Cloudflare Access production belum diverifikasi.

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

Target deploy adalah Cloudflare Workers. Sebelum memakai data nyata, verifikasi payload Muse terhadap kontrak v1, set `MUSE_INGEST_TOKEN`, dan konfigurasi Cloudflare Access untuk akun pemilik.

## Ingest Muse

Worker ini menyediakan `POST /api/ingest/muse` untuk payload JSON `schemaVersion: 1`. Kirim `Authorization: Bearer <MUSE_INGEST_TOKEN>` dan `X-Idempotency-Key` yang stabil untuk setiap delivery. Payload memuat satu `run` dan array `opportunities`; setiap opportunity wajib memiliki `externalId`, `runId`, provenance, eligibility, dan bukti sumber. `fitScore` dan `qualityGrade` tetap terpisah; `fitScore` boleh `null`.

Setelah membuat secret token, jalankan migrasi dan deploy:

```sh
wrangler secret put MUSE_INGEST_TOKEN
bun run db:migrate:remote
bun run deploy
```

Payload ditolak jika autentikasi, schema, URL sumber, atau idempotency key tidak valid. D1 menerima ulang delivery yang sama sebagai duplicate tanpa membuat record baru.

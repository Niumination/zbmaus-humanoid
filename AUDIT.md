# Audit — zbmaus-humanoid ↔ Bot OMB

Tanggal: 2026-11-03. Auditor: ZbmausHumanoid-Vercel (bot OMB).

## Ringkasan

Live site `https://zbmaus-humanoid.vercel.app` saat ini **belum** terhubung ke bot ini.
Chat panel (`/api/chat`) mem-proxy ke LLM generik (qwen via Cloudflare tunnel),
bukan ke bot ZbmausHumanoid-Vercel di OMB. Untuk membuat akses live site setara
berinteraksi dengan bot ini, dibutuhkan jalur publik ke bot.

## Temuan

### 1. Chat panel adalah LLM generik, bukan bot ini
- `api/chat.ts` memanggil `LLM_ENDPOINT` (default OpenAI) dengan system prompt
  generik "Kamu adalah zbmaus-humanoid...".
- Env aktif: `LLM_ENDPOINT=https://specifications-tom-accessibility-duties.trycloudflare.com/v1/chat/completions`,
  `LLM_MODEL=qwen3.8-flash-next-gyro-gyro-s`, tanpa `LLM_API_KEY`.
- Tidak ada `LLM_API_KEY` ter-set → endpoint tunnel dipanggil tanpa autentikasi.
- Bot ini (ZbmausHumanoid-Vercel) tidak pernah dilibatkan dalam jawaban.

### 2. Bot ini hanya bisa diakses dari localhost / sesi terautentikasi
- OMB berjalan di `maus.abstract.biz.id` (Cloudflare tunnel → caddy → OMB port 8799).
- Endpoint bot: `POST /api/bots/{botId}/messages` (memerlukan auth: session/admin/loopback).
- Webhook trigger yang dibuat bot ini memiliki alamat `http://127.0.0.1:8800/hooks/...`
  dan **tidak** bisa diakses publik (Cloudflare mengembalikan 403 "came through a proxy").
- Karena itu, Vercel (eksternal) tidak bisa memanggil bot secara langsung/sinkron.

### 3. Konfigurasi repo
- `package.json`: `"private": true` padahal repo publik → inkonsisten.
- `tsconfig.tsbuildinfo` ter-commit (artefak build) → sebaiknya di-.gitignore.
- `vercel.json` rewrite `/((?!api/).*)` → `/index.html` sudah benar untuk SPA.
- Cache headers untuk `/assets` (immutable) dan `/humanoid` (7 hari) sudah baik.
- Tidak ada `.env.example` di repo.

### 4. Kesehatan deploy
- Vercel project `zbmaus-humanoid` (id `prj_PSOBqRFDAi6bbE0gsAgkIo11DRQ6`) terhubung ke
  `Niumination/zbmaus-humanoid` (main), team Archk4li's projects.
- Deployment production pertama: `dpl_5JL7rzM7dv9ZiT8K8MbKMxu9DY7q` status READY/PROMOTED.
- `https://zbmaus-humanoid.vercel.app` mengembalikan HTTP 200, title `zbmaus-humanoid`.

## Rekomendasi & langkah berikutnya

Untuk membuat live site setara berinteraksi dengan bot ini, pilih salah satu:

**A. Relay publik di VPS (disarankan)**
Jalankan proxy HTTP kecil di VPS yang meneruskan request publik ke
`127.0.0.1:8800` (webhook) atau `127.0.0.1:8799` (bot messages API),
lalu expose via Cloudflare tunnel / caddy. Setelah itu, `/api/chat` di Vercel
bisa memanggil relay tersebut secara sinkron.

**B. Token admin OMB**
Buat token admin/sesi untuk `maus.abstract.biz.id` yang boleh dipakai Vercel,
lalu `/api/chat` memanggil `POST /api/bots/{botId}/messages` dengan token itu
dan melakukan polling untuk balasan bot.

**C. Embed chat OMB**
Ganti panel chat di site dengan iframe ke halaman chat bot ini di OMB
(memerlukan login pengguna).

## Yang sudah diperbaiki oleh audit ini
- `package.json`: `private` diubah ke `false` (konsisten dengan repo publik).
- `.env.example` ditambahkan untuk mendokumentasikan env yang dibutuhkan.
- `README.md` diperbarui dengan status koneksi dan rencana integrasi.
- `AUDIT.md` (file ini) ditambahkan sebagai laporan audit.

## Catatan
Bot ini tetap memonitor dan mengelola deployment Vercel. Setelah jalur publik
(A atau B) tersedia, `/api/chat` akan dirombak agar benar-benar memanggil bot ini.

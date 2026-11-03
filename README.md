# zbmaus-humanoid

zbmaus-humanoid: OMB-connected humanoid interface (fork of Niu-Humanoid APEX rebuild).

## Status koneksi

- Live site: https://zbmaus-humanoid.vercel.app (HTTP 200)
- Vercel project: `zbmaus-humanoid` (id `prj_PSOBqRFDAi6bbE0gsAgkIo11DRQ6`),
  terhubung ke repo ini (branch `main`), auto-deploy pada push.
- Chat panel (`/api/chat`) saat ini mem-proxy ke LLM (placeholder), **belum**
  terhubung langsung ke bot ZbmausHumanoid-Vercel di OMB.
  Lihat `AUDIT.md` untuk rencana integrasi (relay publik / token admin / embed).

## Setup

```bash
npm install
npm run dev
```

## Environment variables (Vercel)

Lihat `.env.example`.

- `LLM_ENDPOINT` — URL LLM (default OpenAI)
- `LLM_API_KEY` — API key LLM
- `LLM_MODEL` — nama model (default gpt-3.5-turbo)

## Deploy

Connected to Vercel. Pushes to `main` trigger automatic deploys.

## Chat API

The chat panel calls `/api/chat` which proxies to an OpenAI-compatible LLM endpoint.
Configure via Vercel environment variables (see `.env.example`).

## Audit

Laporan audit koneksi tersedia di `AUDIT.md`.

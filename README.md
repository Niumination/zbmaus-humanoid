# zbmaus-humanoid
zbmaus-humanoid: OMB-connected humanoid interface (fork of Niu-Humanoid APEX rebuild)

## Setup

```bash
npm install
npm run dev
```

## Deploy

Connected to Vercel. Pushes to `main` trigger automatic deploys.

## Chat API

The chat panel calls `/api/chat` which proxies to an OpenAI-compatible LLM endpoint.
Configure via Vercel environment variables:
- `LLM_ENDPOINT` — LLM API URL (default: OpenAI)
- `LLM_API_KEY` — API key for the LLM
- `LLM_MODEL` — Model name (default: gpt-3.5-turbo)

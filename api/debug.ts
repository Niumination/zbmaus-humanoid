export default async function handler(req: any, res: any) {
  const variants = [
    { name: 'plain' },
    { name: 'browserUA', headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36', 'Accept': 'application/json' } },
  ];
  const out: any = {};
  for (const v of variants) {
    try {
      const t = Date.now();
      const r = await fetch(process.env.OMB_RELAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OMB_WEBHOOK_BEARER}`, ...(v.headers || {}) },
        body: JSON.stringify({ message: 'debug ' + v.name, state: 'idle' }),
      });
      const text = await r.text();
      out[v.name] = { status: r.status, ms: Date.now() - t, snippet: text.slice(0, 120) };
    } catch (e: any) {
      out[v.name] = { error: String(e && e.cause ? e.cause : e) };
    }
  }
  return res.status(200).json(out);
}

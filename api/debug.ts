export default async function handler(req: any, res: any) {
  const results: any = {};
  const targets: Record<string,string> = {
    httpbin: 'https://httpbin.org/post',
    relay: process.env.OMB_RELAY_URL || 'unset',
    openai: 'https://api.openai.com/v1/models',
  };
  for (const [name, url] of Object.entries(targets)) {
    try {
      const t = Date.now();
      const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ping: 1 }) });
      results[name] = { status: r.status, ms: Date.now() - t };
    } catch (e: any) {
      results[name] = { error: String(e && e.cause ? e.cause : e) };
    }
  }
  res.status(200).json(results);
}

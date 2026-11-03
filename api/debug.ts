export default async function handler(req: any, res: any) {
  try {
    const t = Date.now();
    const r = await fetch(process.env.OMB_RELAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OMB_WEBHOOK_BEARER}` },
      body: JSON.stringify({ message: 'debug probe', state: 'idle' }),
    });
    const text = await r.text();
    return res.status(200).json({ status: r.status, ms: Date.now() - t, body: text.slice(0, 300) });
  } catch (e: any) {
    return res.status(200).json({ error: String(e && e.cause ? e.cause : e) });
  }
}

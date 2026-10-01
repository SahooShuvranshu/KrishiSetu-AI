// Vercel serverless function: Odisha mandi prices proxy.
//
// Why a proxy exists here at all: the Open Government Data platform
// (data.gov.in) requires an API key and does not reliably send CORS headers, so
// a direct browser call is a coin flip. Going through this function keeps the
// key server-side (it never enters the JS bundle), makes the request same-origin
// and lets Vercel edge-cache the result for 30 minutes - which keeps us well
// inside the free-tier rate limit no matter how many farmers open the app.
//
// In production the app calls /api/mandi. During `npm run dev` there is no
// serverless runtime, so the client falls back to calling data.gov.in directly
// with VITE_DATA_GOV_KEY.

const RESOURCE = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const DEFAULT_STATE = 'Odisha';
const TTL_SECONDS = 1800;
const UPSTREAM_TIMEOUT_MS = 8000;

export default async function handler(req, res) {
  const key = process.env.MANDI_API_KEY || process.env.VITE_DATA_GOV_KEY;

  if (!key) {
    res.status(501).json({
      error: 'MANDI_API_KEY is not set on the server',
      hint: 'Add MANDI_API_KEY in the Vercel project settings (see .env.example).'
    });
    return;
  }

  const state = String((req.query && req.query.state) || DEFAULT_STATE).slice(0, 40);
  const url = RESOURCE
    + '?api-key=' + encodeURIComponent(key)
    + '&format=json&limit=1000'
    + '&filters[state]=' + encodeURIComponent(state);

  try {
    const upstream = await fetch(url, { signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) });
    const body = await upstream.text();

    if (!upstream.ok) {
      // 403 here almost always means a missing/invalid key or a quota stop.
      res.status(upstream.status).json({
        error: 'upstream responded ' + upstream.status,
        detail: body.slice(0, 300)
      });
      return;
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=' + TTL_SECONDS + ', stale-while-revalidate=600');
    res.status(200).send(body);
  } catch (err) {
    res.status(504).json({ error: String((err && err.message) || err) });
  }
}

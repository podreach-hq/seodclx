export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();

    // ── URL FETCH MODE ──────────────────────────────
    // Called with { fetchUrl: 'https://...' }
    // Does a real server-side fetch, returns raw HTML/XML
    if (body.fetchUrl) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const fetchRes = await fetch(body.fetchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SEODiagnosticsBot/1.0)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Cache-Control': 'no-cache'
          },
          redirect: 'follow',
          signal: controller.signal
        });

        clearTimeout(timeout);
        const contentType = fetchRes.headers.get('content-type') || '';
        const text = await fetchRes.text();

        return new Response(JSON.stringify({
          ok: fetchRes.ok,
          status: fetchRes.status,
          contentType,
          body: text.slice(0, 150000)
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (fetchErr) {
        return new Response(JSON.stringify({
          ok: false,
          status: 0,
          error: fetchErr.message,
          body: ''
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    // ── CLAUDE API MODE ─────────────────────────────
    // Called with standard Anthropic messages payload
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

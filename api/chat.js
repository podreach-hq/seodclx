export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;

    // URL FETCH MODE
    if (body.fetchUrl) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const fetchRes = await fetch(body.fetchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SEODiagnosticsBot/1.0)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          redirect: 'follow',
          signal: controller.signal
        });
        clearTimeout(timeout);
        const text = await fetchRes.text();
        return res.status(200).json({
          ok: fetchRes.ok,
          status: fetchRes.status,
          contentType: fetchRes.headers.get('content-type') || '',
          body: text.slice(0, 150000)
        });
      } catch (fetchErr) {
        return res.status(200).json({ ok: false, status: 0, error: fetchErr.message, body: '' });
      }
    }

    // CLAUDE API MODE
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
    return res.status(response.status).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

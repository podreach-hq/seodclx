export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured in Vercel environment variables' });
  }

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-beta': 'web-search-2025-03-05'
  };

  try {
    let messages = req.body.messages || [];
    const tools = req.body.tools;
    const model = req.body.model || 'claude-sonnet-4-20250514';
    const max_tokens = req.body.max_tokens || 2000;

    // Run full multi-turn loop server-side â€” one round trip from browser
    for (let i = 0; i < 10; i++) {
      const body = { model, max_tokens, messages };
      if (tools) body.tools = tools;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      if (data.error) {
        return res.status(500).json(data);
      }

      if (data.stop_reason === 'tool_use') {
        messages.push({ role: 'assistant', content: data.content });

        const toolResults = data.content
          .filter(b => b.type === 'tool_use')
          .map(b => ({
            type: 'tool_result',
            tool_use_id: b.id,
            content: b.output || 'Search results processed.'
          }));

        messages.push({ role: 'user', content: toolResults });

      } else {
        // Done â€” return final text response to browser
        return res.status(200).json(data);
      }
    }

    return res.status(200).json({ error: 'Max search iterations reached' });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}


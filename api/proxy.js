export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Accept only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Read X-Target-Url header
  const targetUrl = req.headers['x-target-url'];
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing X-Target-Url header' });
  }

  try {
    // Forward all headers except host, content-length, x-target-url, accept-encoding
    const excludeHeaders = ['host', 'content-length', 'x-target-url', 'accept-encoding'];
    const forwardHeaders = {};

    for (const [key, value] of Object.entries(req.headers)) {
      if (!excludeHeaders.includes(key.toLowerCase())) {
        forwardHeaders[key] = value;
      }
    }

    let requestBody = req.body;
    if (typeof requestBody === 'object' && !Buffer.isBuffer(requestBody)) {
      requestBody = JSON.stringify(requestBody);
    }

    const upstreamResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: forwardHeaders,
      body: requestBody
    });

    res.status(upstreamResponse.status);

    const contentType = upstreamResponse.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    if (upstreamResponse.body) {
      const reader = upstreamResponse.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
      res.end();
    } else {
      const data = await upstreamResponse.text();
      res.send(data);
    }
  } catch (error) {
    console.error('Proxy error:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Proxy request failed',
        message: error.message
      });
    }
    res.end();
  }
}

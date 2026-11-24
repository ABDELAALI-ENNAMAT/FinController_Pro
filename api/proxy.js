
export default async function handler(req, res) {
  // Configuration
  const allowedOrigins = (
    process.env.PROXY_ALLOWED_ORIGINS || ""
  ).split(",").map(v => v.trim()).filter(Boolean);

  const allowedHosts = (
    process.env.PROXY_ALLOWED_HOSTS || ""
  ).split(",").map(v => v.trim().toLowerCase()).filter(Boolean);

  // CORS
  const origin = req.headers.origin;

  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: "Origin not allowed" });
  }

  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-API-Key"
  );

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // POST only
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed"
    });
  }

  // Target URL
  const targetUrl = req.headers["x-target-url"];

  if (!targetUrl) {
    return res.status(400).json({
      error: "Missing X-Target-Url header"
    });
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return res.status(400).json({
      error: "Invalid target URL"
    });
  }

  // HTTPS only, no embedded credentials
  if (
    parsedUrl.protocol !== "https:" ||
    parsedUrl.username ||
    parsedUrl.password
  ) {
    return res.status(403).json({
      error: "Invalid target URL"
    });
  }

  // Only trusted API domains
  if (!allowedHosts.includes(parsedUrl.hostname.toLowerCase())) {
    return res.status(403).json({
      error: "Target host not allowed"
    });
  }

  try {
    const forwardHeaders = {};

    // Forward only necessary headers
    const allowedHeaders = [
      "content-type",
      "accept",
      "authorization",
      "x-api-key"
    ];

    for (const header of allowedHeaders) {
      const value = req.headers[header];

      if (value) {
        forwardHeaders[header] = value;
      }
    }

    let requestBody = req.body;

    if (
      requestBody !== undefined &&
      typeof requestBody === "object" &&
      !Buffer.isBuffer(requestBody)
    ) {
      requestBody = JSON.stringify(requestBody);
    }

    const upstreamResponse = await fetch(parsedUrl.toString(), {
      method: "POST",
      headers: forwardHeaders,
      body: requestBody,
      redirect: "manual",
      signal: AbortSignal.timeout(15000)
    });

    // Do not follow external redirects
    if (upstreamResponse.status >= 300 &&
        upstreamResponse.status < 400) {
      return res.status(502).json({
        error: "Upstream redirect blocked"
      });
    }

    res.status(upstreamResponse.status);

    const contentType = upstreamResponse.headers.get("content-type");

    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }

    const responseBody = Buffer.from(
      await upstreamResponse.arrayBuffer()
    );

    return res.send(responseBody);

  } catch (error) {
    console.error("Proxy error:", error);

    return res.status(502).json({
      error: "Proxy request failed",
      message: "The upstream API could not be reached"
    });
  }
}


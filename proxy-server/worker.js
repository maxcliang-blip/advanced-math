// Cloudflare Worker Proxy - Single file version (no imports)
// Save as worker.js and deploy with: npx wrangler deploy worker.js

const HTML_START = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Proxy</title></head><body>`;
const HTML_END = `</body></html>`;

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Health check
  if (url.pathname === "/health" || url.pathname === "/") {
    return new Response(JSON.stringify({ status: "ok", usage: "/?url=https://example.com" }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  // Extract target URL
  const targetUrl = url.searchParams.get("url");
  
  if (!targetUrl) {
    return new Response(HTML_START + `<h1>Missing url parameter</h1><p>Usage: /?url=https://example.com</p>` + HTML_END, {
      status: 400,
      headers: { "Content-Type": "text/html" }
    });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,*/*",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const contentType = response.headers.get("content-type") || "";
    const headers = new Headers();

    // Copy headers, skipping security ones
    for (const [key, value] of response.headers) {
      const lower = key.toLowerCase();
      if (!["x-frame-options", "content-security-policy", "frame-options", "transfer-encoding", "x-xss-protection", "x-content-type-options", "permissions-policy"].includes(lower)) {
        headers.set(key, value);
      }
    }

    // Add bypass headers
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("X-Frame-Options", "ALLOWALL");
    headers.set("Permissions-Policy", "geolocation=*, microphone=*, camera=*");

    if (contentType.includes("text/html")) {
      let html = await response.text();
      
      // Add base tag
      const baseTag = `<base href="${targetUrl}" target="_blank">`;
      if (/<head/i.test(html)) {
        html = html.replace(/<head/i, "<head>" + baseTag);
      } else {
        html = baseTag + html;
      }
      
      headers.set("Content-Type", "text/html; charset=utf-8");
      return new Response(html, { headers });
    }

    return new Response(response.body, { headers });
  } catch (error) {
    return new Response(HTML_START + `<h1>Proxy Error</h1><p>${error.message}</p>` + HTML_END, {
      status: 502,
      headers: { "Content-Type": "text/html" }
    });
  }
}

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

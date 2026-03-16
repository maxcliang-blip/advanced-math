const express = require("express");
const cors = require("cors");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.text({ type: "*/*" }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Proxy endpoint
app.get("/", async (req, res) => {
  const targetUrl = req.query.url;
  
  if (!targetUrl) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Cloak Proxy</title></head>
      <body>
        <h1>Cloak Proxy Server</h1>
        <p>Usage: /?url=https://example.com</p>
      </body>
      </html>
    `);
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
    
    // Strip security headers
    const stripHeaders = [
      "x-frame-options",
      "content-security-policy",
      "frame-options",
      "transfer-encoding",
      "x-xss-protection",
      "x-content-type-options",
      "permissions-policy",
    ];

    for (const [key, value] of response.headers) {
      if (!stripHeaders.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    }

    // Add bypass headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("X-Frame-Options", "ALLOWALL");
    res.setHeader("Permissions-Policy", "geolocation=*, microphone=*, camera=*");

    if (contentType.includes("text/html")) {
      let html = await response.text();
      
      // Add base tag for relative links
      const baseTag = `<base href="${targetUrl}" target="_blank">`;
      if (/<head/i.test(html)) {
        html = html.replace(/<head/i, "<head>" + baseTag);
      } else {
        html = baseTag + html;
      }
      
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(html);
    }

    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", contentType);
    res.send(Buffer.from(buffer));
  } catch (error) {
    res.status(502).send(`Proxy Error: ${error.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
  console.log(`Usage: /?url=https://example.com`);
});

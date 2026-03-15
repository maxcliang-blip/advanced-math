import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

function cloakProxyPlugin(): Plugin {
  return {
    name: "cloak-proxy",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/cloak-proxy")) return next();

        const urlObj = new URL(req.url, "http://localhost");
        const targetUrl = urlObj.searchParams.get("url");

        if (!targetUrl) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Missing url parameter" }));
          return;
        }

        try {
          const proxyRes = await fetch(targetUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.9",
              "Accept-Encoding": "identity",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
            redirect: "follow",
          });

          const finalUrl = proxyRes.url || targetUrl;
          const contentType = proxyRes.headers.get("content-type") || "";

          // Headers to strip (iframe-blocking + encoding we can't forward as-is)
          const strip = new Set([
            "x-frame-options",
            "content-security-policy",
            "x-content-security-policy",
            "x-webkit-csp",
            "frame-options",
            "transfer-encoding",
            "content-encoding",
            "connection",
            "keep-alive",
          ]);

          for (const [key, val] of proxyRes.headers.entries()) {
            if (!strip.has(key.toLowerCase())) {
              try {
                res.setHeader(key, val);
              } catch {}
            }
          }
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("X-Cloak-Proxied-Url", finalUrl);

          if (contentType.includes("text/html")) {
            let html = await proxyRes.text();

            // Inject <base> tag so relative URLs resolve correctly
            const baseTag = `<base href="${finalUrl}">`;
            if (/<head[\s>]/i.test(html)) {
              html = html.replace(/(<head[^>]*>)/i, `$1${baseTag}`);
            } else {
              html = baseTag + html;
            }

            // Inject navigation interception script
            const injected = `<script data-cloak="1">(function(){
  var P='/cloak-proxy?url=';
  function abs(u,base){
    try{ return new URL(u, base||document.baseURI).href; }catch{ return u; }
  }
  function proxied(u){
    if(!u) return u;
    if(u.startsWith('javascript:')||u.startsWith('mailto:')||u.startsWith('tel:')) return u;
    if(u.startsWith('#')) return u;
    if(u.indexOf('/cloak-proxy')!==-1) return u;
    return P+encodeURIComponent(abs(u));
  }
  // Intercept link clicks
  document.addEventListener('click', function(e){
    var el=e.target;
    while(el && el.tagName!=='A') el=el.parentElement;
    if(!el||!el.href||el.target) return;
    var href=el.getAttribute('href')||'';
    if(href.startsWith('#')||href.startsWith('javascript:')) return;
    e.preventDefault(); e.stopPropagation();
    var absUrl=abs(el.href);
    window.parent.postMessage({type:'cloak-nav',url:absUrl},'*');
    location.href=P+encodeURIComponent(absUrl);
  }, true);
  // Intercept form submits
  document.addEventListener('submit', function(e){
    var f=e.target;
    if(f.action && f.action.indexOf('/cloak-proxy')===-1){
      f.action=proxied(f.action);
    }
  }, true);
  // Notify parent of current URL on load
  window.addEventListener('load', function(){
    window.parent.postMessage({type:'cloak-loaded',url:document.baseURI},'*');
  });
})();</script>`;

            if (/<\/head>/i.test(html)) {
              html = html.replace(/<\/head>/i, injected + "</head>");
            } else {
              html = html + injected;
            }

            res.statusCode = proxyRes.status;
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.end(html);
          } else {
            // Pass through binary/CSS/JS/images as-is
            const buf = await proxyRes.arrayBuffer();
            res.statusCode = proxyRes.status;
            res.end(Buffer.from(buf));
          }
        } catch (err: unknown) {
          res.statusCode = 502;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(`<!DOCTYPE html><html><head><meta charset="utf-8">
<style>body{font-family:monospace;background:#0f0f0f;color:#ff4444;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;gap:12px;padding:2rem;text-align:center;}h2{font-size:1.1rem;margin:0;}code{background:#1a1a1a;padding:4px 8px;border-radius:4px;font-size:.8rem;color:#aaa;word-break:break-all;}</style>
</head><body>
<h2>Proxy Error</h2>
<p style="color:#aaa;font-size:.85rem;max-width:500px">${String(err).replace(/</g,"&lt;")}</p>
<code>${targetUrl.replace(/</g,"&lt;")}</code>
<p style="font-size:.75rem;color:#666;margin-top:8px">The site may be blocking server-side requests, or the URL is unreachable.</p>
</body></html>`);
        }
      });
    },
  };
}

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5000,
    hmr: {
      overlay: false,
    },
    allowedHosts: true,
  },
  plugins: [react(), cloakProxyPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

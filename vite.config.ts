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
          const targetUrlObj = new URL(targetUrl);
          const proxyRes = await fetch(targetUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
              Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.9",
              "Accept-Encoding": "gzip, deflate",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
              Referer: targetUrlObj.origin + "/",
              Origin: targetUrlObj.origin,
              "Upgrade-Insecure-Requests": "1",
            },
            redirect: "follow",
          });

          const finalUrl = proxyRes.url || targetUrl;
          const finalUrlObj = new URL(finalUrl);
          const contentType = proxyRes.headers.get("content-type") || "";

          const strip = new Set([
            "x-frame-options",
            "content-security-policy",
            "content-security-policy-report-only",
            "x-content-security-policy",
            "x-webkit-csp",
            "frame-options",
            "transfer-encoding",
            "content-encoding",
            "connection",
            "keep-alive",
            "x-xss-protection",
            "x-content-type-options",
            "permissions-policy",
            "cross-origin-opener-policy",
            "cross-origin-resource-policy",
            "cross-origin-embedder-policy",
            "referrer-policy",
            "strict-transport-security",
          ]);

          for (const [key, val] of proxyRes.headers.entries()) {
            if (!strip.has(key.toLowerCase())) {
              try {
                res.setHeader(key, val);
              } catch { /* ignore header errors */ }
            }
          }
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
          res.setHeader("X-Cloak-Proxied-Url", finalUrl);
          res.setHeader("X-Frame-Options", "ALLOWALL");
          res.setHeader("Permissions-Policy", "geolocation=*, microphone=*, camera=*, payment=*, display-capture=*");
          res.setHeader("X-Content-Type-Options", "nosniff");

          if (contentType.includes("text/html")) {
            let html = await proxyRes.text();

            const baseTag = `<base href="${finalUrl}" target="_blank">`;
            if (/<head[\s>]/i.test(html)) {
              html = html.replace(/(<head[^>]*>)/i, `$1${baseTag}`);
            } else {
              html = baseTag + html;
            }

            html = html.replace(/<meta[^>]*http-equiv=["']refresh["'][^>]*>/gi, (match) => {
              const urlMatch = match.match(/url=["']([^"']+)/i);
              if (urlMatch) {
                const redirectUrl = urlMatch[1];
                return `<meta http-equiv="refresh" content="0;url=/cloak-proxy?url=${encodeURIComponent(redirectUrl)}">`;
              }
              return match;
            });

            html = html.replace(/<iframe[^>]*>/gi, (match) => {
              let modified = match;
              const srcMatch = match.match(/src=["']([^"']+)["']/i);
              if (srcMatch) {
                const originalSrc = srcMatch[1];
                if (!originalSrc.startsWith("javascript:") && !originalSrc.startsWith("data:")) {
                  const proxiedSrc = "/cloak-proxy?url=" + encodeURIComponent(new URL(originalSrc, finalUrl).href);
                  modified = modified.replace(/src=["'][^"']+["']/i, `src="${proxiedSrc}"`);
                }
              }
              modified = modified.replace(/\s+sandbox=["'][^"']*["']/i, "");
              return modified;
            });

            html = html.replace(/<object[^>]*>/gi, (match) => {
              let modified = match;
              const dataMatch = match.match(/data=["']([^"']+)["']/i);
              if (dataMatch) {
                const originalData = dataMatch[1];
                if (!originalData.startsWith("javascript:") && !originalData.startsWith("data:")) {
                  const proxiedData = "/cloak-proxy?url=" + encodeURIComponent(new URL(originalData, finalUrl).href);
                  modified = modified.replace(/data=["'][^"']+["']/i, `data="${proxiedData}"`);
                }
              }
              return modified;
            });

            html = html.replace(/<embed[^>]*>/gi, (match) => {
              let modified = match;
              const srcMatch = match.match(/src=["']([^"']+)["']/i);
              if (srcMatch) {
                const originalSrc = srcMatch[1];
                if (!originalSrc.startsWith("javascript:") && !originalSrc.startsWith("data:")) {
                  const proxiedSrc = "/cloak-proxy?url=" + encodeURIComponent(new URL(originalSrc, finalUrl).href);
                  modified = modified.replace(/src=["'][^"']+["']/i, `src="${proxiedSrc}"`);
                }
              }
              return modified;
            });

            html = html.replace(/(<img[^>]*srcset=["'])([^"']+)(["'][^>]*>)/gi, (match, prefix, srcset, suffix) => {
              const newSrcset = srcset.split(",").map((srcSetEntry: string) => {
                const parts = srcSetEntry.trim().split(/\s+/);
                if (parts.length >= 1) {
                  const src = parts[0];
                  if (!src.startsWith("data:") && !src.startsWith("javascript:")) {
                    try {
                      const absoluteSrc = new URL(src, finalUrl).href;
                      parts[0] = "/cloak-proxy?url=" + encodeURIComponent(absoluteSrc);
                    } catch { /* keep original */ }
                  }
                }
                return parts.join(" ");
              }).join(", ");
              return prefix + newSrcset + suffix;
            });

            html = html.replace(/(<source[^>]*src=["'])([^"']+)(["'][^>]*>)/gi, (match, prefix, src, suffix) => {
              if (!src.startsWith("data:") && !src.startsWith("javascript:")) {
                try {
                  const absoluteSrc = new URL(src, finalUrl).href;
                  return prefix + "/cloak-proxy?url=" + encodeURIComponent(absoluteSrc) + suffix;
                } catch { return match; }
              }
              return match;
            });

            html = html.replace(/(<link[^>]*rel=["'](?:stylesheet|preload|prefetch)["'][^>]*href=["'])([^"']+)(["'][^>]*>)/gi, (match, prefix, href, suffix) => {
              if (!href.startsWith("data:") && !href.startsWith("javascript:") && !href.startsWith("http")) {
                try {
                  const absoluteHref = new URL(href, finalUrl).href;
                  return prefix + "/cloak-proxy?url=" + encodeURIComponent(absoluteHref) + suffix;
                } catch { return match; }
              }
              return match;
            });

            const injected = `<script data-cloak="1">(function(){
  var P='/cloak-proxy?url=';
  var baseUrl='${finalUrl}';
  function abs(u,base){
    try{ return new URL(u, base||document.baseURI).href; }catch{ return u; }
  }
  function proxied(u){
    if(!u) return u;
    if(u.startsWith('javascript:')||u.startsWith('mailto:')||u.startsWith('tel:')||u.startsWith('data:')||u.startsWith('blob:')) return u;
    if(u.startsWith('#')) return u;
    if(u.indexOf('/cloak-proxy')!==-1) return u;
    return P+encodeURIComponent(abs(u));
  }
  document.addEventListener('click', function(e){
    var el=e.target;
    while(el && el.tagName!=='A') el=el.parentElement;
    if(!el||!el.href||el.target) return;
    var href=el.getAttribute('href')||'';
    if(href.startsWith('#')||href.startsWith('javascript:')||href.startsWith('mailto:')) return;
    e.preventDefault(); e.stopPropagation();
    var absUrl=abs(href);
    window.parent.postMessage({type:'cloak-nav',url:absUrl},'*');
    location.href=P+encodeURIComponent(absUrl);
  }, true);
  document.addEventListener('submit', function(e){
    var f=e.target;
    if(f.action && f.action.indexOf('/cloak-proxy')===-1){
      f.action=proxied(f.action);
    }
  }, true);
  document.addEventListener('auxclick', function(e){
    if(e.button===1){
      e.preventDefault();
      var t=e.target;
      while(t&&t.tagName!=='A') t=t.parentElement;
      if(t&&t.href){
        var absUrl=abs(t.href);
        window.parent.postMessage({type:'cloak-nav',url:absUrl},'*');
        window.open(P+encodeURIComponent(absUrl),'_blank');
      }
    }
  }, true);
  var originalOpen=window.open;
  window.open=function(url,name,features){
    if(url&&typeof url==='string'&&!url.startsWith('javascript:')&&url.indexOf('/cloak-proxy')===-1){
      return originalOpen(P+encodeURIComponent(abs(url)),name,features);
    }
    return originalOpen.apply(this,arguments);
  };
  window.addEventListener('load', function(){
    window.parent.postMessage({type:'cloak-loaded',url:document.baseURI},'*');
  });
  if(typeof MutationObserver!=='undefined'){
    new MutationObserver(function(mutations){
      mutations.forEach(function(m){
        m.addedNodes.forEach(function(n){
          if(n.nodeType===1){
            var iframes=n.querySelectorAll('iframe,object,embed');
            iframes.forEach(function(f){
              var src=f.getAttribute('src');
              if(src&&src.indexOf('/cloak-proxy')===-1&&!src.startsWith('javascript:')&&!src.startsWith('data:')){
                f.setAttribute('src',proxied(src));
              }
            });
          }
        });
      });
    }).observe(document.documentElement,{childList:true,subtree:true});
  }
})();</script>`;

            if (/<\/head>/i.test(html)) {
              html = html.replace(/<\/head>/i, injected + "</head>");
            } else {
              html = html + injected;
            }

            res.statusCode = proxyRes.status;
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.end(html);
          } else if (contentType.includes("text/css")) {
            let css = await proxyRes.text();
            css = css.replace(/url\(["']?([^"')]+)["']?\)/gi, (match, url) => {
              if (url.startsWith("data:") || url.startsWith("http") || url.startsWith("//")) {
                if (url.startsWith("//")) {
                  url = finalUrlObj.protocol + url;
                }
                if (url.startsWith("http")) {
                  return `url("/cloak-proxy?url=${encodeURIComponent(url)}")`;
                }
              }
              try {
                const absoluteUrl = new URL(url, finalUrl).href;
                return `url("/cloak-proxy?url=${encodeURIComponent(absoluteUrl)}")`;
              } catch { return match; }
            });
            css = css.replace(/@import\s+["']([^"']+)["']/gi, (match, url) => {
              try {
                const absoluteUrl = new URL(url, finalUrl).href;
                return "@import \"/cloak-proxy?url=" + encodeURIComponent(absoluteUrl) + "\"";
              } catch { return match; }
            });
            res.statusCode = proxyRes.status;
            res.setHeader("Content-Type", "text/css; charset=utf-8");
            res.end(css);
          } else if (contentType.includes("javascript") || contentType.includes("application/json")) {
            const buf = await proxyRes.arrayBuffer();
            res.statusCode = proxyRes.status;
            res.setHeader("Content-Type", "application/javascript; charset=utf-8");
            res.end(Buffer.from(buf));
          } else {
            const buf = await proxyRes.arrayBuffer();
            res.statusCode = proxyRes.status;
            res.end(Buffer.from(buf));
          }
        } catch (err: unknown) {
          res.statusCode = 502;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          const errMsg = err instanceof Error ? err.message : String(err);
          res.end("<!DOCTYPE html><html><head><meta charset=\"utf-8\">\n" +
            "<style>body{font-family:monospace;background:#0f0f0f;color:#ff4444;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;gap:12px;padding:2rem;text-align:center;}h2{font-size:1.1rem;margin:0;}code{background:#1a1a1a;padding:4px 8px;border-radius:4px;font-size:.8rem;color:#aaa;word-break:break-all;}</style>\n" +
            "</head><body>\n" +
            "<h2>Proxy Error</h2>\n" +
            '<p style="color:#aaa;font-size:.85rem;max-width:500px">' + errMsg.replace(/</g,"&lt;") + "</p>\n" +
            "<code>" + targetUrl.replace(/</g,"&lt;") + "</code>\n" +
            '<p style="font-size:.75rem;color:#666;margin-top:8px">The site may be blocking server-side requests, or the URL is unreachable.</p>\n' +
            "</body></html>");
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

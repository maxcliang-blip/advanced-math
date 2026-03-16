import { useState, useEffect, useCallback } from "react";
import PasswordGate from "@/components/PasswordGate";
import CloakDashboard from "@/components/CloakDashboard";
import Fake404 from "@/components/Fake404";
import FakeGoogle from "@/components/FakeGoogle";
import FakeYouTube from "@/components/FakeYouTube";
import FakeGoogleDocs from "@/components/FakeGoogleDocs";
import BossKeyOverlay from "@/components/BossKeyOverlay";
import { loadProfile, type UserProfile } from "@/lib/profile";
import {
  loadSecuritySettings,
  type SecuritySettings,
  enableDevToolsBlock,
  disableDevToolsBlock,
  enableRightClickDisable,
  disableRightClickDisable,
  enableTabVisibilityLock,
  disableTabVisibilityLock,
  enablePanicOnDevToolsDetection,
  disablePanicOnDevToolsDetection,
  enableMouseLeaveLock,
  disableMouseLeaveLock,
  cancelMouseLeaveLock,
  enableWindowBlurLock,
  disableWindowBlurLock,
  enablePrintDisable,
  disablePrintDisable,
  enableTextSelectionDisable,
  disableTextSelectionDisable,
  enableIframeDetection,
  disableIframeDetection,
  enableScreenRecordingDetection,
  disableScreenRecordingDetection,
  enableReferrerControl,
  disableReferrerControl,
  enableCanvasProtection,
  disableCanvasProtection,
  scrambleHistory,
  wipeClipboard,
  addAuditEntry,
} from "@/lib/security";

type AppState = "gate" | "locked" | "unlocked" | "panic" | "decoy";

const Index = () => {
  const [state, setState] = useState<AppState>("gate");
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(loadSecuritySettings);
  const [bossKeyActive, setBossKeyActive] = useState(false);

  const handlePanic = useCallback(() => {
    const p = loadProfile();
    const s = loadSecuritySettings();
    setState("panic");
    addAuditEntry("panic", "Panic triggered");
    // Wipe clipboard on panic
    wipeClipboard();

    // Scramble history so back-button doesn't expose CLOAK
    if (s.historyScramble) scrambleHistory();

    if (p.panicDestination === "custom" && p.panicCustomUrl) {
      window.location.href = p.panicCustomUrl;
      return;
    }

    // Update tab title/icon based on destination
    const titles: Record<string, string> = {
      "404": "This page isn't working",
      google: "Google",
      youtube: "YouTube",
      docs: "Untitled document - Google Docs",
    };
    const icons: Record<string, string> = {
      "404": "",
      google: "https://www.google.com/favicon.ico",
      youtube: "https://www.youtube.com/favicon.ico",
      docs: "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico",
    };

    document.title = titles[p.panicDestination] ?? "This page isn't working";
    const link =
      (document.querySelector("link[rel~='icon']") as HTMLLinkElement) ||
      document.createElement("link");
    link.rel = "icon";
    link.href = icons[p.panicDestination] ?? "";
    document.head.appendChild(link);
  }, []);

  // Apply / remove security features based on state & settings
  useEffect(() => {
    if (state !== "unlocked") {
      disableDevToolsBlock();
      disableRightClickDisable();
      disableTabVisibilityLock();
      disablePanicOnDevToolsDetection();
      disableMouseLeaveLock();
      disableWindowBlurLock();
      disablePrintDisable();
      disableTextSelectionDisable();
      disableIframeDetection();
      return;
    }

    if (securitySettings.blockDevTools)        enableDevToolsBlock();        else disableDevToolsBlock();
    if (securitySettings.disableRightClick)    enableRightClickDisable();    else disableRightClickDisable();
    if (securitySettings.lockOnTabSwitch)      enableTabVisibilityLock(() => { addAuditEntry("tab_switch_lock"); setState("locked"); }); else disableTabVisibilityLock();
    if (securitySettings.enablePanicOnDevTools) enablePanicOnDevToolsDetection(() => { addAuditEntry("devtools_detected"); handlePanic(); }); else disablePanicOnDevToolsDetection();
    if (securitySettings.mouseLeaveLock)       enableMouseLeaveLock(() => { addAuditEntry("mouse_leave_lock"); setState("locked"); }); else disableMouseLeaveLock();
    if (securitySettings.windowBlurLock)       enableWindowBlurLock(() => { addAuditEntry("window_blur_lock"); setState("locked"); }); else disableWindowBlurLock();
    if (securitySettings.disablePrinting)      enablePrintDisable();         else disablePrintDisable();
    if (securitySettings.disableTextSelection) enableTextSelectionDisable(); else disableTextSelectionDisable();
    if (securitySettings.iframeDetection)      enableIframeDetection(handlePanic); else disableIframeDetection();
    if (securitySettings.enableScreenRecordingDetection) enableScreenRecordingDetection(handlePanic); else disableScreenRecordingDetection();
    if (securitySettings.referrerControl !== "none") enableReferrerControl(securitySettings.referrerControl as "strip" | "origin"); else disableReferrerControl();
    if (securitySettings.enableCanvasProtection) enableCanvasProtection(); else disableCanvasProtection();

    return () => {
      disableDevToolsBlock();
      disableRightClickDisable();
      disableTabVisibilityLock();
      disablePanicOnDevToolsDetection();
      disableMouseLeaveLock();
      disableWindowBlurLock();
      disablePrintDisable();
      disableTextSelectionDisable();
      disableIframeDetection();
      disableScreenRecordingDetection();
      disableReferrerControl();
      disableCanvasProtection();
    };
  }, [state, securitySettings, handlePanic]);

  // Cancel mouse-leave lock timer when mouse re-enters
  useEffect(() => {
    if (state !== "unlocked" || !securitySettings.mouseLeaveLock) return;
    const cancel = () => cancelMouseLeaveLock();
    document.addEventListener("mouseenter", cancel);
    return () => document.removeEventListener("mouseenter", cancel);
  }, [state, securitySettings.mouseLeaveLock]);

  // Auto-cloak inactivity timer
  useEffect(() => {
    if (state !== "unlocked" || profile.autoCloakMinutes <= 0) return;
    let timer: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(handlePanic, profile.autoCloakMinutes * 60 * 1000);
    };
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [state, profile.autoCloakMinutes, handlePanic]);

  // Global keyboard handlers: panic key + boss key + stealth mode
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Panic key
      if (e.key === profile.panicKey || (profile.panicKey === "~" && e.key === "`")) {
        if (state === "unlocked") {
          handlePanic();
        } else if (state === "panic") {
          setState("gate");
        }
      }
      // Boss key: Alt+B (toggle overlay)
      if (e.altKey && e.key.toLowerCase() === "b" && state === "unlocked") {
        e.preventDefault();
        setBossKeyActive((prev) => !prev);
      }
      // Stealth mode hotkey
      if (e.altKey && securitySettings.stealthModeEnabled && e.key.toLowerCase() === securitySettings.stealthModeKey && state === "unlocked") {
        e.preventDefault();
        addAuditEntry("stealth_triggered");
        handlePanic();
        try {
          window.blur();
          const destUrls = {
            "404": "https://httpbin.org/status/404",
            google: "https://www.google.com",
            youtube: "https://www.youtube.com",
            docs: "https://docs.google.com",
            custom: profile.panicCustomUrl || "https://httpbin.org/status/404",
          };
          const dest = destUrls[profile.panicDestination] || destUrls["404"];
          if (profile.useProxyMode) {
            const w = window.open("about:blank", "_self");
            if (w) {
              w.document.write(`<!DOCTYPE html><html><head>
                <script>
                  (function(){
                    var P='/cloak-proxy?url=';
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
                  })();
                </script>
              </head><body></body></html>`);
              w.document.close();
              w.location.href = "/cloak-proxy?url=" + encodeURIComponent(dest);
            }
          } else {
            window.location.href = dest;
          }
        } catch { /* best effort */ }
      }
      // Escape dismisses boss key
      if (e.key === "Escape" && bossKeyActive) {
        setBossKeyActive(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [state, profile.panicKey, profile.useProxyMode, profile.panicDestination, profile.panicCustomUrl, bossKeyActive, handlePanic, securitySettings.stealthModeEnabled, securitySettings.stealthModeKey]);

  // Render panic destination
  const renderPanic = () => {
    const dest = profile.panicDestination;
    if (dest === "google")  return <FakeGoogle onReveal={() => setState("gate")} />;
    if (dest === "youtube") return <FakeYouTube onReveal={() => setState("gate")} />;
    if (dest === "docs")    return <FakeGoogleDocs onReveal={() => setState("gate")} />;
    return <Fake404 onReveal={() => setState("gate")} />;
  };

  if (state === "panic") return renderPanic();
  if (state === "gate")   return <Fake404 onReveal={() => setState("locked")} />;
  if (state === "decoy")  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground text-sm font-mono">Nothing here.</p>
    </div>
  );
  if (state === "locked") return (
    <PasswordGate
      onUnlock={() => { addAuditEntry("unlock", "Password or pattern unlock"); setState("unlocked"); }}
      onDecoy={() => { addAuditEntry("decoy_used"); setState("decoy"); }}
    />
  );

  return (
    <>
      <CloakDashboard
        onPanic={handlePanic}
        onLogout={() => setState("gate")}
        onProfileChange={(p) => setProfile(p)}
        onSecurityChange={(s) => setSecuritySettings(s)}
      />
      {bossKeyActive && (
        <BossKeyOverlay
          style={profile.bossKeyStyle}
          customUrl={profile.bossKeyCustomUrl}
          onDismiss={() => setBossKeyActive(false)}
        />
      )}
    </>
  );
};

export default Index;

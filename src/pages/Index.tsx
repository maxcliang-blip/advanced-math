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
  scrambleHistory,
  wipeClipboard,
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
    if (securitySettings.lockOnTabSwitch)      enableTabVisibilityLock(() => setState("locked")); else disableTabVisibilityLock();
    if (securitySettings.enablePanicOnDevTools) enablePanicOnDevToolsDetection(handlePanic); else disablePanicOnDevToolsDetection();
    if (securitySettings.mouseLeaveLock)       enableMouseLeaveLock(() => setState("locked")); else disableMouseLeaveLock();
    if (securitySettings.windowBlurLock)       enableWindowBlurLock(() => setState("locked")); else disableWindowBlurLock();
    if (securitySettings.disablePrinting)      enablePrintDisable();         else disablePrintDisable();
    if (securitySettings.disableTextSelection) enableTextSelectionDisable(); else disableTextSelectionDisable();
    if (securitySettings.iframeDetection)      enableIframeDetection(handlePanic); else disableIframeDetection();

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

  // Global keyboard handlers: panic key + boss key
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
      // Escape dismisses boss key
      if (e.key === "Escape" && bossKeyActive) {
        setBossKeyActive(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [state, profile.panicKey, bossKeyActive, handlePanic]);

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
      onUnlock={() => setState("unlocked")}
      onDecoy={() => setState("decoy")}
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

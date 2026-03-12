import { useState, useEffect, useCallback } from "react";
import PasswordGate from "@/components/PasswordGate";
import CloakDashboard from "@/components/CloakDashboard";
import Fake404 from "@/components/Fake404";
import { loadProfile } from "@/lib/profile";
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
} from "@/lib/security";

type AppState = "gate" | "locked" | "unlocked" | "panic" | "decoy";

const Index = () => {
  const [state, setState] = useState<AppState>("gate");
  const [panicKey, setPanicKey] = useState(() => loadProfile().panicKey);
  const [autoCloakMinutes, setAutoCloakMinutes] = useState(() => loadProfile().autoCloakMinutes);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(loadSecuritySettings);

  const handlePanic = useCallback(() => {
    setState("panic");
    document.title = "This page isn't working";
    const link =
      (document.querySelector("link[rel~='icon']") as HTMLLinkElement) ||
      document.createElement("link");
    link.rel = "icon";
    link.href = "";
    document.head.appendChild(link);
  }, []);

  // Apply / remove security features whenever settings or state change
  useEffect(() => {
    if (state !== "unlocked") {
      disableDevToolsBlock();
      disableRightClickDisable();
      disableTabVisibilityLock();
      disablePanicOnDevToolsDetection();
      return;
    }

    if (securitySettings.blockDevTools) {
      enableDevToolsBlock();
    } else {
      disableDevToolsBlock();
    }

    if (securitySettings.disableRightClick) {
      enableRightClickDisable();
    } else {
      disableRightClickDisable();
    }

    if (securitySettings.lockOnTabSwitch) {
      enableTabVisibilityLock(() => setState("locked"));
    } else {
      disableTabVisibilityLock();
    }

    if (securitySettings.enablePanicOnDevTools) {
      enablePanicOnDevToolsDetection(handlePanic);
    } else {
      disablePanicOnDevToolsDetection();
    }

    return () => {
      disableDevToolsBlock();
      disableRightClickDisable();
      disableTabVisibilityLock();
      disablePanicOnDevToolsDetection();
    };
  }, [state, securitySettings, handlePanic]);

  // Auto-cloak inactivity timer
  useEffect(() => {
    if (state !== "unlocked" || autoCloakMinutes <= 0) return;

    let timer: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(handlePanic, autoCloakMinutes * 60 * 1000);
    };

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [state, autoCloakMinutes, handlePanic]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === panicKey || (panicKey === "~" && e.key === "`")) {
        if (state === "unlocked") {
          handlePanic();
        } else if (state === "panic") {
          setState("gate");
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [state, handlePanic, panicKey]);

  if (state === "panic") return <Fake404 />;
  if (state === "gate") return <Fake404 onReveal={() => setState("locked")} />;
  if (state === "decoy") return (
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
    <CloakDashboard
      onPanic={handlePanic}
      onLogout={() => setState("gate")}
      onProfileChange={(p) => {
        setPanicKey(p.panicKey);
        setAutoCloakMinutes(p.autoCloakMinutes);
      }}
      onSecurityChange={(s) => setSecuritySettings(s)}
    />
  );
};

export default Index;

import { useState, useEffect, useCallback } from "react";
import PasswordGate from "@/components/PasswordGate";
import CloakDashboard from "@/components/CloakDashboard";
import Fake404 from "@/components/Fake404";
import { loadProfile } from "@/lib/profile";

const Index = () => {
  const [state, setState] = useState<"gate" | "locked" | "unlocked" | "panic">("gate");
  const [panicKey, setPanicKey] = useState(() => loadProfile().panicKey);

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
  if (state === "locked") return <PasswordGate onUnlock={() => setState("unlocked")} />;
  return (
    <CloakDashboard
      onPanic={handlePanic}
      onLogout={() => setState("gate")}
      onProfileChange={(p) => setPanicKey(p.panicKey)}
    />
  );
};

export default Index;

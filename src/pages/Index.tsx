import { useState, useEffect, useCallback } from "react";
import PasswordGate from "@/components/PasswordGate";
import CloakDashboard from "@/components/CloakDashboard";
import Fake404 from "@/components/Fake404";

const Index = () => {
  const [state, setState] = useState<"locked" | "unlocked" | "panic">("locked");

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
      if (e.key === "`" || e.key === "~") {
        if (state === "unlocked") {
          handlePanic();
        } else if (state === "panic") {
          setState("locked");
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [state, handlePanic]);

  if (state === "panic") return <Fake404 />;
  if (state === "locked") return <PasswordGate onUnlock={() => setState("unlocked")} />;
  return (
    <CloakDashboard
      onPanic={handlePanic}
      onLogout={() => setState("locked")}
    />
  );
};

export default Index;

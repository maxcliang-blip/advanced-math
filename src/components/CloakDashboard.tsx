import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EyeOff,
  ExternalLink,
  Shield,
  AlertTriangle,
  Trash2,
  Settings,
  Clock,
  X,
} from "lucide-react";

interface CloakDashboardProps {
  onPanic: () => void;
  onLogout: () => void;
}

const CloakDashboard = ({ onPanic, onLogout }: CloakDashboardProps) => {
  const [url, setUrl] = useState("");
  const [tabTitle, setTabTitle] = useState("Google");
  const [tabIcon, setTabIcon] = useState("https://www.google.com/favicon.ico");

  const openCloaked = () => {
    if (!url) return;
    const target = url.startsWith("http") ? url : `https://${url}`;
    const win = window.open("about:blank", "_blank");
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${tabTitle}</title>
          <link rel="icon" href="${tabIcon}">
          <style>
            * { margin: 0; padding: 0; }
            body { overflow: hidden; }
            iframe { width: 100vw; height: 100vh; border: none; }
          </style>
        </head>
        <body>
          <iframe src="${target}" sandbox="allow-same-origin allow-scripts allow-forms allow-popups"></iframe>
        </body>
        </html>
      `);
      win.document.close();
    }
  };

  const cloakCurrentTab = () => {
    document.title = tabTitle;
    const link =
      (document.querySelector("link[rel~='icon']") as HTMLLinkElement) ||
      document.createElement("link");
    link.rel = "icon";
    link.href = tabIcon;
    document.head.appendChild(link);
  };

  const resetPassword = () => {
    if (confirm("Reset password? You'll need to set a new one.")) {
      localStorage.removeItem("cloak_pw_hash");
      onLogout();
    }
  };

  const presets = [
    { name: "Google", title: "Google", icon: "https://www.google.com/favicon.ico" },
    { name: "Google Docs", title: "Google Docs", icon: "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico" },
    { name: "Canvas", title: "Dashboard", icon: "https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico" },
    { name: "Wikipedia", title: "Wikipedia", icon: "https://en.wikipedia.org/static/favicon/wikipedia.ico" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background scanline">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary glow-text" />
          <h1 className="text-xl font-display font-bold text-primary glow-text">
            CLOAK
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onPanic}
            variant="destructive"
            size="sm"
            className="gap-2 font-mono text-xs"
          >
            <AlertTriangle className="h-4 w-4" />
            PANIC
          </Button>
          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="gap-2 font-mono text-xs border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <EyeOff className="h-4 w-4" />
            LOCK
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-8">
        {/* Cloak URL */}
        <section className="space-y-4">
          <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <ExternalLink className="h-4 w-4" /> Open in Cloaked Tab
          </h2>
          <div className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
              onKeyDown={(e) => e.key === "Enter" && openCloaked()}
            />
            <Button
              onClick={openCloaked}
              className="bg-primary text-primary-foreground hover:bg-primary/80 glow-box font-mono"
            >
              CLOAK
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Opens URL inside an about:blank tab with a disguised title & icon
          </p>
        </section>

        {/* Tab Disguise */}
        <section className="space-y-4">
          <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Settings className="h-4 w-4" /> Tab Disguise
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Tab Title</label>
              <Input
                value={tabTitle}
                onChange={(e) => setTabTitle(e.target.value)}
                className="bg-secondary border-border text-foreground focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Favicon URL</label>
              <Input
                value={tabIcon}
                onChange={(e) => setTabIcon(e.target.value)}
                className="bg-secondary border-border text-foreground focus:border-primary"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <Button
                key={p.name}
                variant="outline"
                size="sm"
                onClick={() => {
                  setTabTitle(p.title);
                  setTabIcon(p.icon);
                }}
                className="text-xs font-mono border-border text-muted-foreground hover:text-foreground hover:border-primary hover:bg-secondary"
              >
                {p.name}
              </Button>
            ))}
          </div>

          <Button
            onClick={cloakCurrentTab}
            variant="outline"
            className="w-full border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary font-mono text-sm"
          >
            Apply Disguise to This Tab
          </Button>
        </section>

        {/* Settings */}
        <section className="space-y-4 border-t border-border pt-6">
          <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Trash2 className="h-4 w-4" /> Settings
          </h2>
          <Button
            onClick={resetPassword}
            variant="outline"
            size="sm"
            className="text-xs font-mono border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            Reset Password
          </Button>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-3 text-center">
        <p className="text-xs text-muted-foreground font-mono">
          Press <kbd className="px-1.5 py-0.5 bg-secondary rounded text-foreground">~</kbd> for panic mode
        </p>
      </footer>
    </div>
  );
};

export default CloakDashboard;

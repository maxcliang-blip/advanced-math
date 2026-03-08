import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProfileSection from "@/components/ProfileSection";
import { loadProfile, type UserProfile } from "@/lib/profile";
import {
  EyeOff,
  ExternalLink,
  Shield,
  AlertTriangle,
  Trash2,
  Settings,
  Clock,
  X,
  Bookmark,
  BookmarkPlus,
  Pencil,
  Check,
} from "lucide-react";

interface CloakDashboardProps {
  onPanic: () => void;
  onLogout: () => void;
  onProfileChange?: (profile: UserProfile) => void;
}

const CloakDashboard = ({ onPanic, onLogout, onProfileChange }: CloakDashboardProps) => {
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [url, setUrl] = useState("");
  const [tabTitle, setTabTitle] = useState("Google");
  const [tabIcon, setTabIcon] = useState("https://www.google.com/favicon.ico");
  const [history, setHistory] = useState<{ url: string; title: string; time: number }[]>(() => {
    try { return JSON.parse(localStorage.getItem("cloak_history") || "[]"); } catch { return []; }
  });
  const [bookmarks, setBookmarks] = useState<{ url: string; label: string; disguise: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem("cloak_bookmarks") || "[]"); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem("cloak_history", JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem("cloak_bookmarks", JSON.stringify(bookmarks)); }, [bookmarks]);

  const addToHistory = (target: string) => {
    setHistory((prev) => [
      { url: target, title: tabTitle, time: Date.now() },
      ...prev.filter((h) => h.url !== target),
    ].slice(0, 20));
  };
  const removeFromHistory = (url: string) => setHistory((prev) => prev.filter((h) => h.url !== url));
  const clearHistory = () => setHistory([]);

  const addBookmark = () => {
    if (!url) return;
    const target = url.startsWith("http") ? url : `https://${url}`;
    if (bookmarks.some((b) => b.url === target)) return;
    setBookmarks((prev) => [...prev, { url: target, label: target.replace(/^https?:\/\//, "").split("/")[0], disguise: tabTitle }]);
  };
  const removeBookmark = (bookmarkUrl: string) => setBookmarks((prev) => prev.filter((b) => b.url !== bookmarkUrl));
  const renameBookmark = (bookmarkUrl: string, newLabel: string) => {
    setBookmarks((prev) => prev.map((b) => b.url === bookmarkUrl ? { ...b, label: newLabel } : b));
  };
  const [editingBookmark, setEditingBookmark] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");

  const openCloaked = () => {
    if (!url) return;
    const target = url.startsWith("http") ? url : `https://${url}`;
    addToHistory(target);
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
          <span className="text-xs font-mono text-muted-foreground ml-2">
            Welcome, {profile.displayName}
          </span>
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
            <Button
              onClick={addBookmark}
              variant="outline"
              size="icon"
              className="border-border text-muted-foreground hover:text-primary hover:border-primary"
              title="Bookmark this URL"
            >
              <BookmarkPlus className="h-4 w-4" />
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

        {/* History */}
        {history.length > 0 && (
          <section className="space-y-4 border-t border-border pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Clock className="h-4 w-4" /> Recent History
              </h2>
              <Button
                onClick={clearHistory}
                variant="ghost"
                size="sm"
                className="text-xs font-mono text-muted-foreground hover:text-destructive"
              >
                Clear All
              </Button>
            </div>
            <div className="space-y-1">
              {history.map((h) => (
                <div
                  key={h.url + h.time}
                  className="flex items-center gap-2 group rounded px-2 py-1.5 hover:bg-secondary"
                >
                  <button
                    onClick={() => { setUrl(h.url); }}
                    className="flex-1 text-left text-sm font-mono text-foreground truncate hover:text-primary transition-colors"
                  >
                    {h.url}
                  </button>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(h.time).toLocaleDateString()}
                  </span>
                  <Button
                    onClick={() => removeFromHistory(h.url)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bookmarks */}
        {bookmarks.length > 0 && (
          <section className="space-y-4 border-t border-border pt-6">
            <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Bookmark className="h-4 w-4" /> Bookmarks
            </h2>
            <div className="flex flex-wrap gap-2">
              {bookmarks.map((b) => (
                <div key={b.url} className="group flex items-center gap-1 bg-secondary rounded px-3 py-1.5 border border-border hover:border-primary transition-colors">
                  {editingBookmark === b.url ? (
                    <form
                      className="flex items-center gap-1"
                      onSubmit={(e) => {
                        e.preventDefault();
                        renameBookmark(b.url, editLabel || b.label);
                        setEditingBookmark(null);
                      }}
                    >
                      <Input
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="h-6 w-32 text-xs font-mono bg-background border-primary px-1"
                        autoFocus
                        onBlur={() => {
                          renameBookmark(b.url, editLabel || b.label);
                          setEditingBookmark(null);
                        }}
                      />
                      <Button type="submit" variant="ghost" size="sm" className="h-5 w-5 p-0 text-primary">
                        <Check className="h-3 w-3" />
                      </Button>
                    </form>
                  ) : (
                    <>
                      <button
                        onClick={() => setUrl(b.url)}
                        className="text-sm font-mono text-foreground hover:text-primary transition-colors truncate max-w-[200px]"
                      >
                        {b.label}
                      </button>
                      <Button
                        onClick={() => { setEditingBookmark(b.url); setEditLabel(b.label); }}
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => removeBookmark(b.url)}
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

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

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ProfileSection from "@/components/ProfileSection";
import { loadProfile, type UserProfile } from "@/lib/profile";
import { themes, loadTheme, applyTheme } from "@/lib/themes";
import { tabPresets, applyCloakPreset, loadActiveCloak, clearCloak, type TabPreset } from "@/lib/tabCloak";
import StopwatchTimer from "@/components/StopwatchTimer";
import UnitConverter from "@/components/UnitConverter";
import EquationSolver from "@/components/EquationSolver";
import { useDraggable } from "@/hooks/use-draggable";
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
  Globe,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Maximize2,
  Minimize2,
  Palette,
  FolderPlus,
  Folder,
  Eye,
  EyeOff as EyeOffIcon,
  ShieldCheck,
  Search,
  Ban,
  Plus,
  FileText,
  Lock,
  History,
  ChevronDown,
} from "lucide-react";

interface CloakDashboardProps {
  onPanic: () => void;
  onLogout: () => void;
  onProfileChange?: (profile: UserProfile) => void;
}

interface BookmarkItem {
  url: string;
  label: string;
  folder: string;
}

interface PanicEvent {
  time: number;
  reason: string;
}

const SEARCH_ENGINES: Record<string, { label: string; url: (q: string) => string }> = {
  google: { label: "Google", url: (q) => `https://www.google.com/search?igu=1&q=${encodeURIComponent(q)}` },
  duckduckgo: { label: "DuckDuckGo", url: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}` },
  bing: { label: "Bing", url: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}` },
  yahoo: { label: "Yahoo", url: (q) => `https://search.yahoo.com/search?p=${encodeURIComponent(q)}` },
};

// Simple XOR obfuscation for notes (not true encryption, but hides plaintext)
function obfuscate(text: string, key: string): string {
  if (!key) return text;
  const result = [];
  for (let i = 0; i < text.length; i++) {
    result.push(String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length)));
  }
  return btoa(result.join(""));
}

function deobfuscate(encoded: string, key: string): string {
  if (!key) return encoded;
  try {
    const decoded = atob(encoded);
    const result = [];
    for (let i = 0; i < decoded.length; i++) {
      result.push(String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)));
    }
    return result.join("");
  } catch {
    return "";
  }
}

const CloakDashboard = ({ onPanic, onLogout, onProfileChange }: CloakDashboardProps) => {
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [url, setUrl] = useState("");
  const [tabTitle, setTabTitle] = useState("Google");
  const [tabIcon, setTabIcon] = useState("https://www.google.com/favicon.ico");
  const [history, setHistory] = useState<{ url: string; title: string; time: number }[]>(() => {
    try { return JSON.parse(localStorage.getItem("cloak_history") || "[]"); } catch { return []; }
  });

  // Bookmarks with folders
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try { return JSON.parse(localStorage.getItem("cloak_bookmarks_v2") || "[]"); } catch { return []; }
  });
  const [bookmarkFolders, setBookmarkFolders] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("cloak_bm_folders") || '["General"]'); } catch { return ["General"]; }
  });
  const [activeFolder, setActiveFolder] = useState("General");
  const [newFolderName, setNewFolderName] = useState("");
  const [addingFolder, setAddingFolder] = useState(false);

  // Theme
  const [currentTheme, setCurrentTheme] = useState(loadTheme);

  // Incognito mode
  const [incognito, setIncognito] = useState(() => localStorage.getItem("cloak_incognito") === "true");

  // Tab cloaking
  const [activeCloak, setActiveCloak] = useState<TabPreset | null>(loadActiveCloak);

  // Proxy browser state
  const [proxyUrl, setProxyUrl] = useState("");
  const [proxyInput, setProxyInput] = useState("");
  const [proxyActive, setProxyActive] = useState(false);
  const [proxyFullscreen, setProxyFullscreen] = useState(false);
  const [proxyHistory, setProxyHistory] = useState<string[]>([]);
  const [proxyHistoryIndex, setProxyHistoryIndex] = useState(-1);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [editingBookmark, setEditingBookmark] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");

  // === NEW FEATURES ===

  // Search engine selector
  const [searchEngine, setSearchEngine] = useState<string>(() => localStorage.getItem("cloak_search_engine") || "google");
  const [showEngineDropdown, setShowEngineDropdown] = useState(false);

  // Site blocker
  const [blockedSites, setBlockedSites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("cloak_blocked_sites") || "[]"); } catch { return []; }
  });
  const [newBlockedSite, setNewBlockedSite] = useState("");

  // Panic history log
  const [panicLog, setPanicLog] = useState<PanicEvent[]>(() => {
    try { return JSON.parse(localStorage.getItem("cloak_panic_log") || "[]"); } catch { return []; }
  });

  // Notes/Scratchpad
  const [notes, setNotes] = useState("");
  const [notesKey, setNotesKey] = useState("");
  const [notesUnlocked, setNotesUnlocked] = useState(false);
  const [notesKeyInput, setNotesKeyInput] = useState("");

  // Keyboard shortcuts
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Calculator
  const [showCalc, setShowCalc] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcPrev, setCalcPrev] = useState<number | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);
  const [calcReset, setCalcReset] = useState(false);
  const [calcMode, setCalcMode] = useState<"basic" | "sci">("basic");
  const [calcMemory, setCalcMemory] = useState(0);
  const [calcHistory, setCalcHistory] = useState<string[]>([]);
  const [showCalcHistory, setShowCalcHistory] = useState(false);
  const [calcDeg, setCalcDeg] = useState(true); // true=degrees, false=radians

  // New tools
  const [showStopwatch, setShowStopwatch] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [showSolver, setShowSolver] = useState(false);

  // Draggable calculator
  const calcDrag = useDraggable({ initialX: typeof window !== "undefined" ? window.innerWidth - 280 : 600, initialY: typeof window !== "undefined" ? window.innerHeight - 500 : 300 });

  const calcInput = (val: string) => {
    if (calcReset || calcDisplay === "0") {
      setCalcDisplay(val);
      setCalcReset(false);
    } else {
      setCalcDisplay(calcDisplay + val);
    }
  };
  const calcDecimal = () => {
    if (calcReset) { setCalcDisplay("0."); setCalcReset(false); return; }
    if (!calcDisplay.includes(".")) setCalcDisplay(calcDisplay + ".");
  };
  const calcOperator = (op: string) => {
    const current = parseFloat(calcDisplay);
    if (calcPrev !== null && calcOp && !calcReset) {
      const result = calcCompute(calcPrev, current, calcOp);
      setCalcDisplay(String(result));
      setCalcPrev(result);
    } else {
      setCalcPrev(current);
    }
    setCalcOp(op);
    setCalcReset(true);
  };
  const calcCompute = (a: number, b: number, op: string): number => {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "×": return a * b;
      case "÷": return b !== 0 ? a / b : 0;
      case "xʸ": return Math.pow(a, b);
      default: return b;
    }
  };
  const calcEquals = () => {
    if (calcPrev === null || !calcOp) return;
    const current = parseFloat(calcDisplay);
    const result = calcCompute(calcPrev, current, calcOp);
    const rounded = parseFloat(result.toFixed(10));
    const expr = `${calcPrev} ${calcOp} ${current} = ${rounded}`;
    setCalcHistory((prev) => [expr, ...prev].slice(0, 20));
    setCalcDisplay(String(rounded));
    setCalcPrev(null);
    setCalcOp(null);
    setCalcReset(true);
  };
  const calcClear = () => {
    setCalcDisplay("0");
    setCalcPrev(null);
    setCalcOp(null);
    setCalcReset(false);
  };
  const calcBackspace = () => {
    if (calcReset) return;
    setCalcDisplay((prev) => prev.length > 1 ? prev.slice(0, -1) : "0");
  };
  const toAngle = (v: number) => calcDeg ? (v * Math.PI) / 180 : v;
  const calcSci = (fn: string) => {
    const v = parseFloat(calcDisplay);
    let result: number;
    switch (fn) {
      case "sin": result = Math.sin(toAngle(v)); break;
      case "cos": result = Math.cos(toAngle(v)); break;
      case "tan": result = Math.tan(toAngle(v)); break;
      case "√": result = Math.sqrt(v); break;
      case "x²": result = v * v; break;
      case "x³": result = v * v * v; break;
      case "log": result = Math.log10(v); break;
      case "ln": result = Math.log(v); break;
      case "1/x": result = v !== 0 ? 1 / v : 0; break;
      case "|x|": result = Math.abs(v); break;
      case "e": result = Math.E; break;
      case "π": result = Math.PI; break;
      case "n!": result = v < 0 || v > 170 || v % 1 !== 0 ? NaN : Array.from({ length: v }, (_, i) => i + 1).reduce((a, b) => a * b, 1); break;
      default: result = v;
    }
    setCalcDisplay(String(parseFloat(result.toFixed(10))));
    setCalcReset(true);
  };

  // Apply theme on load
  useEffect(() => { applyTheme(currentTheme); }, []);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      // Ignore if typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      // Alt+I — toggle incognito
      if (e.altKey && e.key.toLowerCase() === "i") {
        e.preventDefault();
        setIncognito((prev) => !prev);
      }
      // Alt+N — toggle notes
      if (e.altKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        if (notesUnlocked) {
          lockNotes();
        } else {
          // Focus the notes section by scrolling to it
          document.getElementById("notes-section")?.scrollIntoView({ behavior: "smooth" });
        }
      }
      // Alt+T — cycle theme
      if (e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        const idx = themes.findIndex((t) => t.name === currentTheme);
        const next = themes[(idx + 1) % themes.length];
        handleThemeChange(next.name);
      }
      // Alt+P — panic
      if (e.altKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        handlePanicWithLog();
      }
      // Alt+L — lock
      if (e.altKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        onLogout();
      }
      // Alt+F — toggle fullscreen proxy
      if (e.altKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        if (proxyActive) setProxyFullscreen((prev) => !prev);
      }
      // Alt+/ or Alt+? — show shortcuts help
      if (e.altKey && (e.key === "/" || e.key === "?")) {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }
      // Alt+C — toggle calculator
      if (e.altKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        setShowCalc((prev) => !prev);
      }
      // Alt+S — toggle stopwatch/timer
      if (e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setShowStopwatch((prev) => !prev);
      }
      // Alt+U — toggle unit converter
      if (e.altKey && e.key.toLowerCase() === "u") {
        e.preventDefault();
        setShowConverter((prev) => !prev);
      }
      // Alt+E — toggle equation solver
      if (e.altKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setShowSolver((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [currentTheme, notesUnlocked, proxyActive]);


  // Apply tab cloak on load
  useEffect(() => {
    if (activeCloak) applyCloakPreset(activeCloak);
  }, []);

  // Incognito: clear on unload
  useEffect(() => {
    if (!incognito) return;
    const handleUnload = () => {
      localStorage.removeItem("cloak_history");
      localStorage.removeItem("cloak_bookmarks_v2");
      localStorage.removeItem("cloak_bm_folders");
      clearCloak();
      setHistory([]);
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [incognito]);

  useEffect(() => { if (!incognito) localStorage.setItem("cloak_history", JSON.stringify(history)); }, [history, incognito]);
  useEffect(() => { if (!incognito) localStorage.setItem("cloak_bookmarks_v2", JSON.stringify(bookmarks)); }, [bookmarks, incognito]);
  useEffect(() => { if (!incognito) localStorage.setItem("cloak_bm_folders", JSON.stringify(bookmarkFolders)); }, [bookmarkFolders, incognito]);
  useEffect(() => { localStorage.setItem("cloak_incognito", String(incognito)); }, [incognito]);

  // Persist new feature states
  useEffect(() => { localStorage.setItem("cloak_search_engine", searchEngine); }, [searchEngine]);
  useEffect(() => { localStorage.setItem("cloak_blocked_sites", JSON.stringify(blockedSites)); }, [blockedSites]);
  useEffect(() => { if (!incognito) localStorage.setItem("cloak_panic_log", JSON.stringify(panicLog)); }, [panicLog, incognito]);

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
    setBookmarks((prev) => [...prev, { url: target, label: target.replace(/^https?:\/\//, "").split("/")[0], folder: activeFolder }]);
  };
  const removeBookmark = (bookmarkUrl: string) => setBookmarks((prev) => prev.filter((b) => b.url !== bookmarkUrl));
  const renameBookmark = (bookmarkUrl: string, newLabel: string) => {
    setBookmarks((prev) => prev.map((b) => b.url === bookmarkUrl ? { ...b, label: newLabel } : b));
  };
  const addFolder = () => {
    if (!newFolderName || bookmarkFolders.includes(newFolderName)) return;
    setBookmarkFolders((prev) => [...prev, newFolderName]);
    setActiveFolder(newFolderName);
    setNewFolderName("");
    setAddingFolder(false);
  };
  const removeFolder = (folder: string) => {
    if (folder === "General") return;
    setBookmarks((prev) => prev.map((b) => b.folder === folder ? { ...b, folder: "General" } : b));
    setBookmarkFolders((prev) => prev.filter((f) => f !== folder));
    if (activeFolder === folder) setActiveFolder("General");
  };

  // Check if URL is blocked
  const isBlocked = (targetUrl: string): boolean => {
    const hostname = targetUrl.replace(/^https?:\/\//, "").split("/")[0].toLowerCase();
    return blockedSites.some((site) => hostname.includes(site.toLowerCase()));
  };

  const navigateProxy = (inputUrl?: string) => {
    const raw = inputUrl || proxyInput;
    if (!raw) return;
    let target = raw;
    if (!target.startsWith("http")) {
      if (target.includes(".") && !target.includes(" ")) {
        target = `https://${target}`;
      } else {
        target = SEARCH_ENGINES[searchEngine].url(target);
      }
    }

    // Check site blocker
    if (isBlocked(target)) {
      alert(`🚫 This site is blocked: ${target.replace(/^https?:\/\//, "").split("/")[0]}`);
      return;
    }

    setProxyUrl(target);
    setProxyInput(target);
    setProxyActive(true);
    addToHistory(target);
    setProxyHistory((prev) => {
      const newHistory = [...prev.slice(0, proxyHistoryIndex + 1), target];
      setProxyHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  };

  const proxyGoBack = () => {
    if (proxyHistoryIndex > 0) {
      const newIndex = proxyHistoryIndex - 1;
      setProxyHistoryIndex(newIndex);
      setProxyUrl(proxyHistory[newIndex]);
      setProxyInput(proxyHistory[newIndex]);
    }
  };

  const proxyGoForward = () => {
    if (proxyHistoryIndex < proxyHistory.length - 1) {
      const newIndex = proxyHistoryIndex + 1;
      setProxyHistoryIndex(newIndex);
      setProxyUrl(proxyHistory[newIndex]);
      setProxyInput(proxyHistory[newIndex]);
    }
  };

  const proxyRefresh = () => {
    if (iframeRef.current && proxyUrl) {
      iframeRef.current.src = proxyUrl;
    }
  };

  const openCloaked = () => {
    if (!url) return;
    const target = url.startsWith("http") ? url : `https://${url}`;

    if (isBlocked(target)) {
      alert(`🚫 This site is blocked: ${target.replace(/^https?:\/\//, "").split("/")[0]}`);
      return;
    }

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
    const preset: TabPreset = { name: "Custom", title: tabTitle, icon: tabIcon };
    applyCloakPreset(preset);
    setActiveCloak(preset);
  };

  const handleThemeChange = (name: string) => {
    applyTheme(name);
    setCurrentTheme(name);
  };

  const resetPassword = () => {
    if (confirm("Reset password? You'll need to set a new one.")) {
      localStorage.removeItem("cloak_pw_hash");
      onLogout();
    }
  };

  // Enhanced panic with logging
  const handlePanicWithLog = () => {
    setPanicLog((prev) => [
      { time: Date.now(), reason: "Manual trigger" },
      ...prev,
    ].slice(0, 50));
    onPanic();
  };

  // Notes functions
  const unlockNotes = () => {
    const storedNotes = localStorage.getItem("cloak_notes");
    if (storedNotes) {
      setNotes(deobfuscate(storedNotes, notesKeyInput));
    } else {
      setNotes("");
    }
    setNotesKey(notesKeyInput);
    setNotesUnlocked(true);
    setNotesKeyInput("");
  };

  const saveNotes = () => {
    const encoded = obfuscate(notes, notesKey);
    localStorage.setItem("cloak_notes", encoded);
  };

  const lockNotes = () => {
    saveNotes();
    setNotes("");
    setNotesKey("");
    setNotesUnlocked(false);
  };

  // Add blocked site
  const addBlockedSite = () => {
    const site = newBlockedSite.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
    if (!site || blockedSites.includes(site)) return;
    setBlockedSites((prev) => [...prev, site]);
    setNewBlockedSite("");
  };

  // Fullscreen proxy view
  if (proxyFullscreen && proxyActive) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-secondary">
          <Button onClick={proxyGoBack} variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" disabled={proxyHistoryIndex <= 0}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button onClick={proxyGoForward} variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" disabled={proxyHistoryIndex >= proxyHistory.length - 1}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button onClick={proxyRefresh} variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
            <RotateCw className="h-4 w-4" />
          </Button>
          <form onSubmit={(e) => { e.preventDefault(); navigateProxy(); }} className="flex-1">
            <Input
              value={proxyInput}
              onChange={(e) => setProxyInput(e.target.value)}
              className="h-8 bg-background border-border text-foreground text-sm font-mono focus:border-primary"
              placeholder="Enter URL or search..."
            />
          </form>
          <Button onClick={() => setProxyFullscreen(false)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button onClick={handlePanicWithLog} variant="destructive" size="sm" className="h-8 text-xs font-mono gap-1">
            <AlertTriangle className="h-3 w-3" /> PANIC
          </Button>
        </div>
        <iframe
          ref={iframeRef}
          src={proxyUrl}
          className="flex-1 w-full border-none"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          title="Proxy Browser"
        />
      </div>
    );
  }

  const filteredBookmarks = bookmarks.filter((b) => b.folder === activeFolder);

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
          {incognito && (
            <span className="text-xs font-mono text-destructive flex items-center gap-1 ml-2">
              <ShieldCheck className="h-3 w-3" /> INCOGNITO
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIncognito(!incognito)}
            variant="outline"
            size="sm"
            className={`gap-1 font-mono text-xs border-border ${incognito ? "text-destructive border-destructive/50" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
            title={incognito ? "Incognito ON — data cleared on exit" : "Enable incognito mode"}
          >
            {incognito ? <EyeOffIcon className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            INCOG
          </Button>
          <Button
            onClick={handlePanicWithLog}
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
        {/* Proxy Browser */}
        <section className="space-y-4">
          <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Globe className="h-4 w-4" /> Proxy Browser
          </h2>
          <div className="flex gap-2">
            <div className="flex items-center gap-1">
              <Button onClick={proxyGoBack} variant="ghost" size="sm" className="h-10 w-8 p-0 text-muted-foreground hover:text-foreground" disabled={proxyHistoryIndex <= 0}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button onClick={proxyGoForward} variant="ghost" size="sm" className="h-10 w-8 p-0 text-muted-foreground hover:text-foreground" disabled={proxyHistoryIndex >= proxyHistory.length - 1}>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button onClick={proxyRefresh} variant="ghost" size="sm" className="h-10 w-8 p-0 text-muted-foreground hover:text-foreground" disabled={!proxyActive}>
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Search engine selector */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-2 border-border text-muted-foreground hover:text-foreground hover:border-primary font-mono text-xs gap-1"
                onClick={() => setShowEngineDropdown(!showEngineDropdown)}
              >
                <Search className="h-3 w-3" />
                {SEARCH_ENGINES[searchEngine].label}
                <ChevronDown className="h-3 w-3" />
              </Button>
              {showEngineDropdown && (
                <div className="absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-md shadow-lg py-1 min-w-[140px]">
                  {Object.entries(SEARCH_ENGINES).map(([key, engine]) => (
                    <button
                      key={key}
                      onClick={() => { setSearchEngine(key); setShowEngineDropdown(false); }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors ${
                        searchEngine === key ? "text-primary bg-secondary" : "text-foreground hover:bg-secondary hover:text-primary"
                      }`}
                    >
                      {engine.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Input
              value={proxyInput}
              onChange={(e) => setProxyInput(e.target.value)}
              placeholder={`Search with ${SEARCH_ENGINES[searchEngine].label} or enter URL...`}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary font-mono text-sm"
              onKeyDown={(e) => e.key === "Enter" && navigateProxy()}
            />
            <Button
              onClick={() => navigateProxy()}
              className="bg-primary text-primary-foreground hover:bg-primary/80 glow-box font-mono"
            >
              GO
            </Button>
            {proxyActive && (
              <Button
                onClick={() => setProxyFullscreen(true)}
                variant="outline"
                size="icon"
                className="border-border text-muted-foreground hover:text-primary hover:border-primary"
                title="Fullscreen"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {proxyActive && (
            <div className="rounded-lg border border-border overflow-hidden bg-background">
              <iframe
                ref={iframeRef}
                src={proxyUrl}
                className="w-full border-none"
                style={{ height: "60vh" }}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                title="Proxy Browser"
              />
            </div>
          )}

          {!proxyActive && (
            <div className="rounded-lg border border-border bg-secondary/30 flex flex-col items-center justify-center py-16 text-center space-y-3">
              <Globe className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground font-mono">
                Enter a URL or search term above to browse
              </p>
              <p className="text-xs text-muted-foreground/60">
                Note: Some sites may block iframe embedding
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {[
              { label: "Google", url: "https://www.google.com/webhp?igu=1" },
              { label: "Wikipedia", url: "https://en.wikipedia.org" },
              { label: "Reddit", url: "https://old.reddit.com" },
              { label: "DuckDuckGo", url: "https://duckduckgo.com" },
            ].map((site) => (
              <Button
                key={site.label}
                variant="outline"
                size="sm"
                onClick={() => { setProxyInput(site.url); navigateProxy(site.url); }}
                className="text-xs font-mono border-border text-muted-foreground hover:text-foreground hover:border-primary hover:bg-secondary"
              >
                {site.label}
              </Button>
            ))}
          </div>
        </section>

        {/* Site Blocker */}
        <section className="space-y-4 border-t border-border pt-6">
          <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Ban className="h-4 w-4" /> Site Blocker
          </h2>
          <p className="text-xs text-muted-foreground">
            Block distracting sites — they won't load in the proxy browser or cloaked tabs.
          </p>
          <div className="flex gap-2">
            <Input
              value={newBlockedSite}
              onChange={(e) => setNewBlockedSite(e.target.value)}
              placeholder="e.g. tiktok.com, instagram.com"
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary font-mono text-sm"
              onKeyDown={(e) => e.key === "Enter" && addBlockedSite()}
            />
            <Button
              onClick={addBlockedSite}
              variant="outline"
              size="sm"
              className="border-border text-muted-foreground hover:text-primary hover:border-primary font-mono"
            >
              <Plus className="h-4 w-4 mr-1" /> Block
            </Button>
          </div>
          {blockedSites.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blockedSites.map((site) => (
                <div
                  key={site}
                  className="flex items-center gap-1.5 bg-destructive/10 border border-destructive/30 rounded px-2.5 py-1 text-xs font-mono text-destructive"
                >
                  <Ban className="h-3 w-3" />
                  {site}
                  <button
                    onClick={() => setBlockedSites((prev) => prev.filter((s) => s !== site))}
                    className="hover:text-foreground ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Cloak URL */}
        <section className="space-y-4 border-t border-border pt-6">
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

        {/* Tab Cloaking */}
        <section className="space-y-4 border-t border-border pt-6">
          <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Settings className="h-4 w-4" /> Tab Cloaking
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

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Quick Presets</label>
            <div className="flex flex-wrap gap-2">
              {tabPresets.map((p) => (
                <Button
                  key={p.name}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTabTitle(p.title);
                    setTabIcon(p.icon);
                    applyCloakPreset(p);
                    setActiveCloak(p);
                  }}
                  className={`text-xs font-mono border-border hover:border-primary hover:bg-secondary ${
                    activeCloak?.name === p.name ? "text-primary border-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={cloakCurrentTab}
              variant="outline"
              className="flex-1 border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary font-mono text-sm"
            >
              Apply Custom Disguise
            </Button>
            {activeCloak && (
              <Button
                onClick={() => { clearCloak(); setActiveCloak(null); document.title = "CLOAK"; }}
                variant="outline"
                size="sm"
                className="text-xs font-mono border-border text-muted-foreground hover:text-destructive hover:border-destructive"
              >
                <X className="h-3 w-3 mr-1" /> Clear
              </Button>
            )}
          </div>
          {activeCloak && (
            <p className="text-xs text-primary font-mono">Active: {activeCloak.title}</p>
          )}
        </section>

        {/* Notes / Scratchpad */}
        <section id="notes-section" className="space-y-4 border-t border-border pt-6">
          <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <FileText className="h-4 w-4" /> Encrypted Notes
          </h2>

          {!notesUnlocked ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Enter a passphrase to unlock your encrypted scratchpad. Your notes are obfuscated with this key.
              </p>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={notesKeyInput}
                  onChange={(e) => setNotesKeyInput(e.target.value)}
                  placeholder="Enter passphrase..."
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary font-mono text-sm"
                  onKeyDown={(e) => e.key === "Enter" && unlockNotes()}
                />
                <Button
                  onClick={unlockNotes}
                  variant="outline"
                  className="border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary font-mono text-sm gap-1"
                >
                  <Lock className="h-3 w-3" /> Unlock
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write your private notes here..."
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary font-mono text-sm min-h-[150px] resize-y"
              />
              <div className="flex gap-2">
                <Button
                  onClick={saveNotes}
                  variant="outline"
                  className="border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary font-mono text-sm gap-1"
                >
                  <Check className="h-3 w-3" /> Save
                </Button>
                <Button
                  onClick={lockNotes}
                  variant="outline"
                  className="border-border text-muted-foreground hover:text-foreground hover:bg-secondary font-mono text-sm gap-1"
                >
                  <Lock className="h-3 w-3" /> Lock
                </Button>
                <Button
                  onClick={() => {
                    if (confirm("Delete all notes permanently?")) {
                      setNotes("");
                      localStorage.removeItem("cloak_notes");
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="text-xs font-mono border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                </Button>
              </div>
              <p className="text-xs text-primary/60 font-mono">
                🔒 Notes are encrypted with your passphrase
              </p>
            </div>
          )}
        </section>

        {/* Themes */}
        <section className="space-y-4 border-t border-border pt-6">
          <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Palette className="h-4 w-4" /> Themes
          </h2>
          <div className="flex flex-wrap gap-2">
            {themes.map((t) => (
              <Button
                key={t.name}
                variant="outline"
                size="sm"
                onClick={() => handleThemeChange(t.name)}
                className={`text-xs font-mono border-border hover:border-primary hover:bg-secondary ${
                  currentTheme === t.name ? "text-primary border-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className="inline-block w-3 h-3 rounded-full mr-1.5 border border-border"
                  style={{ backgroundColor: `hsl(${t.vars["--primary"]})` }}
                />
                {t.label}
              </Button>
            ))}
          </div>
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
                    onClick={() => { setProxyInput(h.url); navigateProxy(h.url); }}
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

        {/* Panic History Log */}
        <section className="space-y-4 border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <History className="h-4 w-4" /> Panic Log
            </h2>
            {panicLog.length > 0 && (
              <Button
                onClick={() => setPanicLog([])}
                variant="ghost"
                size="sm"
                className="text-xs font-mono text-muted-foreground hover:text-destructive"
              >
                Clear Log
              </Button>
            )}
          </div>
          {panicLog.length > 0 ? (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {panicLog.map((event, i) => (
                <div
                  key={event.time + i}
                  className="flex items-center gap-3 rounded px-2 py-1.5 hover:bg-secondary text-xs font-mono"
                >
                  <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                  <span className="text-foreground">{event.reason}</span>
                  <span className="text-muted-foreground ml-auto whitespace-nowrap">
                    {new Date(event.time).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground font-mono">No panic events recorded yet.</p>
          )}
        </section>

        {/* Bookmarks with Folders */}
        <section className="space-y-4 border-t border-border pt-6">
          <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Bookmark className="h-4 w-4" /> Bookmarks
          </h2>

          {/* Folder tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {bookmarkFolders.map((folder) => (
              <div key={folder} className="group flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveFolder(folder)}
                  className={`text-xs font-mono border-border hover:border-primary ${
                    activeFolder === folder ? "text-primary border-primary bg-secondary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Folder className="h-3 w-3 mr-1" />
                  {folder}
                  {folder !== "General" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFolder(folder); }}
                      className="ml-1 opacity-0 group-hover:opacity-100 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Button>
              </div>
            ))}
            {addingFolder ? (
              <form onSubmit={(e) => { e.preventDefault(); addFolder(); }} className="flex items-center gap-1">
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="h-8 w-28 text-xs font-mono bg-secondary border-primary px-2"
                  placeholder="Folder name"
                  autoFocus
                  onBlur={() => { if (!newFolderName) setAddingFolder(false); }}
                />
                <Button type="submit" variant="ghost" size="sm" className="h-7 w-7 p-0 text-primary">
                  <Check className="h-3 w-3" />
                </Button>
              </form>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAddingFolder(true)}
                className="h-8 text-xs text-muted-foreground hover:text-primary"
              >
                <FolderPlus className="h-3 w-3 mr-1" /> Add Folder
              </Button>
            )}
          </div>

          {/* Bookmarks in active folder */}
          {filteredBookmarks.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {filteredBookmarks.map((b) => (
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
                        onClick={() => { setProxyInput(b.url); navigateProxy(b.url); }}
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
          ) : (
            <p className="text-xs text-muted-foreground font-mono">No bookmarks in "{activeFolder}" — use the <BookmarkPlus className="inline h-3 w-3" /> button to add one</p>
          )}
        </section>

        {/* Profile */}
        <ProfileSection
          onProfileChange={(p) => {
            setProfile(p);
            onProfileChange?.(p);
          }}
        />

        {/* Settings */}
        <section className="space-y-4 border-t border-border pt-6">
          <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Trash2 className="h-4 w-4" /> Settings
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={resetPassword}
              variant="outline"
              size="sm"
              className="text-xs font-mono border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              Reset Password
            </Button>
            <Button
              onClick={() => {
                clearHistory();
                setBookmarks([]);
                clearCloak();
                setActiveCloak(null);
                setBlockedSites([]);
                setPanicLog([]);
                localStorage.removeItem("cloak_history");
                localStorage.removeItem("cloak_bookmarks_v2");
                localStorage.removeItem("cloak_blocked_sites");
                localStorage.removeItem("cloak_panic_log");
                localStorage.removeItem("cloak_notes");
              }}
              variant="outline"
              size="sm"
              className="text-xs font-mono border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              Wipe All Data
            </Button>
          </div>
        </section>
      </main>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowShortcuts(false)}>
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-mono text-primary uppercase tracking-widest">Keyboard Shortcuts</h3>
              <Button onClick={() => setShowShortcuts(false)} variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 text-sm font-mono">
              {[
                ["Alt + I", "Toggle incognito mode"],
                ["Alt + N", "Toggle notes (lock/scroll)"],
                ["Alt + T", "Cycle theme"],
                ["Alt + P", "Panic mode"],
                ["Alt + L", "Lock dashboard"],
                ["Alt + F", "Toggle fullscreen proxy"],
                ["Alt + /", "Show/hide this help"],
                ["Alt + C", "Toggle calculator"],
                [profile.panicKey === " " ? "Space" : profile.panicKey, "Panic key (global)"],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                  <kbd className="px-2 py-0.5 bg-secondary rounded text-primary text-xs">{key}</kbd>
                  <span className="text-muted-foreground text-xs">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Calculator Modal */}
      {showCalc && (
        <div className="fixed bottom-20 right-6 z-50 bg-card border border-border rounded-lg shadow-lg" style={{ boxShadow: "var(--glow)", width: calcMode === "sci" ? "320px" : "256px" }}>
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-primary uppercase tracking-widest">Calc</span>
              <button onClick={() => setCalcMode(calcMode === "basic" ? "sci" : "basic")} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                {calcMode === "basic" ? "SCI" : "BASIC"}
              </button>
              {calcMode === "sci" && (
                <button onClick={() => setCalcDeg(!calcDeg)} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                  {calcDeg ? "DEG" : "RAD"}
                </button>
              )}
              <button onClick={() => setShowCalcHistory(!showCalcHistory)} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                <History className="h-3 w-3" />
              </button>
            </div>
            <Button onClick={() => setShowCalc(false)} variant="ghost" size="sm" className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* History dropdown */}
          {showCalcHistory && calcHistory.length > 0 && (
            <div className="max-h-24 overflow-y-auto border-b border-border px-3 py-1.5">
              {calcHistory.map((h, i) => (
                <div key={i} className="text-[10px] font-mono text-muted-foreground py-0.5 truncate">{h}</div>
              ))}
            </div>
          )}

          <div className="p-3">
            {/* Display */}
            <div className="bg-secondary rounded px-3 py-2 mb-3 text-right">
              {calcOp && <span className="text-[10px] text-muted-foreground block">{calcPrev} {calcOp}</span>}
              <span className="text-lg font-mono text-foreground truncate block">{calcDisplay}</span>
            </div>

            {/* Memory row */}
            <div className="flex gap-1 mb-2">
              {[
                { label: "MC", action: () => setCalcMemory(0) },
                { label: "MR", action: () => { setCalcDisplay(String(calcMemory)); setCalcReset(true); } },
                { label: "M+", action: () => setCalcMemory((m) => m + parseFloat(calcDisplay)) },
                { label: "M-", action: () => setCalcMemory((m) => m - parseFloat(calcDisplay)) },
              ].map(({ label, action }) => (
                <button key={label} onClick={action} className={`flex-1 text-[10px] font-mono py-1 rounded hover:bg-secondary/80 transition-colors ${calcMemory !== 0 && label === "MR" ? "text-primary" : "text-muted-foreground"}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Scientific functions */}
            {calcMode === "sci" && (
              <div className="grid grid-cols-5 gap-1 mb-2">
                {["sin", "cos", "tan", "π", "e", "√", "x²", "x³", "xʸ", "n!", "log", "ln", "1/x", "|x|", "⌫"].map((fn) => (
                  <Button
                    key={fn}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] font-mono text-muted-foreground hover:text-primary px-1"
                    onClick={() => {
                      if (fn === "xʸ") calcOperator("xʸ");
                      else if (fn === "⌫") calcBackspace();
                      else calcSci(fn);
                    }}
                  >
                    {fn}
                  </Button>
                ))}
              </div>
            )}

            {/* Standard buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                "C", calcMode === "basic" ? "±" : "⌫", "%", "÷",
                "7", "8", "9", "×",
                "4", "5", "6", "-",
                "1", "2", "3", "+",
                "0", ".", "="
              ].map((btn) => {
                const isOp = ["÷", "×", "-", "+"].includes(btn);
                const isEquals = btn === "=";
                const isZero = btn === "0";
                const isUtil = ["C", "±", "%", "⌫"].includes(btn);
                return (
                  <Button
                    key={btn}
                    variant={isEquals ? "default" : isOp ? "outline" : "ghost"}
                    size="sm"
                    className={`h-9 font-mono text-sm ${isZero ? "col-span-2" : ""} ${isOp ? "text-primary border-primary/30" : ""} ${isUtil ? "text-muted-foreground" : ""} ${isEquals ? "bg-primary text-primary-foreground" : ""}`}
                    onClick={() => {
                      if (btn === "C") calcClear();
                      else if (btn === "±") setCalcDisplay(String(-parseFloat(calcDisplay)));
                      else if (btn === "⌫") calcBackspace();
                      else if (btn === "%") setCalcDisplay(String(parseFloat(calcDisplay) / 100));
                      else if (btn === ".") calcDecimal();
                      else if (btn === "=") calcEquals();
                      else if (isOp) calcOperator(btn);
                      else calcInput(btn);
                    }}
                  >
                    {btn}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-border px-6 py-3 text-center">
        <p className="text-xs text-muted-foreground font-mono">
          Press <kbd className="px-1.5 py-0.5 bg-secondary rounded text-foreground">{profile.panicKey === " " ? "Space" : profile.panicKey}</kbd> for panic mode
          · <button onClick={() => setShowShortcuts(true)} className="underline hover:text-foreground transition-colors">Alt+/ for shortcuts</button>
          {incognito && " · Incognito active — data will be cleared on exit"}
        </p>
      </footer>
    </div>
  );
};

export default CloakDashboard;

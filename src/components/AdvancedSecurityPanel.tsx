import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Network, Fingerprint, Ghost, Zap, TriangleAlert as AlertTriangle, Shield, Trash2, Eye, Lock, Database, Activity } from "lucide-react";
import {
  generateBrowserFingerprint,
  getNetworkLog,
  clearNetworkLog,
  getAuditLog,
  clearAuditLog,
  type AuditEntry,
  type NetworkEntry,
} from "@/lib/security";

interface AdvancedSecurityPanelProps {
  onPanic: () => void;
}

const AdvancedSecurityPanel = ({ onPanic }: AdvancedSecurityPanelProps) => {
  const [fingerprint, setFingerprint] = useState("");
  const [networkLog, setNetworkLog] = useState<NetworkEntry[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [showNetworkLog, setShowNetworkLog] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);

  useEffect(() => {
    setFingerprint(generateBrowserFingerprint());
    setNetworkLog(getNetworkLog());
    setAuditLog(getAuditLog());
  }, []);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Browser Fingerprint */}
      <section className="space-y-3 p-4 border border-border rounded-lg bg-secondary/20">
        <div className="flex items-center gap-2">
          <Fingerprint className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            Browser Fingerprint
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Unique identifier based on your device configuration
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs font-mono bg-background rounded px-3 py-2 border border-border text-primary truncate">
            {fingerprint}
          </code>
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-mono"
            onClick={() => navigator.clipboard.writeText(fingerprint)}
          >
            Copy
          </Button>
        </div>
      </section>

      {/* Network Activity Monitor */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              Network Monitor
            </h3>
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded font-mono">
              {networkLog.length}
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-muted-foreground hover:text-destructive"
            onClick={() => {
              clearNetworkLog();
              setNetworkLog([]);
            }}
          >
            <Trash2 className="h-3 w-3 mr-1" /> Clear
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNetworkLog(!showNetworkLog)}
          className="w-full text-xs font-mono justify-between"
        >
          {showNetworkLog ? "Hide Network Log" : "Show Network Log"}
          <Activity className="h-3 w-3" />
        </Button>

        {showNetworkLog && networkLog.length > 0 && (
          <div className="max-h-48 overflow-y-auto space-y-1 border border-border rounded-lg bg-secondary/30 p-2">
            {networkLog.map((entry, i) => (
              <div
                key={i}
                className="text-[10px] font-mono text-muted-foreground p-1.5 border-b border-border/30 last:border-0 hover:bg-secondary/50 rounded"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-primary">{formatTime(entry.timestamp)}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    entry.method === "GET" ? "bg-blue-500/20 text-blue-400" :
                    entry.method === "POST" ? "bg-green-500/20 text-green-400" :
                    "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {entry.method}
                  </span>
                </div>
                <div className="truncate text-foreground/70 mt-1">{entry.url}</div>
              </div>
            ))}
          </div>
        )}

        {networkLog.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            No network activity recorded
          </p>
        )}
      </section>

      {/* Audit Log */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              Audit Log
            </h3>
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded font-mono">
              {auditLog.length}
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-muted-foreground hover:text-destructive"
            onClick={() => {
              clearAuditLog();
              setAuditLog([]);
            }}
          >
            <Trash2 className="h-3 w-3 mr-1" /> Clear
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAuditLog(!showAuditLog)}
          className="w-full text-xs font-mono justify-between"
        >
          {showAuditLog ? "Hide Audit Log" : "Show Audit Log"}
          <Database className="h-3 w-3" />
        </Button>

        {showAuditLog && auditLog.length > 0 && (
          <div className="max-h-48 overflow-y-auto space-y-1 border border-border rounded-lg bg-secondary/30 p-2">
            {auditLog.map((entry, i) => {
              const eventColors: Record<string, string> = {
                unlock: "text-green-400 bg-green-500/20",
                lock: "text-blue-400 bg-blue-500/20",
                panic: "text-destructive bg-destructive/20",
                failed_attempt: "text-yellow-400 bg-yellow-500/20",
                devtools_detected: "text-orange-400 bg-orange-500/20",
              };
              return (
                <div
                  key={i}
                  className="text-[10px] font-mono text-muted-foreground p-1.5 border-b border-border/30 last:border-0 hover:bg-secondary/50 rounded"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-foreground/70">{formatDate(entry.timestamp)}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${eventColors[entry.type] || "text-muted-foreground"}`}>
                      {entry.type.toUpperCase()}
                    </span>
                  </div>
                  {entry.detail && (
                    <div className="truncate text-foreground/60 mt-1">{entry.detail}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {auditLog.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            No security events recorded
          </p>
        )}
      </section>

      {/* Quick Actions */}
      <div className="flex gap-2 flex-wrap pt-4 border-t border-border">
        <Button
          onClick={onPanic}
          variant="destructive"
          size="sm"
          className="text-xs font-mono gap-1"
        >
          <AlertTriangle className="h-3 w-3" /> PANIC MODE
        </Button>
      </div>
    </div>
  );
};

export default AdvancedSecurityPanel;

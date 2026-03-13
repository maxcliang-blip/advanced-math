import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, TriangleAlert as AlertTriangle, Shield, Fingerprint } from "lucide-react";
import {
  recordFailedAttempt,
  clearFailedAttempts,
  getFailedAttempts,
  isDeviceTrusted,
  setTrustedDevice,
  loadSecuritySettings,
  isDecoyPassword,
  loadKeystrokePattern,
  matchKeystrokePattern,
  addAuditEntry,
} from "@/lib/security";

interface PasswordGateProps {
  onUnlock: () => void;
  onDecoy?: () => void;
}

const FIXED_PASSWORD = "LAXMIANG";
const MAX_ATTEMPTS = 5;

const PasswordGate = ({ onUnlock, onDecoy }: PasswordGateProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(getFailedAttempts());
  const security = loadSecuritySettings();
  
  // Keystroke pattern state
  const storedPattern = loadKeystrokePattern();
  const patternEnabled = security.keystrokePatternLock && storedPattern;
  const [patternMode, setPatternMode] = useState(false);
  const [patternTaps, setPatternTaps] = useState<number[]>([]);
  const lastTapRef = useRef<number>(0);
  const [patternResult, setPatternResult] = useState<string>("");

  const handlePatternTap = useCallback(() => {
    const now = Date.now();
    if (lastTapRef.current > 0) {
      setPatternTaps(prev => [...prev, now - lastTapRef.current]);
    }
    lastTapRef.current = now;
    
    // Check if we have enough taps
    if (storedPattern && patternTaps.length + 1 >= storedPattern.intervals.length) {
      const attempt = [...patternTaps, now - lastTapRef.current].slice(0, storedPattern.intervals.length);
      // Need to wait for state update, so check on next tap
    }
  }, [patternTaps, storedPattern]);

  // Check pattern match when taps reach required length
  useEffect(() => {
    if (!storedPattern || !patternMode) return;
    if (patternTaps.length === storedPattern.intervals.length) {
      if (matchKeystrokePattern(storedPattern, patternTaps)) {
        clearFailedAttempts();
        setPatternResult("");
        onUnlock();
      } else {
        setPatternResult("Pattern mismatch — try again");
        setPatternTaps([]);
        lastTapRef.current = 0;
        const attempts = recordFailedAttempt();
        setFailedAttempts(attempts);
      }
    }
  }, [patternTaps, storedPattern, patternMode, onUnlock]);

  useEffect(() => {
    if (security.trustedDeviceOnly && !isDeviceTrusted()) {
      setError("Untrusted device - access denied");
      setLocked(true);
      return;
    }

    if (failedAttempts >= MAX_ATTEMPTS) {
      setLocked(true);
      setCountdown(60);
    }
  }, [failedAttempts, security.trustedDeviceOnly]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && locked) {
      setLocked(false);
      clearFailedAttempts();
      setFailedAttempts(0);
    }
  }, [countdown, locked]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (locked) {
      setError(`Locked. Try again in ${countdown}s`);
      return;
    }

    setError("");

    if (isDecoyPassword(password) && onDecoy) {
      onDecoy();
      return;
    }

    if (password === FIXED_PASSWORD) {
      clearFailedAttempts();
      if (security.trustedDeviceOnly && !isDeviceTrusted()) {
        setTrustedDevice();
      }
      onUnlock();
    } else {
      const attempts = recordFailedAttempt();
      setFailedAttempts(attempts);

      if (attempts >= MAX_ATTEMPTS) {
        setError(`Too many attempts. Locked for 60 seconds.`);
        setLocked(true);
        setCountdown(60);
      } else {
        setError(`Access denied (${MAX_ATTEMPTS - attempts} attempts left)`);
      }
      setPassword("");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background scanline">
      <div className="w-full max-w-sm p-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <Lock className="h-8 w-8 text-primary glow-text animate-flicker" />
            <h1 className="text-2xl font-display font-bold text-primary glow-text">
              AUTHENTICATE
            </h1>
          </div>

          <div className="w-full h-px bg-primary/30" />

          {security.trustedDeviceOnly && !isDeviceTrusted() && (
            <div className="w-full bg-destructive/10 border border-destructive/30 rounded px-3 py-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-xs text-destructive font-mono">Trusted device mode enabled</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-widest">
                Enter password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/30"
                autoFocus
                disabled={locked && countdown > 0}
                data-testid="input-password"
              />
            </div>

            {error && (
              <p className="text-destructive text-sm font-mono flex items-center gap-2">
                <AlertTriangle className="h-3 w-3" />
                &gt; {error}
              </p>
            )}

            {failedAttempts > 0 && failedAttempts < MAX_ATTEMPTS && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <Shield className="h-3 w-3" />
                Security alert: {failedAttempts}/{MAX_ATTEMPTS} failed attempts
              </div>
            )}

            <Button
              type="submit"
              disabled={locked && countdown > 0}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/80 glow-box font-display font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-unlock"
            >
              {locked && countdown > 0 ? `LOCKED (${countdown}s)` : "UNLOCK"}
            </Button>
          </form>

          {patternEnabled && (
            <div className="w-full space-y-3">
              <div className="w-full h-px bg-border" />
              {!patternMode ? (
                <Button
                  variant="outline"
                  onClick={() => { setPatternMode(true); setPatternTaps([]); lastTapRef.current = 0; setPatternResult(""); }}
                  className="w-full text-xs font-mono"
                >
                  <Fingerprint className="h-3 w-3 mr-2" />
                  Unlock with Pattern
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-mono text-center">
                    Tap the button with your rhythm ({patternTaps.length + 1}/{storedPattern!.length} taps)
                  </p>
                  <Button
                    onClick={handlePatternTap}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/80 glow-box font-display font-semibold"
                  >
                    TAP
                  </Button>
                  {patternResult && (
                    <p className="text-destructive text-xs font-mono flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3" />
                      {patternResult}
                    </p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setPatternMode(false); setPatternTaps([]); lastTapRef.current = 0; }}
                    className="w-full text-xs font-mono text-muted-foreground"
                  >
                    Back to Password
                  </Button>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            <span className="animate-blink">▋</span> secure access required
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordGate;

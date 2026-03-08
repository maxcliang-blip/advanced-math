import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface PasswordGateProps {
  onUnlock: () => void;
}

const STORED_HASH_KEY = "cloak_pw_hash";

async function hashPassword(pw: string): Promise<string> {
  const encoded = new TextEncoder().encode(pw);
  const buf = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const PasswordGate = ({ onUnlock }: PasswordGateProps) => {
  const [password, setPassword] = useState("");
  const [isSetup, setIsSetup] = useState(false);
  const [error, setError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORED_HASH_KEY);
    setIsSetup(!!stored);
  }, []);

  const handleSetup = async () => {
    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    const hash = await hashPassword(password);
    localStorage.setItem(STORED_HASH_KEY, hash);
    onUnlock();
  };

  const handleLogin = async () => {
    const stored = localStorage.getItem(STORED_HASH_KEY);
    const hash = await hashPassword(password);
    if (hash === stored) {
      onUnlock();
    } else {
      setError("Access denied");
      setPassword("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (isSetup) {
      handleLogin();
    } else {
      handleSetup();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background scanline">
      <div className="w-full max-w-sm p-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <Lock className="h-8 w-8 text-primary glow-text animate-flicker" />
            <h1 className="text-2xl font-display font-bold text-primary glow-text">
              {isSetup ? "AUTHENTICATE" : "SET PASSWORD"}
            </h1>
          </div>

          <div className="w-full h-px bg-primary/30" />

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-widest">
                {isSetup ? "Enter password" : "Create password"}
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/30"
                autoFocus
              />
            </div>

            {!isSetup && (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-widest">
                  Confirm password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/30"
                />
              </div>
            )}

            {error && (
              <p className="text-destructive text-sm font-mono">&gt; {error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/80 glow-box font-display font-semibold tracking-wide"
            >
              {isSetup ? "UNLOCK" : "SET UP"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            <span className="animate-blink">▋</span> secure access required
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordGate;

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface PasswordGateProps {
  onUnlock: () => void;
}

const FIXED_PASSWORD = "LAXMIANG";

const PasswordGate = ({ onUnlock }: PasswordGateProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password === FIXED_PASSWORD) {
      onUnlock();
    } else {
      setError("Access denied");
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
              />
            </div>

            {error && (
              <p className="text-destructive text-sm font-mono">&gt; {error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/80 glow-box font-display font-semibold tracking-wide"
            >
              UNLOCK
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

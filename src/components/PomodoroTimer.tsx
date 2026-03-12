import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Coffee, Brain, RotateCw, Play, Pause, SkipForward } from "lucide-react";
import { useDraggable } from "@/hooks/use-draggable";

interface PomodoroTimerProps {
  onClose: () => void;
}

type PomodoroMode = "work" | "short" | "long";

const MODES: Record<PomodoroMode, { label: string; seconds: number; color: string }> = {
  work:  { label: "Focus",       seconds: 25 * 60, color: "text-primary" },
  short: { label: "Short Break", seconds: 5 * 60,  color: "text-green-400" },
  long:  { label: "Long Break",  seconds: 15 * 60, color: "text-blue-400" },
};

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

const PomodoroTimer = ({ onClose }: PomodoroTimerProps) => {
  const [mode, setMode] = useState<PomodoroMode>("work");
  const [secondsLeft, setSecondsLeft] = useState(MODES.work.seconds);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const { pos, onMouseDown } = useDraggable({ initialX: 80, initialY: 120 });

  const reset = useCallback((m: PomodoroMode) => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setSecondsLeft(MODES[m].seconds);
  }, []);

  const switchMode = (m: PomodoroMode) => {
    setMode(m);
    reset(m);
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === "work") setSessions((n) => n + 1);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const skip = () => {
    const next: PomodoroMode = mode === "work"
      ? (sessions > 0 && (sessions + 1) % 4 === 0 ? "long" : "short")
      : "work";
    switchMode(next);
  };

  const total = MODES[mode].seconds;
  const progress = (secondsLeft / total) * 100;
  const circumference = 2 * Math.PI * 44;
  const dashOffset = circumference * (1 - progress / 100);

  return (
    <div
      className="fixed z-50 bg-card border border-border rounded-lg shadow-xl"
      style={{ left: pos.x, top: pos.y, width: 240, boxShadow: "var(--glow)" }}
    >
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-border cursor-move select-none"
        onMouseDown={onMouseDown}
      >
        <div className="flex items-center gap-2">
          <Brain className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-mono text-primary uppercase tracking-widest">Pomodoro</span>
        </div>
        <Button onClick={onClose} variant="ghost" size="sm" className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground">
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Mode tabs */}
        <div className="flex gap-1">
          {(Object.keys(MODES) as PomodoroMode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 text-[9px] font-mono py-1 rounded transition-colors ${
                mode === m ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`pomo-mode-${m}`}
            >
              {MODES[m].label}
            </button>
          ))}
        </div>

        {/* Circular progress */}
        <div className="flex justify-center">
          <div className="relative">
            <svg width="108" height="108" viewBox="0 0 108 108">
              <circle cx="54" cy="54" r="44" fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
              <circle
                cx="54" cy="54" r="44"
                fill="none"
                stroke={mode === "work" ? "hsl(var(--primary))" : mode === "short" ? "#4ade80" : "#60a5fa"}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 54 54)"
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-mono font-bold ${MODES[mode].color}`}>{fmt(secondsLeft)}</span>
              <span className="text-[9px] font-mono text-muted-foreground mt-0.5">{MODES[mode].label}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={() => reset(mode)}
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            data-testid="pomo-reset"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            onClick={() => setRunning((r) => !r)}
            size="sm"
            className="h-8 px-5 font-mono text-xs"
            data-testid="pomo-playpause"
          >
            {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {running ? "Pause" : "Start"}
          </Button>
          <Button
            onClick={skip}
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            title="Skip to next"
            data-testid="pomo-skip"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Session counter */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Coffee className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-mono text-muted-foreground">Sessions today</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: Math.max(4, sessions) }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i < sessions ? "bg-primary" : "bg-secondary"}`}
              />
            ))}
          </div>
          <button
            onClick={() => setSessions(0)}
            className="text-[9px] font-mono text-muted-foreground hover:text-foreground ml-1"
            title="Reset sessions"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;

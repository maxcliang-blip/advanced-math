import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Play, Pause, RotateCw, Timer, Clock, Flag } from "lucide-react";
import { useDraggable } from "@/hooks/use-draggable";

interface StopwatchTimerProps {
  onClose: () => void;
}

const formatTime = (ms: number): string => {
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const centis = Math.floor((ms % 1000) / 10);
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centis).padStart(2, "0")}`;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centis).padStart(2, "0")}`;
};

const StopwatchTimer = ({ onClose }: StopwatchTimerProps) => {
  const [mode, setMode] = useState<"stopwatch" | "timer">("stopwatch");

  // Stopwatch
  const [swRunning, setSwRunning] = useState(false);
  const [swElapsed, setSwElapsed] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const swStart = useRef<number>(0);
  const swRef = useRef<ReturnType<typeof setInterval>>();

  // Timer
  const [timerMinutes, setTimerMinutes] = useState("5");
  const [timerSeconds, setTimerSeconds] = useState("0");
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [timerDone, setTimerDone] = useState(false);
  const timerEnd = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const { pos, onMouseDown } = useDraggable({ initialX: window.innerWidth - 300, initialY: window.innerHeight - 420 });

  // Stopwatch logic
  useEffect(() => {
    if (swRunning) {
      swStart.current = Date.now() - swElapsed;
      swRef.current = setInterval(() => {
        setSwElapsed(Date.now() - swStart.current);
      }, 33);
    } else {
      clearInterval(swRef.current);
    }
    return () => clearInterval(swRef.current);
  }, [swRunning]);

  const swReset = () => { setSwRunning(false); setSwElapsed(0); setLaps([]); };
  const swLap = () => { if (swRunning) setLaps((prev) => [swElapsed, ...prev]); };

  // Timer logic
  const startTimer = useCallback(() => {
    const total = (parseInt(timerMinutes) || 0) * 60000 + (parseInt(timerSeconds) || 0) * 1000;
    if (total <= 0) return;
    setTimerRemaining(total);
    timerEnd.current = Date.now() + total;
    setTimerRunning(true);
    setTimerDone(false);
  }, [timerMinutes, timerSeconds]);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        const remaining = timerEnd.current - Date.now();
        if (remaining <= 0) {
          setTimerRemaining(0);
          setTimerRunning(false);
          setTimerDone(true);
          clearInterval(timerRef.current);
        } else {
          setTimerRemaining(remaining);
        }
      }, 33);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  const resetTimer = () => { setTimerRunning(false); setTimerRemaining(0); setTimerDone(false); };

  return (
    <div
      className="fixed z-50 bg-card border border-border rounded-lg shadow-lg"
      style={{ left: pos.x, top: pos.y, width: 272, boxShadow: "var(--glow)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-border cursor-move select-none"
        onMouseDown={onMouseDown}
      >
        <div className="flex items-center gap-2">
          <Timer className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-mono text-primary uppercase tracking-widest">Timer</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode(mode === "stopwatch" ? "timer" : "stopwatch")}
            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            {mode === "stopwatch" ? "COUNTDOWN" : "STOPWATCH"}
          </button>
          <Button onClick={onClose} variant="ghost" size="sm" className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="p-3">
        {mode === "stopwatch" ? (
          <div className="space-y-3">
            {/* Display */}
            <div className="bg-secondary rounded px-3 py-3 text-center">
              <span className="text-2xl font-mono text-foreground tabular-nums">{formatTime(swElapsed)}</span>
            </div>

            {/* Controls */}
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => setSwRunning(!swRunning)}
                variant={swRunning ? "outline" : "default"}
                size="sm"
                className="gap-1 font-mono text-xs"
              >
                {swRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                {swRunning ? "Pause" : "Start"}
              </Button>
              <Button onClick={swLap} variant="outline" size="sm" className="gap-1 font-mono text-xs" disabled={!swRunning}>
                <Flag className="h-3 w-3" /> Lap
              </Button>
              <Button onClick={swReset} variant="ghost" size="sm" className="gap-1 font-mono text-xs text-muted-foreground">
                <RotateCw className="h-3 w-3" /> Reset
              </Button>
            </div>

            {/* Laps */}
            {laps.length > 0 && (
              <div className="max-h-28 overflow-y-auto space-y-0.5">
                {laps.map((lap, i) => (
                  <div key={i} className="flex justify-between text-[11px] font-mono px-2 py-0.5 rounded hover:bg-secondary">
                    <span className="text-muted-foreground">Lap {laps.length - i}</span>
                    <span className="text-foreground tabular-nums">{formatTime(lap)}</span>
                    {i < laps.length - 1 && (
                      <span className="text-primary tabular-nums">+{formatTime(lap - laps[i + 1])}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Timer input */}
            {!timerRunning && timerRemaining === 0 && (
              <div className="flex items-center gap-2 justify-center">
                <div className="text-center">
                  <Input
                    type="number"
                    value={timerMinutes}
                    onChange={(e) => setTimerMinutes(e.target.value)}
                    className="h-10 w-16 text-center font-mono text-lg bg-secondary border-border"
                    min="0" max="999"
                  />
                  <span className="text-[10px] text-muted-foreground font-mono">min</span>
                </div>
                <span className="text-xl font-mono text-muted-foreground">:</span>
                <div className="text-center">
                  <Input
                    type="number"
                    value={timerSeconds}
                    onChange={(e) => setTimerSeconds(e.target.value)}
                    className="h-10 w-16 text-center font-mono text-lg bg-secondary border-border"
                    min="0" max="59"
                  />
                  <span className="text-[10px] text-muted-foreground font-mono">sec</span>
                </div>
              </div>
            )}

            {/* Timer display */}
            {(timerRunning || timerRemaining > 0 || timerDone) && (
              <div className={`bg-secondary rounded px-3 py-3 text-center ${timerDone ? "animate-pulse" : ""}`}>
                <span className={`text-2xl font-mono tabular-nums ${timerDone ? "text-destructive" : "text-foreground"}`}>
                  {timerDone ? "00:00.00" : formatTime(timerRemaining)}
                </span>
                {timerDone && <p className="text-xs text-destructive font-mono mt-1">⏰ Time's up!</p>}
              </div>
            )}

            {/* Quick presets */}
            {!timerRunning && timerRemaining === 0 && (
              <div className="flex gap-1 justify-center flex-wrap">
                {[1, 5, 10, 15, 25, 30].map((m) => (
                  <button
                    key={m}
                    onClick={() => { setTimerMinutes(String(m)); setTimerSeconds("0"); }}
                    className="text-[10px] font-mono px-2 py-1 rounded bg-secondary text-muted-foreground hover:text-primary transition-colors"
                  >
                    {m}m
                  </button>
                ))}
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-2 justify-center">
              {!timerRunning && timerRemaining === 0 && !timerDone ? (
                <Button onClick={startTimer} size="sm" className="gap-1 font-mono text-xs">
                  <Play className="h-3 w-3" /> Start
                </Button>
              ) : (
                <>
                  {!timerDone && (
                    <Button
                      onClick={() => {
                        if (timerRunning) {
                          clearInterval(timerRef.current);
                          setTimerRunning(false);
                        } else {
                          timerEnd.current = Date.now() + timerRemaining;
                          setTimerRunning(true);
                        }
                      }}
                      variant={timerRunning ? "outline" : "default"}
                      size="sm"
                      className="gap-1 font-mono text-xs"
                    >
                      {timerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      {timerRunning ? "Pause" : "Resume"}
                    </Button>
                  )}
                  <Button onClick={resetTimer} variant="ghost" size="sm" className="gap-1 font-mono text-xs text-muted-foreground">
                    <RotateCw className="h-3 w-3" /> Reset
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StopwatchTimer;

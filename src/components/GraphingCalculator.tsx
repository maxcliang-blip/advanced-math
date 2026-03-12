import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, TrendingUp, Plus, Trash2, Eye, EyeOff, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useDraggable } from "@/hooks/use-draggable";

interface PlotFunction {
  id: number;
  expr: string;
  color: string;
  visible: boolean;
}

interface Viewport {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

interface GraphingCalculatorProps {
  onClose: () => void;
}

const COLORS = ["#22d3ee", "#f472b6", "#4ade80", "#facc15", "#f87171", "#a78bfa", "#fb923c", "#34d399"];

function safeEval(expr: string, x: number): number {
  try {
    const sanitized = expr
      .replace(/\^/g, "**")
      .replace(/\bsin\b/g, "Math.sin")
      .replace(/\bcos\b/g, "Math.cos")
      .replace(/\btan\b/g, "Math.tan")
      .replace(/\basin\b/g, "Math.asin")
      .replace(/\bacos\b/g, "Math.acos")
      .replace(/\batan\b/g, "Math.atan")
      .replace(/\bsqrt\b/g, "Math.sqrt")
      .replace(/\babs\b/g, "Math.abs")
      .replace(/\blog\b/g, "Math.log10")
      .replace(/\bln\b/g, "Math.log")
      .replace(/\bexp\b/g, "Math.exp")
      .replace(/\bfloor\b/g, "Math.floor")
      .replace(/\bceil\b/g, "Math.ceil")
      .replace(/\bround\b/g, "Math.round")
      .replace(/\bpi\b/g, "Math.PI")
      .replace(/\be\b/g, "Math.E");
    const fn = new Function("x", `"use strict"; return (${sanitized});`);
    const result = fn(x);
    if (typeof result !== "number" || !isFinite(result)) return NaN;
    return result;
  } catch {
    return NaN;
  }
}

const DEFAULT_VP: Viewport = { xMin: -10, xMax: 10, yMin: -8, yMax: 8 };

const PRESETS = [
  { label: "x²", expr: "x^2" },
  { label: "x³", expr: "x^3" },
  { label: "sin(x)", expr: "sin(x)" },
  { label: "cos(x)", expr: "cos(x)" },
  { label: "tan(x)", expr: "tan(x)" },
  { label: "√x", expr: "sqrt(x)" },
  { label: "1/x", expr: "1/x" },
  { label: "|x|", expr: "abs(x)" },
  { label: "eˣ", expr: "exp(x)" },
  { label: "ln(x)", expr: "ln(x)" },
];

const GraphingCalculator = ({ onClose }: GraphingCalculatorProps) => {
  const [functions, setFunctions] = useState<PlotFunction[]>([
    { id: 1, expr: "x^2", color: COLORS[0], visible: true },
    { id: 2, expr: "sin(x)", color: COLORS[1], visible: true },
  ]);
  const [inputExpr, setInputExpr] = useState("");
  const [nextId, setNextId] = useState(3);
  const [viewport, setViewport] = useState<Viewport>(DEFAULT_VP);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editExpr, setEditExpr] = useState("");
  const [errors, setErrors] = useState<Record<number, boolean>>({});

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panRef = useRef<{ active: boolean; lastX: number; lastY: number }>({ active: false, lastX: 0, lastY: 0 });

  const { pos, onMouseDown: onDragMouseDown } = useDraggable({
    initialX: Math.max(40, (typeof window !== "undefined" ? window.innerWidth : 800) / 2 - 220),
    initialY: 60,
  });

  const CANVAS_W = 440;
  const CANVAS_H = 300;

  const toCanvas = useCallback((xw: number, yw: number, vp: Viewport) => ({
    cx: ((xw - vp.xMin) / (vp.xMax - vp.xMin)) * CANVAS_W,
    cy: ((vp.yMax - yw) / (vp.yMax - vp.yMin)) * CANVAS_H,
  }), []);

  const toWorld = useCallback((cx: number, cy: number, vp: Viewport) => ({
    xw: vp.xMin + (cx / CANVAS_W) * (vp.xMax - vp.xMin),
    yw: vp.yMax - (cy / CANVAS_H) * (vp.yMax - vp.yMin),
  }), []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const vp = viewport;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Background
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const xRange = vp.xMax - vp.xMin;
    const yRange = vp.yMax - vp.yMin;

    // Compute nice grid step
    const rawStepX = xRange / 10;
    const rawStepY = yRange / 8;
    const niceStep = (raw: number) => {
      const mag = Math.pow(10, Math.floor(Math.log10(Math.abs(raw))));
      const normed = raw / mag;
      if (normed < 1.5) return mag;
      if (normed < 3.5) return 2 * mag;
      if (normed < 7.5) return 5 * mag;
      return 10 * mag;
    };
    const stepX = niceStep(rawStepX);
    const stepY = niceStep(rawStepY);

    // Grid lines
    ctx.strokeStyle = "#1e1e2e";
    ctx.lineWidth = 1;
    const startX = Math.ceil(vp.xMin / stepX) * stepX;
    for (let x = startX; x <= vp.xMax + stepX; x += stepX) {
      const { cx } = toCanvas(x, 0, vp);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, CANVAS_H);
      ctx.stroke();
    }
    const startY = Math.ceil(vp.yMin / stepY) * stepY;
    for (let y = startY; y <= vp.yMax + stepY; y += stepY) {
      const { cy } = toCanvas(0, y, vp);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(CANVAS_W, cy);
      ctx.stroke();
    }

    // Axes
    const origin = toCanvas(0, 0, vp);
    ctx.strokeStyle = "#3f3f5a";
    ctx.lineWidth = 1.5;
    // X axis
    if (origin.cy >= 0 && origin.cy <= CANVAS_H) {
      ctx.beginPath();
      ctx.moveTo(0, origin.cy);
      ctx.lineTo(CANVAS_W, origin.cy);
      ctx.stroke();
    }
    // Y axis
    if (origin.cx >= 0 && origin.cx <= CANVAS_W) {
      ctx.beginPath();
      ctx.moveTo(origin.cx, 0);
      ctx.lineTo(origin.cx, CANVAS_H);
      ctx.stroke();
    }

    // Tick labels
    ctx.fillStyle = "#6b6b8a";
    ctx.font = "9px monospace";
    ctx.textAlign = "center";
    for (let x = startX; x <= vp.xMax + stepX; x += stepX) {
      if (Math.abs(x) < stepX * 0.01) continue;
      const { cx } = toCanvas(x, 0, vp);
      if (cx < 5 || cx > CANVAS_W - 5) continue;
      const labelY = Math.min(Math.max(origin.cy + 10, 10), CANVAS_H - 4);
      ctx.fillText(
        Math.abs(x) < 1e-10 ? "0" : parseFloat(x.toPrecision(4)).toString(),
        cx, labelY
      );
    }
    ctx.textAlign = "right";
    for (let y = startY; y <= vp.yMax + stepY; y += stepY) {
      if (Math.abs(y) < stepY * 0.01) continue;
      const { cy } = toCanvas(0, y, vp);
      if (cy < 8 || cy > CANVAS_H - 4) continue;
      const labelX = Math.min(Math.max(origin.cx - 4, 30), CANVAS_W - 4);
      ctx.fillText(
        Math.abs(y) < 1e-10 ? "" : parseFloat(y.toPrecision(4)).toString(),
        labelX, cy + 3
      );
    }

    // Plot functions
    const newErrors: Record<number, boolean> = {};
    functions.forEach((fn) => {
      if (!fn.visible || !fn.expr.trim()) return;
      ctx.strokeStyle = fn.color;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";

      let hasError = false;
      let started = false;
      ctx.beginPath();

      const steps = CANVAS_W * 2;
      for (let i = 0; i <= steps; i++) {
        const { xw } = toWorld(i * (CANVAS_W / steps), 0, vp);
        const yw = safeEval(fn.expr, xw);
        if (isNaN(yw)) { hasError = true; started = false; continue; }
        if (!isFinite(yw)) { started = false; continue; }
        const { cx, cy } = toCanvas(xw, yw, vp);
        if (Math.abs(cy) > CANVAS_H * 5) { started = false; continue; }
        if (!started) { ctx.moveTo(cx, cy); started = true; }
        else { ctx.lineTo(cx, cy); }
      }
      ctx.stroke();
      newErrors[fn.id] = hasError && fn.expr.trim() !== "";
    });
    setErrors(newErrors);
  }, [viewport, functions, toCanvas, toWorld]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Pan via mouse drag on canvas
  const onCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    panRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!panRef.current.active) return;
      const dx = e.clientX - panRef.current.lastX;
      const dy = e.clientY - panRef.current.lastY;
      panRef.current.lastX = e.clientX;
      panRef.current.lastY = e.clientY;
      setViewport((vp) => {
        const xRange = vp.xMax - vp.xMin;
        const yRange = vp.yMax - vp.yMin;
        const worldDx = -(dx / CANVAS_W) * xRange;
        const worldDy = (dy / CANVAS_H) * yRange;
        return {
          xMin: vp.xMin + worldDx,
          xMax: vp.xMax + worldDx,
          yMin: vp.yMin + worldDy,
          yMax: vp.yMax + worldDy,
        };
      });
    };
    const onUp = () => { panRef.current.active = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // Zoom via scroll wheel
  const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.12 : 0.88;
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setViewport((vp) => {
      const { xw, yw } = toWorld(mx, my, vp);
      return {
        xMin: xw + (vp.xMin - xw) * factor,
        xMax: xw + (vp.xMax - xw) * factor,
        yMin: yw + (vp.yMin - yw) * factor,
        yMax: yw + (vp.yMax - yw) * factor,
      };
    });
  };

  const zoom = (factor: number) => {
    setViewport((vp) => {
      const cx = (vp.xMin + vp.xMax) / 2;
      const cy = (vp.yMin + vp.yMax) / 2;
      const hw = ((vp.xMax - vp.xMin) / 2) * factor;
      const hh = ((vp.yMax - vp.yMin) / 2) * factor;
      return { xMin: cx - hw, xMax: cx + hw, yMin: cy - hh, yMax: cy + hh };
    });
  };

  const addFunction = (expr: string) => {
    const trimmed = expr.trim();
    if (!trimmed) return;
    setFunctions((prev) => [
      ...prev,
      { id: nextId, expr: trimmed, color: COLORS[nextId % COLORS.length], visible: true },
    ]);
    setNextId((n) => n + 1);
    setInputExpr("");
  };

  const removeFunction = (id: number) => {
    setFunctions((prev) => prev.filter((f) => f.id !== id));
  };

  const toggleVisible = (id: number) => {
    setFunctions((prev) => prev.map((f) => f.id === id ? { ...f, visible: !f.visible } : f));
  };

  const startEdit = (fn: PlotFunction) => {
    setEditingId(fn.id);
    setEditExpr(fn.expr);
  };

  const commitEdit = (id: number) => {
    setFunctions((prev) => prev.map((f) => f.id === id ? { ...f, expr: editExpr.trim() } : f));
    setEditingId(null);
  };

  return (
    <div
      className="fixed z-50 bg-card border border-border rounded-lg shadow-xl flex flex-col"
      style={{ left: pos.x, top: pos.y, width: 460, boxShadow: "var(--glow)" }}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-border cursor-move select-none"
        onMouseDown={onDragMouseDown}
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-mono text-primary uppercase tracking-widest">Graphing Calculator</span>
        </div>
        <div className="flex items-center gap-1">
          <Button onClick={() => zoom(0.7)} variant="ghost" size="sm" className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground" title="Zoom In">
            <ZoomIn className="h-3 w-3" />
          </Button>
          <Button onClick={() => zoom(1.4)} variant="ghost" size="sm" className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground" title="Zoom Out">
            <ZoomOut className="h-3 w-3" />
          </Button>
          <Button onClick={() => setViewport(DEFAULT_VP)} variant="ghost" size="sm" className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground" title="Reset View">
            <Maximize2 className="h-3 w-3" />
          </Button>
          <Button onClick={onClose} variant="ghost" size="sm" className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative" style={{ background: "#0a0a0f" }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="block cursor-crosshair"
          style={{ width: CANVAS_W, height: CANVAS_H }}
          onMouseDown={onCanvasMouseDown}
          onWheel={onWheel}
          data-testid="graph-canvas"
        />
        <div className="absolute bottom-1.5 right-2 text-[9px] text-muted-foreground font-mono opacity-60 pointer-events-none select-none">
          drag to pan · scroll to zoom
        </div>
      </div>

      {/* Function list + controls */}
      <div className="p-2 space-y-2">
        {/* Existing functions */}
        <div className="space-y-1 max-h-28 overflow-y-auto">
          {functions.map((fn) => (
            <div key={fn.id} className="flex items-center gap-1.5 group">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: fn.color }} />
              {editingId === fn.id ? (
                <Input
                  autoFocus
                  value={editExpr}
                  onChange={(e) => setEditExpr(e.target.value)}
                  onBlur={() => commitEdit(fn.id)}
                  onKeyDown={(e) => { if (e.key === "Enter") commitEdit(fn.id); if (e.key === "Escape") setEditingId(null); }}
                  className="h-6 text-xs font-mono bg-secondary border-border px-1.5 flex-1"
                />
              ) : (
                <button
                  className={`flex-1 text-left text-xs font-mono px-1.5 py-0.5 rounded hover:bg-secondary/60 transition-colors ${fn.visible ? "text-foreground" : "text-muted-foreground line-through"} ${errors[fn.id] ? "text-destructive" : ""}`}
                  onClick={() => startEdit(fn)}
                  data-testid={`fn-label-${fn.id}`}
                  title="Click to edit"
                >
                  y = {fn.expr}
                  {errors[fn.id] && <span className="ml-1 text-[9px]">(error)</span>}
                </button>
              )}
              <Button onClick={() => toggleVisible(fn.id)} variant="ghost" size="sm" className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`toggle-fn-${fn.id}`}>
                {fn.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>
              <Button onClick={() => removeFunction(fn.id)} variant="ghost" size="sm" className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`remove-fn-${fn.id}`}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add function input */}
        <div className="flex gap-1">
          <span className="text-xs font-mono text-muted-foreground self-center shrink-0">y =</span>
          <Input
            value={inputExpr}
            onChange={(e) => setInputExpr(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addFunction(inputExpr); }}
            placeholder="e.g. x^2, sin(x), x^3-x"
            className="h-7 text-xs font-mono bg-secondary border-border px-2 flex-1"
            data-testid="input-fn-expr"
          />
          <Button onClick={() => addFunction(inputExpr)} size="sm" className="h-7 px-2 text-xs font-mono" data-testid="button-add-fn">
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-1">
          {PRESETS.map((p) => (
            <button
              key={p.expr}
              onClick={() => addFunction(p.expr)}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors border border-border/50"
              data-testid={`preset-${p.label}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <p className="text-[9px] text-muted-foreground font-mono">
          Supported: sin, cos, tan, sqrt, abs, log, ln, exp, pi, e — use ^ for powers
        </p>
      </div>
    </div>
  );
};

export default GraphingCalculator;

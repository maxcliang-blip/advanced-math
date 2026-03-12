import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Sigma } from "lucide-react";
import { useDraggable } from "@/hooks/use-draggable";

interface EquationSolverProps {
  onClose: () => void;
}

type SolverMode = "linear" | "quadratic" | "system";

const EquationSolver = ({ onClose }: EquationSolverProps) => {
  const [mode, setMode] = useState<SolverMode>("quadratic");

  // Quadratic: ax² + bx + c = 0
  const [qa, setQa] = useState("1");
  const [qb, setQb] = useState("0");
  const [qc, setQc] = useState("0");

  // Linear: ax + b = 0
  const [la, setLa] = useState("1");
  const [lb, setLb] = useState("0");

  // System: a1x + b1y = c1, a2x + b2y = c2
  const [sa1, setSa1] = useState("1");
  const [sb1, setSb1] = useState("0");
  const [sc1, setSc1] = useState("0");
  const [sa2, setSa2] = useState("0");
  const [sb2, setSb2] = useState("1");
  const [sc2, setSc2] = useState("0");

  const { pos, onMouseDown } = useDraggable({ initialX: window.innerWidth - 340, initialY: 120 });

  const solveQuadratic = (): string => {
    const a = parseFloat(qa), b = parseFloat(qb), c = parseFloat(qc);
    if (isNaN(a) || isNaN(b) || isNaN(c)) return "Invalid input";
    if (a === 0) {
      if (b === 0) return c === 0 ? "Infinite solutions" : "No solution";
      return `x = ${parseFloat((-c / b).toPrecision(10))}`;
    }
    const disc = b * b - 4 * a * c;
    if (disc < 0) {
      const real = parseFloat((-b / (2 * a)).toPrecision(8));
      const imag = parseFloat((Math.sqrt(-disc) / (2 * a)).toPrecision(8));
      return `x₁ = ${real} + ${imag}i\nx₂ = ${real} - ${imag}i`;
    }
    if (disc === 0) {
      return `x = ${parseFloat((-b / (2 * a)).toPrecision(10))} (double root)`;
    }
    const x1 = parseFloat(((-b + Math.sqrt(disc)) / (2 * a)).toPrecision(10));
    const x2 = parseFloat(((-b - Math.sqrt(disc)) / (2 * a)).toPrecision(10));
    return `x₁ = ${x1}\nx₂ = ${x2}`;
  };

  const solveLinear = (): string => {
    const a = parseFloat(la), b = parseFloat(lb);
    if (isNaN(a) || isNaN(b)) return "Invalid input";
    if (a === 0) return b === 0 ? "Infinite solutions" : "No solution";
    return `x = ${parseFloat((-b / a).toPrecision(10))}`;
  };

  const solveSystem = (): string => {
    const a1 = parseFloat(sa1), b1 = parseFloat(sb1), c1 = parseFloat(sc1);
    const a2 = parseFloat(sa2), b2 = parseFloat(sb2), c2 = parseFloat(sc2);
    if ([a1, b1, c1, a2, b2, c2].some(isNaN)) return "Invalid input";
    const det = a1 * b2 - a2 * b1;
    if (det === 0) {
      if (a1 * c2 === a2 * c1 && b1 * c2 === b2 * c1) return "Infinite solutions (dependent)";
      return "No solution (inconsistent)";
    }
    const x = parseFloat(((c1 * b2 - c2 * b1) / det).toPrecision(10));
    const y = parseFloat(((a1 * c2 - a2 * c1) / det).toPrecision(10));
    return `x = ${x}\ny = ${y}`;
  };

  const result = mode === "quadratic" ? solveQuadratic() : mode === "linear" ? solveLinear() : solveSystem();

  const CoeffInput = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => (
    <div className="text-center">
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-14 text-center font-mono text-sm bg-secondary border-border px-1"
      />
      <span className="text-[9px] text-muted-foreground font-mono">{label}</span>
    </div>
  );

  return (
    <div
      className="fixed z-50 bg-card border border-border rounded-lg shadow-lg"
      style={{ left: pos.x, top: pos.y, width: 304, boxShadow: "var(--glow)" }}
    >
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-border cursor-move select-none"
        onMouseDown={onMouseDown}
      >
        <div className="flex items-center gap-2">
          <Sigma className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-mono text-primary uppercase tracking-widest">Solver</span>
        </div>
        <Button onClick={onClose} variant="ghost" size="sm" className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground">
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="p-3 space-y-3">
        {/* Mode tabs */}
        <div className="flex gap-1">
          {([
            { key: "linear" as const, label: "Linear" },
            { key: "quadratic" as const, label: "Quadratic" },
            { key: "system" as const, label: "System (2×2)" },
          ]).map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`text-[10px] font-mono px-2 py-1 rounded transition-colors ${
                mode === m.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Equation display */}
        {mode === "quadratic" && (
          <div className="space-y-2">
            <p className="text-[11px] font-mono text-muted-foreground text-center">ax² + bx + c = 0</p>
            <div className="flex items-center gap-1 justify-center">
              <CoeffInput value={qa} onChange={setQa} label="a" />
              <span className="text-muted-foreground font-mono text-sm">x² +</span>
              <CoeffInput value={qb} onChange={setQb} label="b" />
              <span className="text-muted-foreground font-mono text-sm">x +</span>
              <CoeffInput value={qc} onChange={setQc} label="c" />
              <span className="text-muted-foreground font-mono text-sm">= 0</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono text-center">
              Δ = {(() => {
                const a = parseFloat(qa), b = parseFloat(qb), c = parseFloat(qc);
                if (isNaN(a) || isNaN(b) || isNaN(c)) return "—";
                return parseFloat((b * b - 4 * a * c).toPrecision(10));
              })()}
            </p>
          </div>
        )}

        {mode === "linear" && (
          <div className="space-y-2">
            <p className="text-[11px] font-mono text-muted-foreground text-center">ax + b = 0</p>
            <div className="flex items-center gap-1 justify-center">
              <CoeffInput value={la} onChange={setLa} label="a" />
              <span className="text-muted-foreground font-mono text-sm">x +</span>
              <CoeffInput value={lb} onChange={setLb} label="b" />
              <span className="text-muted-foreground font-mono text-sm">= 0</span>
            </div>
          </div>
        )}

        {mode === "system" && (
          <div className="space-y-2">
            <p className="text-[11px] font-mono text-muted-foreground text-center">System of 2 equations</p>
            <div className="flex items-center gap-1 justify-center">
              <CoeffInput value={sa1} onChange={setSa1} label="a₁" />
              <span className="text-muted-foreground font-mono text-[11px]">x +</span>
              <CoeffInput value={sb1} onChange={setSb1} label="b₁" />
              <span className="text-muted-foreground font-mono text-[11px]">y =</span>
              <CoeffInput value={sc1} onChange={setSc1} label="c₁" />
            </div>
            <div className="flex items-center gap-1 justify-center">
              <CoeffInput value={sa2} onChange={setSa2} label="a₂" />
              <span className="text-muted-foreground font-mono text-[11px]">x +</span>
              <CoeffInput value={sb2} onChange={setSb2} label="b₂" />
              <span className="text-muted-foreground font-mono text-[11px]">y =</span>
              <CoeffInput value={sc2} onChange={setSc2} label="c₂" />
            </div>
          </div>
        )}

        {/* Result */}
        <div className="bg-secondary rounded px-3 py-2">
          <span className="text-[10px] text-muted-foreground font-mono block mb-1">Solution:</span>
          <pre className="text-sm font-mono text-primary whitespace-pre-wrap">{result}</pre>
        </div>
      </div>
    </div>
  );
};

export default EquationSolver;

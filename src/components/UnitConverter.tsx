import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ArrowRightLeft, Ruler } from "lucide-react";
import { useDraggable } from "@/hooks/use-draggable";

interface UnitConverterProps {
  onClose: () => void;
}

type Category = "length" | "weight" | "temperature" | "speed" | "data" | "time";

const units: Record<Category, { label: string; units: { name: string; toBase: (v: number) => number; fromBase: (v: number) => number }[] }> = {
  length: {
    label: "Length",
    units: [
      { name: "mm", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { name: "cm", toBase: (v) => v / 100, fromBase: (v) => v * 100 },
      { name: "m", toBase: (v) => v, fromBase: (v) => v },
      { name: "km", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { name: "in", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
      { name: "ft", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      { name: "yd", toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
      { name: "mi", toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
    ],
  },
  weight: {
    label: "Weight",
    units: [
      { name: "mg", toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
      { name: "g", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { name: "kg", toBase: (v) => v, fromBase: (v) => v },
      { name: "oz", toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
      { name: "lb", toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
      { name: "ton", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    ],
  },
  temperature: {
    label: "Temp",
    units: [
      { name: "°C", toBase: (v) => v, fromBase: (v) => v },
      { name: "°F", toBase: (v) => (v - 32) * 5 / 9, fromBase: (v) => v * 9 / 5 + 32 },
      { name: "K", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    ],
  },
  speed: {
    label: "Speed",
    units: [
      { name: "m/s", toBase: (v) => v, fromBase: (v) => v },
      { name: "km/h", toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
      { name: "mph", toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
      { name: "knot", toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
    ],
  },
  data: {
    label: "Data",
    units: [
      { name: "B", toBase: (v) => v, fromBase: (v) => v },
      { name: "KB", toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
      { name: "MB", toBase: (v) => v * 1048576, fromBase: (v) => v / 1048576 },
      { name: "GB", toBase: (v) => v * 1073741824, fromBase: (v) => v / 1073741824 },
      { name: "TB", toBase: (v) => v * 1099511627776, fromBase: (v) => v / 1099511627776 },
    ],
  },
  time: {
    label: "Time",
    units: [
      { name: "ms", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { name: "sec", toBase: (v) => v, fromBase: (v) => v },
      { name: "min", toBase: (v) => v * 60, fromBase: (v) => v / 60 },
      { name: "hr", toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
      { name: "day", toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
      { name: "week", toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
    ],
  },
};

const UnitConverter = ({ onClose }: UnitConverterProps) => {
  const [category, setCategory] = useState<Category>("length");
  const [fromUnit, setFromUnit] = useState(0);
  const [toUnit, setToUnit] = useState(1);
  const [value, setValue] = useState("1");

  const { pos, onMouseDown } = useDraggable({ initialX: window.innerWidth - 320, initialY: 80 });

  const cat = units[category];
  const from = cat.units[fromUnit] || cat.units[0];
  const to = cat.units[toUnit] || cat.units[1];

  const convert = (): string => {
    const v = parseFloat(value);
    if (isNaN(v)) return "—";
    const base = from.toBase(v);
    const result = to.fromBase(base);
    return parseFloat(result.toPrecision(10)).toString();
  };

  const swap = () => {
    const converted = convert();
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setValue(converted === "—" ? value : converted);
  };

  const changeCategory = (c: Category) => {
    setCategory(c);
    setFromUnit(0);
    setToUnit(1);
    setValue("1");
  };

  return (
    <div
      className="fixed z-50 bg-card border border-border rounded-lg shadow-lg"
      style={{ left: pos.x, top: pos.y, width: 288, boxShadow: "var(--glow)" }}
    >
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-border cursor-move select-none"
        onMouseDown={onMouseDown}
      >
        <div className="flex items-center gap-2">
          <Ruler className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-mono text-primary uppercase tracking-widest">Convert</span>
        </div>
        <Button onClick={onClose} variant="ghost" size="sm" className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground">
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="p-3 space-y-3">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-1">
          {(Object.keys(units) as Category[]).map((c) => (
            <button
              key={c}
              onClick={() => changeCategory(c)}
              className={`text-[10px] font-mono px-2 py-1 rounded transition-colors ${
                category === c ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {units[c].label}
            </button>
          ))}
        </div>

        {/* From */}
        <div className="space-y-1">
          <div className="flex gap-1 flex-wrap">
            {cat.units.map((u, i) => (
              <button
                key={u.name}
                onClick={() => setFromUnit(i)}
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                  fromUnit === i ? "bg-primary/20 text-primary border border-primary/40" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {u.name}
              </button>
            ))}
          </div>
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-9 font-mono text-sm bg-secondary border-border"
          />
        </div>

        {/* Swap */}
        <div className="flex justify-center">
          <Button onClick={swap} variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-primary">
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* To */}
        <div className="space-y-1">
          <div className="flex gap-1 flex-wrap">
            {cat.units.map((u, i) => (
              <button
                key={u.name}
                onClick={() => setToUnit(i)}
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                  toUnit === i ? "bg-primary/20 text-primary border border-primary/40" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {u.name}
              </button>
            ))}
          </div>
          <div className="h-9 flex items-center px-3 bg-secondary rounded-md border border-border font-mono text-sm text-foreground">
            {convert()}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground font-mono text-center">
          {value} {from.name} = {convert()} {to.name}
        </p>
      </div>
    </div>
  );
};

export default UnitConverter;

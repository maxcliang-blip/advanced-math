export interface Theme {
  name: string;
  label: string;
  vars: Record<string, string>;
}

export const themes: Theme[] = [
  {
    name: "hacker",
    label: "Hacker",
    vars: {
      "--background": "220 20% 6%",
      "--foreground": "140 60% 75%",
      "--card": "220 18% 10%",
      "--card-foreground": "140 60% 75%",
      "--popover": "220 18% 10%",
      "--popover-foreground": "140 60% 75%",
      "--primary": "140 70% 45%",
      "--primary-foreground": "220 20% 6%",
      "--secondary": "220 15% 15%",
      "--secondary-foreground": "140 40% 65%",
      "--muted": "220 15% 13%",
      "--muted-foreground": "220 10% 45%",
      "--accent": "140 70% 45%",
      "--accent-foreground": "220 20% 6%",
      "--destructive": "0 70% 50%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "140 30% 18%",
      "--input": "220 15% 15%",
      "--ring": "140 70% 45%",
      "--glow": "0 0 20px hsl(140 70% 45% / 0.3)",
      "--glow-strong": "0 0 30px hsl(140 70% 45% / 0.5)",
    },
  },
  {
    name: "midnight",
    label: "Midnight",
    vars: {
      "--background": "230 25% 7%",
      "--foreground": "220 60% 80%",
      "--card": "230 22% 11%",
      "--card-foreground": "220 60% 80%",
      "--popover": "230 22% 11%",
      "--popover-foreground": "220 60% 80%",
      "--primary": "220 80% 55%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "230 18% 16%",
      "--secondary-foreground": "220 40% 70%",
      "--muted": "230 18% 14%",
      "--muted-foreground": "230 10% 45%",
      "--accent": "220 80% 55%",
      "--accent-foreground": "0 0% 100%",
      "--destructive": "0 70% 50%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "220 30% 20%",
      "--input": "230 18% 16%",
      "--ring": "220 80% 55%",
      "--glow": "0 0 20px hsl(220 80% 55% / 0.3)",
      "--glow-strong": "0 0 30px hsl(220 80% 55% / 0.5)",
    },
  },
  {
    name: "blood",
    label: "Blood",
    vars: {
      "--background": "0 15% 6%",
      "--foreground": "0 50% 75%",
      "--card": "0 12% 10%",
      "--card-foreground": "0 50% 75%",
      "--popover": "0 12% 10%",
      "--popover-foreground": "0 50% 75%",
      "--primary": "0 70% 50%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "0 10% 15%",
      "--secondary-foreground": "0 30% 65%",
      "--muted": "0 10% 13%",
      "--muted-foreground": "0 8% 45%",
      "--accent": "0 70% 50%",
      "--accent-foreground": "0 0% 100%",
      "--destructive": "30 80% 50%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "0 25% 18%",
      "--input": "0 10% 15%",
      "--ring": "0 70% 50%",
      "--glow": "0 0 20px hsl(0 70% 50% / 0.3)",
      "--glow-strong": "0 0 30px hsl(0 70% 50% / 0.5)",
    },
  },
  {
    name: "stealth",
    label: "Stealth",
    vars: {
      "--background": "0 0% 5%",
      "--foreground": "0 0% 70%",
      "--card": "0 0% 9%",
      "--card-foreground": "0 0% 70%",
      "--popover": "0 0% 9%",
      "--popover-foreground": "0 0% 70%",
      "--primary": "0 0% 55%",
      "--primary-foreground": "0 0% 5%",
      "--secondary": "0 0% 13%",
      "--secondary-foreground": "0 0% 55%",
      "--muted": "0 0% 11%",
      "--muted-foreground": "0 0% 38%",
      "--accent": "0 0% 55%",
      "--accent-foreground": "0 0% 5%",
      "--destructive": "0 70% 50%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "0 0% 18%",
      "--input": "0 0% 13%",
      "--ring": "0 0% 55%",
      "--glow": "0 0 20px hsl(0 0% 55% / 0.2)",
      "--glow-strong": "0 0 30px hsl(0 0% 55% / 0.3)",
    },
  },
  {
    name: "amber",
    label: "Amber",
    vars: {
      "--background": "30 20% 6%",
      "--foreground": "40 70% 70%",
      "--card": "30 18% 10%",
      "--card-foreground": "40 70% 70%",
      "--popover": "30 18% 10%",
      "--popover-foreground": "40 70% 70%",
      "--primary": "40 90% 50%",
      "--primary-foreground": "30 20% 6%",
      "--secondary": "30 15% 15%",
      "--secondary-foreground": "40 50% 60%",
      "--muted": "30 15% 13%",
      "--muted-foreground": "30 10% 42%",
      "--accent": "40 90% 50%",
      "--accent-foreground": "30 20% 6%",
      "--destructive": "0 70% 50%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "40 30% 18%",
      "--input": "30 15% 15%",
      "--ring": "40 90% 50%",
      "--glow": "0 0 20px hsl(40 90% 50% / 0.3)",
      "--glow-strong": "0 0 30px hsl(40 90% 50% / 0.5)",
    },
  },
];

const THEME_KEY = "cloak_theme";

export function loadTheme(): string {
  return localStorage.getItem(THEME_KEY) || "hacker";
}

export function saveTheme(name: string) {
  localStorage.setItem(THEME_KEY, name);
}

export function applyTheme(name: string) {
  const theme = themes.find((t) => t.name === name);
  if (!theme) return;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  saveTheme(name);
}

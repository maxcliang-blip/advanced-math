export interface TabPreset {
  name: string;
  title: string;
  icon: string;
  custom?: boolean;
}

export const tabPresets: TabPreset[] = [
  { name: "Google", title: "Google", icon: "https://www.google.com/favicon.ico" },
  { name: "Google Docs", title: "Untitled document - Google Docs", icon: "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico" },
  { name: "Google Classroom", title: "Google Classroom", icon: "https://ssl.gstatic.com/classroom/favicon.png" },
  { name: "Canvas", title: "Dashboard", icon: "https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico" },
  { name: "Wikipedia", title: "Wikipedia", icon: "https://en.wikipedia.org/static/favicon/wikipedia.ico" },
  { name: "Khan Academy", title: "Khan Academy", icon: "https://cdn.kastatic.org/images/favicon.ico" },
  { name: "Desmos", title: "Desmos | Graphing Calculator", icon: "https://www.desmos.com/assets/img/apps/graphing/favicon.ico" },
  { name: "Schoology", title: "Home | Schoology", icon: "https://asset-cdn.schoology.com/sites/all/themes/flavor_jm/favicon.ico" },
  { name: "YouTube", title: "YouTube", icon: "https://www.youtube.com/favicon.ico" },
  { name: "Google Sheets", title: "Untitled spreadsheet - Google Sheets", icon: "https://ssl.gstatic.com/docs/spreadsheets/favicon3.ico" },
  { name: "Google Slides", title: "Untitled presentation - Google Slides", icon: "https://ssl.gstatic.com/docs/presentations/images/favicon5.ico" },
  { name: "Gmail", title: "Inbox - Gmail", icon: "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico" },
];

const CLOAK_KEY = "cloak_active_tab";
const CUSTOM_PRESETS_KEY = "cloak_custom_presets";

export function applyCloakPreset(preset: TabPreset) {
  document.title = preset.title;
  const link =
    (document.querySelector("link[rel~='icon']") as HTMLLinkElement) ||
    document.createElement("link");
  link.rel = "icon";
  link.href = preset.icon;
  document.head.appendChild(link);
  localStorage.setItem(CLOAK_KEY, JSON.stringify(preset));
}

export function loadActiveCloak(): TabPreset | null {
  try {
    const stored = localStorage.getItem(CLOAK_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function clearCloak() {
  localStorage.removeItem(CLOAK_KEY);
}

export function loadCustomPresets(): TabPreset[] {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_PRESETS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCustomPresets(presets: TabPreset[]) {
  localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(presets));
}

export function addCustomPreset(preset: TabPreset) {
  const existing = loadCustomPresets();
  const updated = [...existing.filter((p) => p.name !== preset.name), { ...preset, custom: true }];
  saveCustomPresets(updated);
  return updated;
}

export function removeCustomPreset(name: string) {
  const existing = loadCustomPresets();
  const updated = existing.filter((p) => p.name !== name);
  saveCustomPresets(updated);
  return updated;
}

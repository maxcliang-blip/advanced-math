export type PanicDestination = "404" | "google" | "youtube" | "docs" | "custom";
export type BossKeyStyle = "google" | "youtube" | "docs" | "404" | "custom";

export interface UserProfile {
  displayName: string;
  defaultDisguise: string;
  panicKey: string;
  autoCloakMinutes: number;
  panicDestination: PanicDestination;
  panicCustomUrl: string;
  bossKeyStyle: BossKeyStyle;
  bossKeyCustomUrl: string;
  useProxyMode: boolean;
}

const STORAGE_KEY = "cloak_profile";

const defaults: UserProfile = {
  displayName: "Agent",
  defaultDisguise: "Google",
  panicKey: "~",
  autoCloakMinutes: 0,
  panicDestination: "404",
  panicCustomUrl: "",
  bossKeyStyle: "google",
  bossKeyCustomUrl: "",
  useProxyMode: true,
};

export function loadProfile(): UserProfile {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return { ...defaults, ...stored };
  } catch {
    return { ...defaults };
  }
}

export function saveProfile(profile: UserProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

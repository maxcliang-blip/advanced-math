export interface UserProfile {
  displayName: string;
  defaultDisguise: string;
  panicKey: string;
}

const STORAGE_KEY = "cloak_profile";

const defaults: UserProfile = {
  displayName: "Agent",
  defaultDisguise: "Google",
  panicKey: "~",
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

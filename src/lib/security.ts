export interface SecuritySettings {
  enableSafeMode: boolean;
  enableActivityMonitor: boolean;
  enableScreenshotProtection: boolean;
  enableClipboardProtection: boolean;
  trustedDeviceOnly: boolean;
  sessionTimeout: number;
  requireReauth: boolean;
  blockDevTools: boolean;
  disableRightClick: boolean;
  lockOnTabSwitch: boolean;
  enablePanicOnDevTools: boolean;
  decoyPassword: string;
}

const SECURITY_KEY = "cloak_security_settings";
const DEVICE_KEY = "cloak_device_id";
const SESSION_KEY = "cloak_session_start";
const FAILED_ATTEMPTS_KEY = "cloak_failed_attempts";

const defaults: SecuritySettings = {
  enableSafeMode: false,
  enableActivityMonitor: false,
  enableScreenshotProtection: false,
  enableClipboardProtection: false,
  trustedDeviceOnly: false,
  sessionTimeout: 0,
  requireReauth: false,
  blockDevTools: false,
  disableRightClick: false,
  lockOnTabSwitch: false,
  enablePanicOnDevTools: false,
  decoyPassword: "",
};

export function loadSecuritySettings(): SecuritySettings {
  try {
    const stored = JSON.parse(localStorage.getItem(SECURITY_KEY) || "{}");
    return { ...defaults, ...stored };
  } catch {
    return { ...defaults };
  }
}

export function saveSecuritySettings(settings: SecuritySettings) {
  localStorage.setItem(SECURITY_KEY, JSON.stringify(settings));
}

export function generateDeviceId(): string {
  const id = `${navigator.userAgent}-${navigator.language}-${screen.width}x${screen.height}`;
  const hash = Array.from(id)
    .reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0)
    .toString(36);
  return hash;
}

export function getTrustedDevice(): string | null {
  return localStorage.getItem(DEVICE_KEY);
}

export function setTrustedDevice() {
  localStorage.setItem(DEVICE_KEY, generateDeviceId());
}

export function clearTrustedDevice() {
  localStorage.removeItem(DEVICE_KEY);
}

export function isDeviceTrusted(): boolean {
  const stored = getTrustedDevice();
  if (!stored) return false;
  return stored === generateDeviceId();
}

export function recordFailedAttempt() {
  const attempts = parseInt(localStorage.getItem(FAILED_ATTEMPTS_KEY) || "0") + 1;
  localStorage.setItem(FAILED_ATTEMPTS_KEY, String(attempts));
  return attempts;
}

export function clearFailedAttempts() {
  localStorage.removeItem(FAILED_ATTEMPTS_KEY);
}

export function getFailedAttempts(): number {
  return parseInt(localStorage.getItem(FAILED_ATTEMPTS_KEY) || "0");
}

export function startSession() {
  localStorage.setItem(SESSION_KEY, String(Date.now()));
}

export function getSessionDuration(): number {
  const start = localStorage.getItem(SESSION_KEY);
  if (!start) return 0;
  return Date.now() - parseInt(start);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function enableScreenshotProtection() {
  document.body.classList.add("screenshot-protected");
  document.addEventListener("keyup", (e) => {
    if ((e.key === "PrintScreen" || e.key === "Print") && !e.repeat) {
      navigator.clipboard.writeText("Screenshot blocked by CLOAK security");
    }
  });
}

export function disableScreenshotProtection() {
  document.body.classList.remove("screenshot-protected");
}

export function enableClipboardProtection() {
  document.addEventListener("copy", (e) => {
    const selection = window.getSelection()?.toString();
    if (selection && selection.length > 0) {
      e.preventDefault();
      e.clipboardData?.setData("text/plain", "[Protected by CLOAK]");
    }
  });
}

export function detectSuspiciousActivity(): boolean {
  const consoleDetection = /./;
  consoleDetection.toString = function() {
    return "DevTools detected";
  };
  const start = performance.now();
  const debuggerCheck = () => {
    const end = performance.now();
    return end - start > 100;
  };
  return debuggerCheck();
}

export function lockdownMode() {
  document.body.style.filter = "blur(20px)";
  document.body.style.userSelect = "none";
  document.body.style.pointerEvents = "none";
}

export function unlockMode() {
  document.body.style.filter = "none";
  document.body.style.userSelect = "auto";
  document.body.style.pointerEvents = "auto";
}

// --- New security features ---

let devToolsHandler: ((e: KeyboardEvent) => void) | null = null;

export function enableDevToolsBlock() {
  devToolsHandler = (e: KeyboardEvent) => {
    const blocked =
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) ||
      (e.ctrlKey && (e.key === "U" || e.key === "u"));
    if (blocked) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  document.addEventListener("keydown", devToolsHandler, true);
}

export function disableDevToolsBlock() {
  if (devToolsHandler) {
    document.removeEventListener("keydown", devToolsHandler, true);
    devToolsHandler = null;
  }
}

let contextMenuHandler: ((e: MouseEvent) => void) | null = null;

export function enableRightClickDisable() {
  contextMenuHandler = (e: MouseEvent) => e.preventDefault();
  document.addEventListener("contextmenu", contextMenuHandler);
}

export function disableRightClickDisable() {
  if (contextMenuHandler) {
    document.removeEventListener("contextmenu", contextMenuHandler);
    contextMenuHandler = null;
  }
}

let visibilityHandler: (() => void) | null = null;

export function enableTabVisibilityLock(onLock: () => void) {
  visibilityHandler = () => {
    if (document.hidden) {
      onLock();
    }
  };
  document.addEventListener("visibilitychange", visibilityHandler);
}

export function disableTabVisibilityLock() {
  if (visibilityHandler) {
    document.removeEventListener("visibilitychange", visibilityHandler);
    visibilityHandler = null;
  }
}

let devToolsDetectionInterval: ReturnType<typeof setInterval> | null = null;

export function enablePanicOnDevToolsDetection(onPanic: () => void) {
  devToolsDetectionInterval = setInterval(() => {
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth > threshold;
    const heightDiff = window.outerHeight - window.innerHeight > threshold;
    if (widthDiff || heightDiff) {
      onPanic();
    }
  }, 1000);
}

export function disablePanicOnDevToolsDetection() {
  if (devToolsDetectionInterval) {
    clearInterval(devToolsDetectionInterval);
    devToolsDetectionInterval = null;
  }
}

export function isDecoyPassword(input: string): boolean {
  const settings = loadSecuritySettings();
  return (
    settings.decoyPassword.length > 0 &&
    input === settings.decoyPassword
  );
}

export function emergencyWipe() {
  const keysToKeep: string[] = [];
  const preserve: Record<string, string> = {};
  keysToKeep.forEach((k) => {
    const v = localStorage.getItem(k);
    if (v !== null) preserve[k] = v;
  });
  localStorage.clear();
  keysToKeep.forEach((k) => {
    if (preserve[k] !== undefined) localStorage.setItem(k, preserve[k]);
  });
}

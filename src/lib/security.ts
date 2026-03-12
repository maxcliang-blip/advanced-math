export interface SecuritySettings {
  enableSafeMode: boolean;
  enableActivityMonitor: boolean;
  enableScreenshotProtection: boolean;
  enableClipboardProtection: boolean;
  trustedDeviceOnly: boolean;
  sessionTimeout: number;
  requireReauth: boolean;
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

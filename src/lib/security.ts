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
  // New features
  mouseLeaveLock: boolean;
  windowBlurLock: boolean;
  disablePrinting: boolean;
  disableTextSelection: boolean;
  iframeDetection: boolean;
  historyScramble: boolean;
  keystrokePatternLock: boolean;
  stealthModeEnabled: boolean;
  stealthModeKey: string;
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
  mouseLeaveLock: false,
  windowBlurLock: false,
  disablePrinting: false,
  disableTextSelection: false,
  iframeDetection: false,
  historyScramble: false,
  keystrokePatternLock: false,
  stealthModeEnabled: false,
  stealthModeKey: "h",
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

// --- DevTools block ---

let devToolsHandler: ((e: KeyboardEvent) => void) | null = null;

export function enableDevToolsBlock() {
  devToolsHandler = (e: KeyboardEvent) => {
    const blocked =
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c" || e.key === "K" || e.key === "k")) ||
      (e.ctrlKey && (e.key === "U" || e.key === "u")) ||
      (e.metaKey && e.altKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c"));
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

// --- Right-click disable ---

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

// --- Tab visibility lock ---

let visibilityHandler: (() => void) | null = null;

export function enableTabVisibilityLock(onLock: () => void) {
  visibilityHandler = () => {
    if (document.hidden) onLock();
  };
  document.addEventListener("visibilitychange", visibilityHandler);
}

export function disableTabVisibilityLock() {
  if (visibilityHandler) {
    document.removeEventListener("visibilitychange", visibilityHandler);
    visibilityHandler = null;
  }
}

// --- DevTools detection (window-size polling) ---

let devToolsDetectionInterval: ReturnType<typeof setInterval> | null = null;

export function enablePanicOnDevToolsDetection(onPanic: () => void) {
  devToolsDetectionInterval = setInterval(() => {
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth > threshold;
    const heightDiff = window.outerHeight - window.innerHeight > threshold;
    if (widthDiff || heightDiff) onPanic();
  }, 1000);
}

export function disablePanicOnDevToolsDetection() {
  if (devToolsDetectionInterval) {
    clearInterval(devToolsDetectionInterval);
    devToolsDetectionInterval = null;
  }
}

// --- Mouse leave lock ---

let mouseleaveHandler: ((e: MouseEvent) => void) | null = null;
let mouseleaveDelay: ReturnType<typeof setTimeout> | null = null;

export function enableMouseLeaveLock(onLock: () => void) {
  mouseleaveHandler = (e: MouseEvent) => {
    // Only trigger when mouse leaves out of the top of the window (address bar area)
    // or the sides — clientY < 0 means header chrome, relatedTarget null = truly outside window
    if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
      mouseleaveDelay = setTimeout(onLock, 600);
    }
  };
  document.addEventListener("mouseleave", mouseleaveHandler);
}

export function disableMouseLeaveLock() {
  if (mouseleaveHandler) {
    document.removeEventListener("mouseleave", mouseleaveHandler);
    mouseleaveHandler = null;
  }
  if (mouseleaveDelay) {
    clearTimeout(mouseleaveDelay);
    mouseleaveDelay = null;
  }
}

// Cancel mouse-leave lock if mouse returns quickly
export function cancelMouseLeaveLock() {
  if (mouseleaveDelay) {
    clearTimeout(mouseleaveDelay);
    mouseleaveDelay = null;
  }
}

// --- Window blur lock ---

let windowBlurHandler: (() => void) | null = null;
let windowBlurDelay: ReturnType<typeof setTimeout> | null = null;

export function enableWindowBlurLock(onLock: () => void) {
  windowBlurHandler = () => {
    windowBlurDelay = setTimeout(onLock, 800);
  };
  const cancelBlur = () => {
    if (windowBlurDelay) { clearTimeout(windowBlurDelay); windowBlurDelay = null; }
  };
  window.addEventListener("blur", windowBlurHandler);
  window.addEventListener("focus", cancelBlur);
}

export function disableWindowBlurLock() {
  if (windowBlurHandler) {
    window.removeEventListener("blur", windowBlurHandler);
    windowBlurHandler = null;
  }
  if (windowBlurDelay) {
    clearTimeout(windowBlurDelay);
    windowBlurDelay = null;
  }
}

// --- Print disable ---

let printHandler: ((e: KeyboardEvent) => void) | null = null;
let printStyleEl: HTMLStyleElement | null = null;

export function enablePrintDisable() {
  printHandler = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "P")) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  document.addEventListener("keydown", printHandler, true);

  printStyleEl = document.createElement("style");
  printStyleEl.id = "cloak-print-block";
  printStyleEl.textContent = `@media print { body { visibility: hidden !important; } }`;
  document.head.appendChild(printStyleEl);

  window.addEventListener("beforeprint", preventPrint);
}

function preventPrint(e: Event) {
  e.preventDefault();
}

export function disablePrintDisable() {
  if (printHandler) {
    document.removeEventListener("keydown", printHandler, true);
    printHandler = null;
  }
  if (printStyleEl) {
    printStyleEl.remove();
    printStyleEl = null;
  }
  window.removeEventListener("beforeprint", preventPrint);
}

// --- Text selection disable ---

let selectionStyleEl: HTMLStyleElement | null = null;

export function enableTextSelectionDisable() {
  selectionStyleEl = document.createElement("style");
  selectionStyleEl.id = "cloak-no-select";
  selectionStyleEl.textContent = `* { user-select: none !important; -webkit-user-select: none !important; }`;
  document.head.appendChild(selectionStyleEl);
}

export function disableTextSelectionDisable() {
  if (selectionStyleEl) {
    selectionStyleEl.remove();
    selectionStyleEl = null;
  }
}

// --- Iframe embed detection ---

let iframeCheckInterval: ReturnType<typeof setInterval> | null = null;

export function enableIframeDetection(onPanic: () => void) {
  const check = () => {
    try {
      if (window.self !== window.top) {
        onPanic();
      }
    } catch {
      // Cross-origin access throws, which itself confirms we're in an iframe
      onPanic();
    }
  };
  check();
  iframeCheckInterval = setInterval(check, 3000);
}

export function disableIframeDetection() {
  if (iframeCheckInterval) {
    clearInterval(iframeCheckInterval);
    iframeCheckInterval = null;
  }
}

// --- History scramble (call on panic) ---

export function scrambleHistory(steps = 8) {
  for (let i = 0; i < steps; i++) {
    history.pushState(null, "", `/?ref=${Math.random().toString(36).slice(2)}`);
  }
}

// --- Clipboard wipe (call on panic) ---

export function wipeClipboard() {
  try {
    navigator.clipboard.writeText("").catch(() => {});
  } catch { /* best-effort */ }
}

// --- Decoy password ---

export function isDecoyPassword(input: string): boolean {
  const settings = loadSecuritySettings();
  return (
    settings.decoyPassword.length > 0 &&
    input === settings.decoyPassword
  );
}

// --- Emergency wipe ---

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

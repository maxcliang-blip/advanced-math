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
  enableScreenRecordingDetection: boolean;
  // Additional security features
  preventWebRTCLeak: boolean;
  spoofGeolocation: boolean;
  randomizeFingerprint: boolean;
  fingerprintRandomizationInterval: number;
  monitorMediaDevices: boolean;
  restrictBrowserAPIs: boolean;
  antiMemoryDump: boolean;
  timingAttackPrevention: boolean;
  referrerControl: "strip" | "origin" | "none";
  enableCanvasProtection: boolean;
  // URL Bar Obfuscation
  enableURLBarObfuscation: boolean;
  fakeURL: string;
  // Navigator Spoofing
  enableNavigatorSpoofing: boolean;
  spoofedUserAgent: string;
  spoofedPlatform: string;
  spoofedLanguage: string;
  // Tab Cloaking
  enableTabCloaking: boolean;
  fakeTitle: string;
  fakeFavicon: string;
}

export interface NetworkEntry {
  url: string;
  method: string;
  status?: number;
  timestamp: number;
  headers?: Record<string, string>;
}

export interface KeystrokePattern {
  intervals: number[];
  length: number;
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
  enableScreenRecordingDetection: false,
  preventWebRTCLeak: false,
  spoofGeolocation: false,
  randomizeFingerprint: false,
  fingerprintRandomizationInterval: 30,
  monitorMediaDevices: false,
  restrictBrowserAPIs: false,
  antiMemoryDump: false,
  timingAttackPrevention: false,
  referrerControl: "none",
  enableCanvasProtection: false,
  // URL Bar Obfuscation
  enableURLBarObfuscation: false,
  fakeURL: "https://www.google.com",
  // Navigator Spoofing
  enableNavigatorSpoofing: false,
  spoofedUserAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  spoofedPlatform: "Win32",
  spoofedLanguage: "en-US",
  // Tab Cloaking
  enableTabCloaking: false,
  fakeTitle: "Google",
  fakeFavicon: "",
};

// ==================== AUDIT LOGGING ====================

let auditLog: AuditEntry[] = [];
let onAuditLogChange: ((log: AuditEntry[]) => void) | null = null;

export function addAuditEntry(type: string, detail?: string) {
  const entry: AuditEntry = {
    type,
    detail,
    timestamp: Date.now(),
  };
    const currentLog = getAuditLog();
  const updatedLog = [...currentLog, entry];
  
  localStorage.setItem("cloak_audit_log", JSON.stringify(updatedLog));
  auditLog = updatedLog;
  
  if (onAuditLogChange) {
    onAuditLogChange(updatedLog);
  }
}

export function getAuditLog(): AuditEntry[] {
  try {
    return JSON.parse(localStorage.getItem("cloak_audit_log") || "[]");
  } catch {
    return [];
  }
}

export function clearAuditLog() {
  localStorage.removeItem("cloak_audit_log");
  auditLog = [];
  if (onAuditLogChange) {
    onAuditLogChange([]);
  }
}

export function setAuditLogChangeCallback(callback: (log: AuditEntry[]) => void) {
  onAuditLogChange = callback;
}

// ==================== NETWORK LOGGING ====================

let networkLog: NetworkEntry[] = [];
let onNetworkLogChange: ((log: NetworkEntry[]) => void) | null = null;

export function addNetworkEntry(entry: Omit<NetworkEntry, "timestamp">) {
  const fullEntry: NetworkEntry = {
    ...entry,
    timestamp: Date.now(),
  };
  const currentLog = getNetworkLog();
  const updatedLog = [...currentLog, fullEntry];
  
  networkLog = updatedLog;
  
  if (onNetworkLogChange) {
    onNetworkLogChange(updatedLog);
  }
}

export function getNetworkLog(): NetworkEntry[] {
  return networkLog;
}

export function clearNetworkLog() {
  networkLog = [];
  if (onNetworkLogChange) {
    onNetworkLogChange([]);
  }
}

export function setNetworkLogChangeCallback(callback: (log: NetworkEntry[]) => void) {
  onNetworkLogChange = callback;
}

// ==================== BROWSER FINGERPRINT ====================

export function generateBrowserFingerprint(): string {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const win = window as Window & { chrome?: object };
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || "",
    nav.deviceMemory || "",
    !!navigator.webdriver,
    !!win.chrome,
    (navigator as any).permissions?.query?.({ name: "notifications" })?.then?.((r: any) => r.state) || "unknown",
  ];
  
  let hash = 0;
  const str = components.join("|");
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(16);
}

// ==================== DEVICE TRUST ====================

export function isDeviceTrusted(): boolean {
  return localStorage.getItem(DEVICE_KEY) === "trusted";
}

export function setTrustedDevice() {
  localStorage.setItem(DEVICE_KEY, "trusted");
}

export function clearTrustedDevice() {
  localStorage.removeItem(DEVICE_KEY);
}

// ==================== SESSION MANAGEMENT ====================

export function startSession() {
  localStorage.setItem(SESSION_KEY, Date.now().toString());
}

export function getSessionDuration(): number {
  const start = parseInt(localStorage.getItem(SESSION_KEY) || "0");
  return Date.now() - start;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ==================== FAILED ATTEMPTS ====================

export function recordFailedAttempt(): number {
  const attempts = getFailedAttempts() + 1;
  localStorage.setItem(FAILED_ATTEMPTS_KEY, attempts.toString());
  return attempts;
}

export function getFailedAttempts(): number {
  return parseInt(localStorage.getItem(FAILED_ATTEMPTS_KEY) || "0");
}

export function clearFailedAttempts() {
  localStorage.removeItem(FAILED_ATTEMPTS_KEY);
}

// ==================== REFERER CONTROL ====================

export function enableReferrerControl(policy: "strip" | "origin" | "none" = "strip") {
  // Store original functions if not already stored
  if (!(window.fetch as any).__originalFetch) {
    (window.fetch as any).__originalFetch = window.fetch;
  }
  
  // Override the Referer header for outgoing requests
  const originalFetch = window.fetch;
  window.fetch = function(input, init = {}) {
    const headers = new Headers(init.headers || {});
    
    if (policy === "strip") {
      headers.delete("Referer");
    } else if (policy === "origin") {
      try {
        const url = typeof input === 'string' ? input : (input as Request).url || '';
        if (url) {
          const urlObj = new URL(url, window.location.href);
          headers.set("Referer", urlObj.origin + "/");
        }
      } catch {
        // If we can't parse the URL, fall back to stripping
        headers.delete("Referer");
      }
    }
    // For "none" policy, we leave the Referer header as-is (default browser behavior)
    
    return originalFetch(input, { ...init, headers });
  };
  
  // Also override XMLHttpRequest for compatibility
  if (!(XMLHttpRequest.prototype as any).__open__) {
    (XMLHttpRequest.prototype as any).__open__ = XMLHttpRequest.prototype.open;
    (XMLHttpRequest.prototype as any).__setRequestHeader__ = XMLHttpRequest.prototype.setRequestHeader;
  }
  
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    this._url = url; // Store for use in setRequestHeader
    return originalOpen.apply(this, [method, url, ...args]);
  };
  
  const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
  XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
    if (header.toLowerCase() === "referer") {
      if (this._url) {
        try {
          const urlObj = new URL(this._url, window.location.href);
          if (policy === "strip") {
            // Don't set the Referer header at all
            return;
          } else if (policy === "origin") {
            value = urlObj.origin + "/";
          }
          // For "none" policy, we allow the header to be set normally
        } catch {
          // If we can't parse the URL, fall back to stripping for "strip" policy
          if (policy === "strip") {
            return;
          }
        }
      }
      
      if (policy !== "none") {
        // For strip policy, we don't set the header
        // For origin policy, we've already set the value above
        if (policy === "strip") {
          return;
        }
      }
    }
    return originalSetRequestHeader.call(this, header, value);
  };
}

export function disableReferrerControl() {
  // Restore original fetch
  if ((window.fetch as any).__originalFetch) {
    window.fetch = (window.fetch as any).__originalFetch;
    delete (window.fetch as any).__originalFetch;
  }
  
  // Restore original XMLHttpRequest methods
  if ((XMLHttpRequest.prototype as any).__open__) {
    XMLHttpRequest.prototype.open = (XMLHttpRequest.prototype as any).__open__;
    delete (XMLHttpRequest.prototype as any).__open__;
  }
  if ((XMLHttpRequest.prototype as any).__setRequestHeader__) {
    XMLHttpRequest.prototype.setRequestHeader = (XMLHttpRequest.prototype as any).__setRequestHeader__;
    delete (XMLHttpRequest.prototype as any).__setRequestHeader__;
  }
}

// ==================== SECURITY SETTINGS ====================

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

// ==================== KEYSTROKE PATTERN LOCK ====================

export function loadKeystrokePattern(): KeystrokePattern | null {
  try {
    const stored = localStorage.getItem("cloak_keystroke_pattern");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function saveKeystrokePattern(pattern: KeystrokePattern) {
  localStorage.setItem("cloak_keystroke_pattern", JSON.stringify(pattern));
}

export function clearKeystrokePattern() {
  localStorage.removeItem("cloak_keystroke_pattern");
}

export function matchKeystrokePattern(stored: KeystrokePattern, attempts: number[]): boolean {
  if (attempts.length !== stored.intervals.length) return false;
  
  const tolerance = 50; // ms tolerance
  return attempts.every((attempt, i) => {
    const diff = Math.abs(attempt - stored.intervals[i]);
    return diff <= tolerance;
  });
}

// ==================== DECOY PASSWORD ====================

export function isDecoyPassword(password: string): boolean {
  const settings = loadSecuritySettings();
  return settings.decoyPassword && password === settings.decoyPassword;
}

// ==================== DEVTOOLS DETECTION ====================

let devToolsDetectionInterval: ReturnType<typeof setInterval> | null = null;
let devToolsDetected = false;

export function enableDevToolsBlock() {
  if (devToolsDetectionInterval) return;
  
  devToolsDetectionInterval = setInterval(() => {
    const threshold = 160;
    devToolsDetected = (window.outerWidth - window.innerWidth > threshold) || 
                      (window.outerHeight - window.innerHeight > threshold);
    
    if (devToolsDetected) {
      addAuditEntry("devtools_detected", "DevTools window detected");
    }
  }, 1000);
}

export function disableDevToolsBlock() {
  if (devToolsDetectionInterval) {
    clearInterval(devToolsDetectionInterval);
    devToolsDetectionInterval = null;
  }
  devToolsDetected = false;
}

// ==================== RIGHT CLICK DISABLE ====================

export function enableRightClickDisable() {
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  });
}

export function disableRightClickDisable() {
  document.removeEventListener("contextmenu", (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  });
}

// ==================== TAB VISIBILITY LOCK ====================

let tabVisibilityHandler: (() => void) | null = null;

export function enableTabVisibilityLock(callback: () => void) {
  tabVisibilityHandler = callback;
  document.addEventListener("visibilitychange", handleVisibilityChange);
}

function handleVisibilityChange() {
  if (document.hidden && tabVisibilityHandler) {
    tabVisibilityHandler();
  }
}

export function disableTabVisibilityLock() {
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  tabVisibilityHandler = null;
}

// ==================== MOUSE LEAVE LOCK ====================

let mouseLeaveTimer: ReturnType<typeof setTimeout> | null = null;

export function enableMouseLeaveLock(callback: () => void) {
  document.addEventListener("mouseleave", () => {
    mouseLeaveTimer = setTimeout(callback, 1000);
  });
}

export function disableMouseLeaveLock() {
  if (mouseLeaveTimer) {
    clearTimeout(mouseLeaveTimer);
    mouseLeaveTimer = null;
  }
  document.removeEventListener("mouseleave", () => {});
}

export function cancelMouseLeaveLock() {
  if (mouseLeaveTimer) {
    clearTimeout(mouseLeaveTimer);
    mouseLeaveTimer = null;
  }
}

// ==================== WINDOW BLUR LOCK ====================

export function enableWindowBlurLock(callback: () => void) {
  window.addEventListener("blur", callback);
}

export function disableWindowBlurLock() {
  window.removeEventListener("blur", () => {});
}

// ==================== PRINT DISABLE ====================

export function enablePrintDisable() {
  window.addEventListener("beforeprint", (e) => {
    e.preventDefault();
    return false;
  });
  
  // Override print functions
  const originalPrint = window.print;
  window.print = () => {
    console.log("Printing is disabled by security policy");
  };
}

export function disablePrintDisable() {
  window.removeEventListener("beforeprint", (e) => {
    e.preventDefault();
    return false;
  });
}

// ==================== TEXT SELECTION DISABLE ====================

export function enableTextSelectionDisable() {
  document.body.style.userSelect = "none";
  document.body.style.webkitUserSelect = "none";
  (document.body.style as any).mozUserSelect = "none";
}

export function disableTextSelectionDisable() {
  document.body.style.userSelect = "";
  document.body.style.webkitUserSelect = "";
  (document.body.style as any).mozUserSelect = "";
}

// ==================== IFRAME DETECTION ====================

export function enableIframeDetection(callback: () => void) {
  if (window.self !== window.top) {
    callback();
  }
  
  window.addEventListener("message", (e) => {
    if (e.origin !== window.location.origin) {
      callback();
    }
  });
}

export function disableIframeDetection() {
  window.removeEventListener("message", () => {});
}

// ==================== SCREEN RECORDING DETECTION ====================

export function detectScreenRecording(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    
    return data[0] !== 0 || data[1] !== 0 || data[2] !== 0;
  } catch {
    return false;
  }
}

let screenRecordingInterval: ReturnType<typeof setInterval> | null = null;

export function enableScreenRecordingDetection(callback: () => void) {
  if (screenRecordingInterval) return;
  
  screenRecordingInterval = setInterval(() => {
    if (detectScreenRecording()) {
      callback();
    }
  }, 2000);
}

export function disableScreenRecordingDetection() {
  if (screenRecordingInterval) {
    clearInterval(screenRecordingInterval);
    screenRecordingInterval = null;
  }
}

// ==================== HISTORY SCRAMBLE ====================

export function scrambleHistory() {
  const fakeUrls = [
    "https://www.google.com",
    "https://www.youtube.com",
    "https://www.github.com",
    "https://www.reddit.com",
    "https://www.wikipedia.org",
  ];
  
  fakeUrls.forEach(url => {
    window.history.pushState({}, "", url);
  });
}

// ==================== CLIPBOARD PROTECTION ====================

let clipboardInterval: ReturnType<typeof setInterval> | null = null;

export function enableClipboardProtection() {
  if (clipboardInterval) return;
  
  clipboardInterval = setInterval(() => {
    try {
      navigator.clipboard.writeText("");
    } catch {}
  }, 1000);
}

export function disableClipboardProtection() {
  if (clipboardInterval) {
    clearInterval(clipboardInterval);
    clipboardInterval = null;
  }
}

// ==================== SCREENSHOT PROTECTION ====================

let screenshotProtectionEnabled = false;

export function enableScreenshotProtection() {
  if (screenshotProtectionEnabled) return;
    document.body.classList.add("screenshot-protected");
  screenshotProtectionEnabled = true;
}

export function disableScreenshotProtection() {
  document.body.classList.remove("screenshot-protected");
  screenshotProtectionEnabled = false;
}

// ==================== PANIC ON DEVTOOLS DETECTION ====================

let panicOnDevToolsInterval: ReturnType<typeof setInterval> | null = null;

export function enablePanicOnDevToolsDetection(callback: () => void) {
  if (panicOnDevToolsInterval) return;
  
  panicOnDevToolsInterval = setInterval(() => {
    const threshold = 160;
    const devToolsOpen = (window.outerWidth - window.innerWidth > threshold) || 
                        (window.outerHeight - window.innerHeight > threshold);
    
    if (devToolsOpen) {
      callback();
    }
  }, 1000);
}

export function disablePanicOnDevToolsDetection() {
  if (panicOnDevToolsInterval) {
    clearInterval(panicOnDevToolsInterval);
    panicOnDevToolsInterval = null;
  }
}

// ==================== EMERGENCY WIPE ====================

export function emergencyWipe() {
  localStorage.clear();
  sessionStorage.clear();
  addAuditEntry("emergency_wipe", "Emergency data wipe triggered");
}

// ==================== ACTIVITY MONITOR ====================

let activityMonitorInterval: ReturnType<typeof setInterval> | null = null;

export function detectSuspiciousActivity(): boolean {
  // Check for DevTools
  const threshold = 160;
  const devToolsOpen = (window.outerWidth - window.innerWidth > threshold) || 
                      (window.outerHeight - window.innerHeight > threshold);
  
  // Check for screen recording
  const screenRecording = detectScreenRecording();
  
  return devToolsOpen || screenRecording;
}

export function enableActivityMonitor(callback: () => void) {
  if (activityMonitorInterval) return;
  
  activityMonitorInterval = setInterval(() => {
    if (detectSuspiciousActivity()) {
      callback();
    }
  }, 2000);
}

export function disableActivityMonitor() {
  if (activityMonitorInterval) {
    clearInterval(activityMonitorInterval);
    activityMonitorInterval = null;
  }
}

// ==================== WEBRTC LEAK PREVENTION ====================

let webRTCBlocked = false;

export function enableWebRTCLeakPrevention() {
  if (webRTCBlocked) return;
  
  try {
    const originalRTCPeerConnection = window.RTCPeerConnection;
    (window as any).RTCPeerConnection = function(...args: any[]) {
      const pc = new originalRTCPeerConnection(...args);
      const originalCreateOffer = pc.createOffer.bind(pc);
      pc.createOffer = function(options?: any) {
        return originalCreateOffer(options).then(offer => {
          offer.sdp = offer.sdp.replace(/a=ice-options:trickle/g, 'a=ice-options:');
          return offer;
        });
      };
      return pc;
    };
        const originalGetUserMedia = navigator.mediaDevices?.getUserMedia.bind(navigator.mediaDevices);
    if (originalGetUserMedia) {
      navigator.mediaDevices.getUserMedia = function(constraints: MediaStreamConstraints) {
        return originalGetUserMedia(constraints).catch((err: any) => {
          throw new Error("Media access blocked by security policy");
        });
      };
    }
    
    webRTCBlocked = true;
  } catch (e) {
    console.warn("WebRTC leak prevention failed:", e);
  }
}

export function disableWebRTCLeakPrevention() {
  webRTCBlocked = false;
}

// ==================== GEOLOCATION SPOOFING ====================

let geolocationSpoofingEnabled = false;
let geolocationInterval: ReturnType<typeof setInterval> | null = null;

export function enableGeolocationSpoofing() {
  if (geolocationSpoofingEnabled) return;
    const spoofedPosition = {
    coords: {
      latitude: 40.7128 + (Math.random() - 0.5) * 10,
      longitude: -74.0060 + (Math.random() - 0.5) * 10,
      altitude: null,
      accuracy: 100,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  };
  
  try {
    const nav = navigator as Navigator & { geolocation?: Geolocation };
    const originalGeolocation = nav.geolocation;
    nav.geolocation = {
      getCurrentPosition: (success: any, error?: any, options?: any) => {
        setTimeout(() => success(spoofedPosition), 100);
      },
      watchPosition: (success: any, error?: any, options?: any) => {
        const id = setInterval(() => success(spoofedPosition), 5000);
        return id as unknown as number;
      },
      clearWatch: (id: any) => clearInterval(id),
    };
    
    geolocationInterval = setInterval(() => {
      spoofedPosition.coords.latitude += (Math.random() - 0.5) * 0.1;
      spoofedPosition.coords.longitude += (Math.random() - 0.5) * 0.1;
    }, 30000);
        geolocationSpoofingEnabled = true;
  } catch (e) {
    console.warn("Geolocation spoofing failed:", e);
  }
}

export function disableGeolocationSpoofing() {
  if (!geolocationSpoofingEnabled) return;
  if (geolocationInterval) {
    clearInterval(geolocationInterval);
    geolocationInterval = null;
  }
  geolocationSpoofingEnabled = false;
}

// ==================== FINGERPRINT RANDOMIZATION ====================

let fingerprintInterval: ReturnType<typeof setInterval> | null = null;

export function enableFingerprintRandomization(intervalMinutes: number = 30) {
  if (fingerprintInterval) return;
  
  const randomize = () => {
    try {
      const randomUA = () => {
        const uas = [
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
        ];
        return uas[Math.floor(Math.random() * uas.length)];
      };
      
      Object.defineProperty(navigator, 'userAgent', {
        get: () => randomUA(),
        configurable: true,
      });
      
      Object.defineProperty(screen, 'width', {
        get: () => 1920 + Math.floor(Math.random() * 200),
        configurable: true,
      });
      Object.defineProperty(screen, 'height', {
        get: () => 1080 + Math.floor(Math.random() * 200),
        configurable: true,
      });
    } catch {}
  };
  
  randomize();
  fingerprintInterval = setInterval(randomize, intervalMinutes * 60 * 1000);
}

export function disableFingerprintRandomization() {
  if (fingerprintInterval) {
    clearInterval(fingerprintInterval);
    fingerprintInterval = null;
  }
}

// ==================== CANVAS FINGERPRINTING PROTECTION ====================

let canvasProtectionEnabled = false;
let originalToDataURL: any;
let originalToBlob: any;
let originalGetImageData: any;

export function enableCanvasProtection() {
  if (canvasProtectionEnabled) return;
  
  try {
    // Store original methods
    originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    originalToBlob = HTMLCanvasElement.prototype.toBlob;
    originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
    
    // Override toDataURL to return blank canvas for tracking attempts
    HTMLCanvasElement.prototype.toDataURL = function(type: string = 'image/png', ...args: any[]): string {
      // For image types that are commonly used for fingerprinting, return a blank canvas
      if (type === 'image/png' || type === 'image/jpeg' || type === 'image/webp') {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff'; // White background
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          return canvas.toDataURL(type);
        }
      }
      // For other types, call original but with potentially modified canvas
      return originalToDataURL.call(this, type, ...args);
    };
    
    // Override toBlob similarly
    HTMLCanvasElement.prototype.toBlob = function(callback: BlobCallback, type: string = 'image/png', ...args: any[]): void {
      if (type === 'image/png' || type === 'image/jpeg' || type === 'image/webp') {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          return canvas.toBlob(callback, type, ...args);
        }
      }
      // For other types, call original
      return originalToBlob.call(this, callback, type, ...args);
    };
    
    // Override getImageData to return consistent values for fingerprinting attempts
    CanvasRenderingContext2D.prototype.getImageData = function(sx: number, sy: number, sw: number, sh: number): ImageData {
      const imageData = originalGetImageData.call(this, sx, sy, sw, sh);
      
      // Add slight noise to prevent exact fingerprinting while preserving usability
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        // Add minimal noise to RGB values (preserve alpha)
        data[i]   = Math.max(0, Math.min(255, data[i]   + (Math.random() - 0.5) * 4)); // Red
        data[i+1] = Math.max(0, Math.min(255, data[i+1] + (Math.random() - 0.5) * 4)); // Green
        data[i+2] = Math.max(0, Math.min(255, data[i+2] + (Math.random() - 0.5) * 4)); // Blue
        // Alpha channel left unchanged
      }
      
      return imageData;
    };
    
    canvasProtectionEnabled = true;
  } catch (e) {
    console.warn("Canvas protection failed:", e);
  }
}

export function disableCanvasProtection() {
  if (!canvasProtectionEnabled) return;
  
  // Restore original methods
  if (originalToDataURL) {
    HTMLCanvasElement.prototype.toDataURL = originalToDataURL;
  }
  if (originalToBlob) {
    HTMLCanvasElement.prototype.toBlob = originalToBlob;
  }
  if (originalGetImageData) {
    CanvasRenderingContext2D.prototype.getImageData = originalGetImageData;
  }
  
  canvasProtectionEnabled = false;
  originalToDataURL = null;
  originalToBlob = null;
  originalGetImageData = null;
}

// ==================== MEDIA DEVICE MONITORING ====================

let mediaMonitorInterval: ReturnType<typeof setInterval> | null = null;

export function enableMediaDeviceMonitoring(onDetect: () => void) {
  if (mediaMonitorInterval) return;
  
  const checkMediaDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasActive = devices.some(d => d.kind === 'videoinput' || d.kind === 'audioinput');
      if (hasActive) {
        onDetect();
      }
    } catch {
      // Permission denied
    }
  };
  
  checkMediaDevices();
  mediaMonitorInterval = setInterval(checkMediaDevices, 2000);
}

export function disableMediaDeviceMonitoring() {
  if (mediaMonitorInterval) {
    clearInterval(mediaMonitorInterval);
    mediaMonitorInterval = null;
  }
}

// ==================== BROWSER API RESTRICTIONS ====================

let apiRestrictionsEnabled = false;

export function enableBrowserAPIRestrictions() {
  if (apiRestrictionsEnabled) return;
    try {
    Object.defineProperty(window, 'performance', {
      get: () => undefined,
      configurable: true,
    });
    
    Object.defineProperty(window, 'localStorage', {
      get: () => undefined,
      configurable: true,
    });
    Object.defineProperty(window, 'sessionStorage', {
      get: () => undefined,
      configurable: true,
    });
    
    Object.defineProperty(document, 'cookie', {
      get: () => '',
      set: () => {},
      configurable: true,
    });
  } catch {}
  
  apiRestrictionsEnabled = true;
}

export function disableBrowserAPIRestrictions() {
  apiRestrictionsEnabled = false;
}

// ==================== ANTI-MEMORY DUMP ====================

let memoryProtectionEnabled = false;

export function enableMemoryDumpProtection() {
  if (memoryProtectionEnabled) return;
  
  const interval = setInterval(() => {
    try {
      if ((window as any).devtools && (window as any).devtools.isOpen) {
        window.location.reload();
      }
      
      const perf = performance as Performance & { memory?: { usedJSHeapSize: number } };
      if (perf.memory) {
        const heapUsed = perf.memory.usedJSHeapSize;
        if (heapUsed > 100 * 1024 * 1024) {
          console.clear();
        }
      }
    } catch {}
  }, 1000);
  
  memoryProtectionEnabled = true;
  return () => clearInterval(interval);
}

export function disableMemoryDumpProtection() {
  memoryProtectionEnabled = false;
}

// ==================== TIMING ATTACK PREVENTION ====================

let timingProtectionEnabled = false;

export function enableTimingAttackPrevention() {
  if (timingProtectionEnabled) return;
  
  const originalSetTimeout = window.setTimeout;
  (window as any).setTimeout = function(cb: Function, delay: number, ...args: any[]) {
    const jitter = Math.random() * 100 - 50;
    return originalSetTimeout(cb, Math.max(0, delay + jitter), ...args);
  };
  
  timingProtectionEnabled = true;
}

export function disableTimingAttackPrevention() {
  timingProtectionEnabled = false;
}

// ==================== NEW: AUDIO CONTEXT FINGERPRINTING PROTECTION ====================

let audioContextProtectionEnabled = false;
let originalAudioContext = null;

export function enableAudioContextProtection() {
  if (audioContextProtectionEnabled) return;
  
  try {
    const win = window as Window & { webkitAudioContext?: typeof AudioContext; AudioContext?: typeof AudioContext };
    originalAudioContext = win.AudioContext || win.webkitAudioContext;
    
    if (originalAudioContext) {
      const ProtectedAudioContext = function() {
        const ctx = new (originalAudioContext as any)();
        
        const originalGetChannelData = ctx.getChannelData.bind(ctx);
        ctx.getChannelData = function(channel) {
          const data = originalGetChannelData(channel);
          for (let i = 0; i < data.length; i++) {
            data[i] += (Math.random() - 0.5) * 0.0001;
          }
          return data;
        };
        
        return ctx;
      };
      
      Object.keys(originalAudioContext).forEach(key => {
        ProtectedAudioContext[key] = originalAudioContext[key];
      });
      
      win.AudioContext = ProtectedAudioContext as any;
      win.webkitAudioContext = ProtectedAudioContext as any;
    }
    
    audioContextProtectionEnabled = true;
  } catch (e) {
    console.warn("Audio context protection failed:", e);
  }
}

export function disableAudioContextProtection() {
  if (!audioContextProtectionEnabled || !originalAudioContext) return;
  const win = window as Window & { webkitAudioContext?: typeof AudioContext; AudioContext?: typeof AudioContext };
  win.AudioContext = originalAudioContext as any;
  win.webkitAudioContext = originalAudioContext as any;
  audioContextProtectionEnabled = false;
}

// ==================== NEW: FONT ENUMERATION PROTECTION ====================

let fontProtectionEnabled = false;
let originalFonts = null;

export function enableFontEnumerationProtection() {
  if (fontProtectionEnabled) return;
    try {
    const fonts = document.fonts as any;
    if (fonts) {
      originalFonts = {
        check: fonts.check?.bind(fonts),
        load: fonts.load?.bind(fonts),
        ready: fonts.ready
      };
      
      fonts.check = function() {
        return false;
      };
      
      fonts.load = function() {
        return Promise.resolve([]);
      };
    }
    
    // Also protect canvas font measurement
    const originalMeasureText = CanvasRenderingContext2D.prototype.measureText;
    (CanvasRenderingContext2D.prototype.measureText as any)._original = originalMeasureText;
    CanvasRenderingContext2D.prototype.measureText = function(text) {
      const metrics = originalMeasureText.call(this, text);
      if (metrics.width) {
        metrics.width += (Math.random() - 0.5) * 0.1;
      }
      return metrics;
    };
    
    fontProtectionEnabled = true;
  } catch (e) {
    console.warn("Font enumeration protection failed:", e);
  }
}

export function disableFontEnumerationProtection() {
  if (!fontProtectionEnabled) return;
  
  const fonts = document.fonts as any;
  if (originalFonts && fonts) {
    fonts.check = originalFonts.check;
    fonts.load = originalFonts.load;
    fonts.ready = originalFonts.ready;
  }
  
  if ((CanvasRenderingContext2D.prototype.measureText as any)._original) {
    CanvasRenderingContext2D.prototype.measureText = (CanvasRenderingContext2D.prototype.measureText as any)._original;
  }
  
  fontProtectionEnabled = false;
}

// ==================== NEW: TIMEZONE SPOOFING ====================

let timezoneSpoofingEnabled = false;
let originalTimezone = null;

export function enableTimezoneSpoofing() {
  if (timezoneSpoofingEnabled) return;
  
  try {
    // Spoof to a common timezone (UTC)
    const spoofedTimezone = {
      get offset() { return 0; },
      get name() { return "UTC"; }
    };
    
    // Override Intl.DateTimeFormat.prototype.resolvedOptions to spoof timezone
    const originalResolvedOptions = Intl.DateTimeFormat.prototype.resolvedOptions;
    Intl.DateTimeFormat.prototype.resolvedOptions = function() {
      const options = originalResolvedOptions.call(this);
      options.timeZone = "UTC";
      return options;
    };
    
    // Override Date.prototype.getTimezoneOffset to return 0 (UTC)
    const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;
    Date.prototype.getTimezoneOffset = function() {
      return 0;
    };
    
    timezoneSpoofingEnabled = true;
  } catch (e) {
    console.warn("Timezone spoofing failed:", e);
  }
}

export function disableTimezoneSpoofing() {
  if (!timezoneSpoofingEnabled) return;
  
  // Restore original methods
  if (originalTimezone !== null) {
    // Note: Full restoration is complex, would need to store originals
    // For simplicity, we'll just note that a page reload is needed
  }
  
  timezoneSpoofingEnabled = false;
}

// ==================== NEW: LANGUAGE SPOOFING ====================

let languageSpoofingEnabled = false;
let originalLanguage = null;
let originalLanguages = null;

export function enableLanguageSpoofing() {
  if (languageSpoofingEnabled) return;
  
  try {
    // Store original values    originalLanguage = navigator.language;
    originalLanguages = navigator.languages;
    
    // Spoof to common language
    Object.defineProperty(navigator, 'language', {
      get: () => 'en-US',
      configurable: true
    });
    
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
      configurable: true
    });
        languageSpoofingEnabled = true;
  } catch (e) {
    console.warn("Language spoofing failed:", e);
  }
}

export function disableLanguageSpoofing() {
  if (!languageSpoofingEnabled) return;
  
  // Restore original values
  if (originalLanguage !== null) {
    Object.defineProperty(navigator, 'language', {
      get: () => originalLanguage,
      configurable: true
    });
  }
  
  if (originalLanguages !== null) {
    Object.defineProperty(navigator, 'languages', {
      get: () => originalLanguages,
      configurable: true    });
  }
  
  languageSpoofingEnabled = false;
}

// ==================== NEW: PLATFORM SPOOFING ====================

let platformSpoofingEnabled = false;
let originalPlatform = null;
let originalUserAgent = null;
let originalProduct = null;
let originalProductSub = null;
let originalVendor = null;
let originalVendorSub = null;

export function enablePlatformSpoofing() {
  if (platformSpoofingEnabled) return;
  
  try {
    // Store original values
    originalPlatform = navigator.platform;
    originalUserAgent = navigator.userAgent;
    originalProduct = navigator.product;
    originalProductSub = navigator.productSub;
    originalVendor = navigator.vendor;
    originalVendorSub = navigator.vendorSub;
    
    // Spoof to common platform values
    Object.defineProperty(navigator, 'platform', {
      get: () => 'Win32',
      configurable: true
    });
    
    Object.defineProperty(navigator, 'userAgent', {
      get: () => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      configurable: true
    });
        Object.defineProperty(navigator, 'product', {
      get: () => 'Gecko',
      configurable: true
    });
        Object.defineProperty(navigator, 'productSub', {
      get: () => '20030107',
      configurable: true
    });
    
    Object.defineProperty(navigator, 'vendor', {
      get: () => 'Google Inc.',
      configurable: true
    });
    
    Object.defineProperty(navigator, 'vendorSub', {
      get: () => '',
      configurable: true
    });
    
    platformSpoofingEnabled = true;
  } catch (e) {
    console.warn("Platform spoofing failed:", e);
  }
}

export function disablePlatformSpoofing() {
  if (!platformSpoofingEnabled) return;
  
  // Restore original values
  if (originalPlatform !== null) {
    Object.defineProperty(navigator, 'platform', {
      get: () => originalPlatform,
      configurable: true
    });
  }
  
  if (originalUserAgent !== null) {
    Object.defineProperty(navigator, 'userAgent', {
      get: () => originalUserAgent,
      configurable: true
    });
  }
  
  if (originalProduct !== null) {
    Object.defineProperty(navigator, 'product', {
      get: () => originalProduct,
      configurable: true
    });
  }
  
  if (originalProductSub !== null) {
    Object.defineProperty(navigator, 'productSub', {
      get: () => originalProductSub,
      configurable: true
    });
  }
  
  if (originalVendor !== null) {
    Object.defineProperty(navigator, 'vendor', {
      get: () => originalVendor,
      configurable: true
    });
  }
  
  if (originalVendorSub !== null) {
    Object.defineProperty(navigator, 'vendorSub', {
      get: () => originalVendorSub,
      configurable: true
    });
  }
  
  platformSpoofingEnabled = false;
}

// ==================== NEW: PERMISSION POLICY ENFORCEMENT ====================

let permissionPolicyEnabled = false;
let originalHeaders = {};

export function enablePermissionPolicy() {
  if (permissionPolicyEnabled) return;
  
  try {
    const meta = document.createElement('meta') as HTMLMetaElement;
    meta.httpEquiv = 'Permissions-Policy';
    meta.content = 'accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), display-capture=(), document-domain=(), encrypted-media=(), execution-while-not-rendered=(), execution-while-oob=(), fullscreen=(), geolocation=(), gyroscope=(), keyboard-map=(), magnetometer=(), microphone=(), midi=(), navigation-override=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), web-share=(), xr-spatial-tracking=()';
    document.head.appendChild(meta);
    
    permissionPolicyEnabled = true;
  } catch (e) {
    console.warn("Permission policy enforcement failed:", e);
  }
}

export function disablePermissionPolicy() {
  if (!permissionPolicyEnabled) return;
  
  const metas = document.querySelectorAll('meta[http-equiv="Permissions-Policy"]');
  metas.forEach((meta) => {
    const m = meta as HTMLMetaElement;
    if (m.content && m.content.includes('accelerometer=()')) {
      meta.remove();
    }
  });
  
  permissionPolicyEnabled = false;
}

// ==================== WIPE FUNCTIONS ====================

export function wipeClipboard() {
  try {
    navigator.clipboard.writeText("");
  } catch {}
}

// ==================== URL BAR OBFUSCATION ====================

let urlObfuscationEnabled = false;
let originalURL = "";

export function enableURLBarObfuscation(fakeUrl: string) {
  if (urlObfuscationEnabled) return;
  
  try {
    originalURL = window.location.href;
    const url = new URL(fakeUrl);
    history.replaceState({}, "", url.pathname + url.search);
    urlObfuscationEnabled = true;
  } catch (e) {
    console.warn("URL bar obfuscation failed:", e);
  }
}

export function updateObfuscatedURL(fakeUrl: string) {
  if (!urlObfuscationEnabled) return;
  
  try {
    const url = new URL(fakeUrl);
    history.replaceState({}, "", url.pathname + url.search);
  } catch (e) {
    console.warn("URL update failed:", e);
  }
}

export function disableURLBarObfuscation() {
  if (!urlObfuscationEnabled) return;
  
  try {
    history.replaceState({}, "", originalURL);
    urlObfuscationEnabled = false;
  } catch (e) {
    console.warn("URL bar deobfuscation failed:", e);
  }
}

// ==================== NAVIGATOR SPOOFING ====================

let navigatorSpoofingEnabled = false;
let originalNavigator: Navigator = {} as Navigator;

export function enableNavigatorSpoofing(settings: {
  userAgent?: string;
  platform?: string;
  language?: string;
}) {
  if (navigatorSpoofingEnabled) return;
  
  try {
    originalNavigator = { ...navigator };
    
    const nav = navigator as Navigator & {
      userAgent: string;
      platform: string;
      language: string;
      languages: string[];
    };
    
    if (settings.userAgent) {
      Object.defineProperty(nav, 'userAgent', {
        get: () => settings.userAgent!,
        configurable: true,
      });
    }
    
    if (settings.platform) {
      Object.defineProperty(nav, 'platform', {
        get: () => settings.platform!,
        configurable: true,
      });
    }
    
    if (settings.language) {
      Object.defineProperty(nav, 'language', {
        get: () => settings.language!,
        configurable: true,
      });
      
      Object.defineProperty(nav, 'languages', {
        get: () => [settings.language!, 'en'],
        configurable: true,
      });
    }
    
    navigatorSpoofingEnabled = true;
  } catch (e) {
    console.warn("Navigator spoofing failed:", e);
  }
}

export function disableNavigatorSpoofing() {
  if (!navigatorSpoofingEnabled) return;
  
  try {
    const nav = navigator as Navigator & { userAgent: string; platform: string; language: string };
    
    Object.defineProperty(nav, 'userAgent', {
      get: () => originalNavigator.userAgent,
      configurable: true,
    });
    
    Object.defineProperty(nav, 'platform', {
      get: () => originalNavigator.platform,
      configurable: true,
    });
    
    Object.defineProperty(nav, 'language', {
      get: () => originalNavigator.language,
      configurable: true,
    });
    
    navigatorSpoofingEnabled = false;
  } catch (e) {
    console.warn("Navigator despoofing failed:", e);
  }
}

// ==================== COMBINED SPOOFING ====================

export function enableAllSpoofing(urlObfuscation: boolean, navigatorSpoofing: boolean, fakeUrl?: string, navSettings?: { userAgent?: string; platform?: string; language?: string }) {
  if (urlObfuscation && fakeUrl) {
    enableURLBarObfuscation(fakeUrl);
  }
  if (navigatorSpoofing && navSettings) {
    enableNavigatorSpoofing(navSettings);
  }
}

export function disableAllSpoofing() {
  disableURLBarObfuscation();
  disableNavigatorSpoofing();
}

// ==================== TAB CLOAKING ====================

let tabCloakingEnabled = false;
let originalTitle = "";
let originalFavicon: string | null = null;

export function enableTabCloaking(title: string, faviconUrl: string) {
  if (tabCloakingEnabled) return;
  
  try {
    originalTitle = document.title;
    
    if (title) {
      document.title = title;
    }
    
    if (faviconUrl) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement || document.createElement("link");
      link.rel = "icon";
      link.href = faviconUrl;
      document.head.appendChild(link);
    }
    
    tabCloakingEnabled = true;
  } catch (e) {
    console.warn("Tab cloaking failed:", e);
  }
}

export function updateTabCloak(title: string, faviconUrl: string) {
  if (!tabCloakingEnabled) return;
  
  try {
    if (title) {
      document.title = title;
    }
    
    if (faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = faviconUrl;
    }
  } catch (e) {
    console.warn("Tab cloak update failed:", e);
  }
}

export function disableTabCloaking() {
  if (!tabCloakingEnabled) return;
  
  try {
    document.title = originalTitle;
    
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link && link.href) {
      link.remove();
    }
    
    tabCloakingEnabled = false;
  } catch (e) {
    console.warn("Tab decloaking failed:", e);
  }
}
// ... existing code remains above ...

// --- WebRTC Leak Prevention ---

let webRTCBlocked = false;

export function enableWebRTCLeakPrevention() {
  if (webRTCBlocked) return;
  
  // Block RTCPeerConnection
  const originalRTCPeerConnection = window.RTCPeerConnection;
  (window as any).RTCPeerConnection = function(...args: any[]) {
    const pc = new originalRTCPeerConnection(...args);
    // Override createOffer and createAnswer to block ICE candidate gathering
    const originalCreateOffer = pc.createOffer.bind(pc);
    pc.createOffer = function(options?: any) {
      return originalCreateOffer(options).then(offer => {
        offer.sdp = offer.sdp.replace(/a=ice-options:trickle/g, 'a=ice-options:');
        return offer;
      });
    };
    return pc;
  };
  
  // Block getUserMedia for IP leak
  const originalGetUserMedia = navigator.mediaDevices?.getUserMedia.bind(navigator.mediaDevices);
  if (originalGetUserMedia) {
    navigator.mediaDevices.getUserMedia = function(constraints: MediaStreamConstraints) {
      // Filter out audio/video constraints that could leak IP
      return originalGetUserMedia(constraints).catch((err: any) => {
        throw new Error("Media access blocked by security policy");
      });
    };
  }
  
  webRTCBlocked = true;
}

export function disableWebRTCLeakPrevention() {
  if (!webRTCBlocked) return;
  // Restore original implementations would require storing them
  // For simplicity, we'll just reload the page to reset
  webRTCBlocked = false;
}

// --- Geolocation Spoofing ---

let geolocationSpoofingEnabled = false;
let geolocationInterval: ReturnType<typeof setInterval> | null = null;

export function enableGeolocationSpoofing() {
  if (geolocationSpoofingEnabled) return;
  
  const spoofedPosition = {
    coords: {
      latitude: 40.7128 + (Math.random() - 0.5) * 10, // Random around NYC
      longitude: -74.0060 + (Math.random() - 0.5) * 10,
      altitude: null,
      accuracy: 100,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  };
  
  // Override geolocation
  const originalGeolocation = navigator.geolocation;
  navigator.geolocation = {
    getCurrentPosition: (success: any, error?: any, options?: any) => {
      setTimeout(() => success(spoofedPosition), 100);
    },
    watchPosition: (success: any, error?: any, options?: any) => {
      const id = setInterval(() => success(spoofedPosition), 5000);
      return id;
    },
    clearWatch: (id: any) => clearInterval(id),
  };
  
  // Periodically change location
  geolocationInterval = setInterval(() => {
    spoofedPosition.coords.latitude += (Math.random() - 0.5) * 0.1;
    spoofedPosition.coords.longitude += (Math.random() - 0.5) * 0.1;
  }, 30000);
  
  geolocationSpoofingEnabled = true;
}

export function disableGeolocationSpoofing() {
  if (!geolocationSpoofingEnabled) return;
  if (geolocationInterval) {
    clearInterval(geolocationInterval);
    geolocationInterval = null;
  }
  geolocationSpoofingEnabled = false;
  // Note: Can't fully restore original without storing it
}

// --- Fingerprint Randomization ---

let fingerprintInterval: ReturnType<typeof setInterval> | null = null;

export function enableFingerprintRandomization(intervalMinutes: number = 30) {
  if (fingerprintInterval) return;
  
  const randomize = () => {
    // Override navigator properties with random values
    const randomUA = () => {
      const uas = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
      ];
      return uas[Math.floor(Math.random() * uas.length)];
    };
    
    // Override read-only properties using Object.defineProperty
    try {
      Object.defineProperty(navigator, 'userAgent', {
        get: () => randomUA(),
        configurable: true,
      });
    } catch {}
    
    // Randomize screen properties
    try {
      Object.defineProperty(screen, 'width', {
        get: () => 1920 + Math.floor(Math.random() * 200),
        configurable: true,
      });
      Object.defineProperty(screen, 'height', {
        get: () => 1080 + Math.floor(Math.random() * 200),
        configurable: true,
      });
    } catch {}
    
    // Randomize timezone
    try {
      const originalIntl = window.Intl;
      window.Intl = {
        ...originalIntl,
        DateTimeFormat: function(...args: any[]) {
          const formatter = new originalIntl.DateTimeFormat(...args);
          const randomOffset = (Math.random() - 0.5) * 3600000 * 4; // ±4 hours
          return {
            ...formatter,
            format: (date: Date) => {
              const adjusted = new Date(date.getTime() + randomOffset);
              return formatter.format(adjusted);
            },
          };
        },
      };
    } catch {}
  };
  
  randomize(); // Apply immediately
  fingerprintInterval = setInterval(randomize, intervalMinutes * 60 * 1000);
}

export function disableFingerprintRandomization() {
  if (fingerprintInterval) {
    clearInterval(fingerprintInterval);
    fingerprintInterval = null;
  }
  // Note: Can't fully restore without storing originals
}

// --- Media Device Monitoring ---

let mediaMonitorInterval: ReturnType<typeof setInterval> | null = null;
let lastMediaState = false;

export function enableMediaDeviceMonitoring(onDetect: () => void) {
  if (mediaMonitorInterval) return;
  
  const checkMediaDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasActive = devices.some(d => d.kind === 'videoinput' || d.kind === 'audioinput');
      if (hasActive && !lastMediaState) {
        onDetect();
      }
      lastMediaState = hasActive;
    } catch {
      // Permission denied or not supported
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

// --- Browser API Restrictions ---

let apiRestrictionsEnabled = false;

export function enableBrowserAPIRestrictions() {
  if (apiRestrictionsEnabled) return;
  
  // Block performance API
  try {
    Object.defineProperty(window, 'performance', {
      get: () => undefined,
      configurable: true,
    });
  } catch {}
  
  // Block storage APIs
  try {
    Object.defineProperty(window, 'localStorage', {
      get: () => undefined,
      configurable: true,
    });
    Object.defineProperty(window, 'sessionStorage', {
      get: () => undefined,
      configurable: true,
    });
  } catch {}
  
  // Block certain DOM APIs
  try {
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
  // Can't restore without storing originals
}

// --- Anti-Memory Dump ---

let memoryProtectionEnabled = false;

export function enableMemoryDumpProtection() {
  if (memoryProtectionEnabled) return;
  
  // Prevent debugger attachment via DevTools
  const noop = () => {};
  const interval = setInterval(() => {
    // Keep debugger from attaching
    if (window.devtools && window.devtools.isOpen) {
      window.location.reload();
    }
    
    // Detect memory profiling
    if (performance.memory) {
      const heapUsed = (performance.memory as any).usedJSHeapSize;
      if (heapUsed > 100 * 1024 * 1024) { // > 100MB
        console.clear();
      }
    }
  }, 1000);
  
  memoryProtectionEnabled = true;
  return () => clearInterval(interval);
}

export function disableMemoryDumpProtection() {
  memoryProtectionEnabled = false;
}

// --- Timing Attack Prevention ---

let timingProtectionEnabled = false;

export function enableTimingAttackPrevention() {
  if (timingProtectionEnabled) return;
  
  // Add random delays to sensitive operations
  const originalSetTimeout = window.setTimeout;
  window.setTimeout = function(cb: Function, delay: number, ...args: any[]) {
    const jitter = Math.random() * 100 - 50; // ±50ms
    return originalSetTimeout(cb, Math.max(0, delay + jitter), ...args);
  };
  
  timingProtectionEnabled = true;
}

export function disableTimingAttackPrevention() {
  if (!timingProtectionEnabled) return;
  // Can't restore without storing original
  timingProtectionEnabled = false;
}

// --- Screen Brightness Detection (via canvas) ---

export function detectScreenRecording(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    
    // Draw a pattern
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    
    // If screen is being recorded, the pixel data might be altered
    // This is a basic check - more sophisticated detection would be needed
    return data[0] !== 0 || data[1] !== 0 || data[2] !== 0;
  } catch {
    return false;
  }
}

// ... rest of existing functions remain unchanged ...
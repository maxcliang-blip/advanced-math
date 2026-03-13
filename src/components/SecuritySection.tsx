import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Shield, Eye, EyeOff, Lock, Smartphone, Clock,
  TriangleAlert as AlertTriangle, Activity, Ban,
  MousePointerClick, TabletSmartphone, Bomb, Trash2, KeyRound,
  LogOut, BluetoothOff, Printer, Type, Frame, History,
  Fingerprint, Ghost
} from "lucide-react";
import {
  loadSecuritySettings,
  saveSecuritySettings,
  type SecuritySettings,
  isDeviceTrusted,
  setTrustedDevice,
  clearTrustedDevice,
  getFailedAttempts,
  clearFailedAttempts,
  getSessionDuration,
  detectSuspiciousActivity,
  emergencyWipe,
  loadKeystrokePattern,
  saveKeystrokePattern,
  clearKeystrokePattern,
  type KeystrokePattern,
} from "@/lib/security";

interface SecuritySectionProps {
  onSecurityChange?: (settings: SecuritySettings) => void;
}

const SecuritySection = ({ onSecurityChange }: SecuritySectionProps) => {
  const [settings, setSettings] = useState<SecuritySettings>(loadSecuritySettings);
  const [saved, setSaved] = useState(false);
  const [deviceTrusted, setDeviceTrusted] = useState(isDeviceTrusted());
  const [failedAttempts, setFailedAttemptsState] = useState(getFailedAttempts());
  const [sessionTime, setSessionTime] = useState(getSessionDuration());
  const [suspiciousActivity, setSuspiciousActivity] = useState(false);
  const [decoyInput, setDecoyInput] = useState(settings.decoyPassword);
  const [decoyEditing, setDecoyEditing] = useState(false);
  const [wipeConfirm, setWipeConfirm] = useState(false);
  
  // Keystroke pattern recording
  const [patternRecording, setPatternRecording] = useState(false);
  const [patternTaps, setPatternTaps] = useState<number[]>([]);
  const lastTapRef = useRef<number>(0);
  const [existingPattern, setExistingPattern] = useState<KeystrokePattern | null>(loadKeystrokePattern());
  const [stealthKeyInput, setStealthKeyInput] = useState(settings.stealthModeKey || "h");
  const [editingStealth, setEditingStealth] = useState(false);

  const handlePatternTap = useCallback(() => {
    const now = Date.now();
    if (lastTapRef.current > 0) {
      setPatternTaps(prev => [...prev, now - lastTapRef.current]);
    }
    lastTapRef.current = now;
  }, []);

  const savePattern = useCallback(() => {
    if (patternTaps.length < 2) return;
    const pattern: KeystrokePattern = { intervals: patternTaps, length: patternTaps.length + 1 };
    saveKeystrokePattern(pattern);
    setExistingPattern(pattern);
    setPatternRecording(false);
    setPatternTaps([]);
    lastTapRef.current = 0;
  }, [patternTaps]);

  const cancelPatternRecording = useCallback(() => {
    setPatternRecording(false);
    setPatternTaps([]);
    lastTapRef.current = 0;
  }, []);

  const handleClearPattern = useCallback(() => {
    clearKeystrokePattern();
    setExistingPattern(null);
  }, []);

  const handleSaveStealthKey = () => {
    const key = stealthKeyInput.trim().toLowerCase();
    if (!key) return;
    const newSettings = { ...settings, stealthModeKey: key };
    setSettings(newSettings);
    saveSecuritySettings(newSettings);
    onSecurityChange?.(newSettings);
    setEditingStealth(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime(getSessionDuration());
      if (settings.enableActivityMonitor) {
        const suspicious = detectSuspiciousActivity();
        setSuspiciousActivity(suspicious);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [settings.enableActivityMonitor]);

  const handleToggle = (key: keyof SecuritySettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    saveSecuritySettings(newSettings);
    onSecurityChange?.(newSettings);
  };

  const handleTimeoutChange = (minutes: number) => {
    const newSettings = { ...settings, sessionTimeout: minutes };
    setSettings(newSettings);
    saveSecuritySettings(newSettings);
    onSecurityChange?.(newSettings);
  };

  const handleTrustDevice = () => {
    if (deviceTrusted) {
      clearTrustedDevice();
      setDeviceTrusted(false);
    } else {
      setTrustedDevice();
      setDeviceTrusted(true);
    }
  };

  const handleClearAttempts = () => {
    clearFailedAttempts();
    setFailedAttemptsState(0);
  };

  const handleSaveDecoy = () => {
    const newSettings = { ...settings, decoyPassword: decoyInput.trim() };
    setSettings(newSettings);
    saveSecuritySettings(newSettings);
    onSecurityChange?.(newSettings);
    setDecoyEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleEmergencyWipe = () => {
    if (!wipeConfirm) {
      setWipeConfirm(true);
      setTimeout(() => setWipeConfirm(false), 4000);
      return;
    }
    emergencyWipe();
    setWipeConfirm(false);
    window.location.reload();
  };

  const formatSessionTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const ToggleRow = ({
    icon,
    label,
    description,
    settingKey,
    extra,
  }: {
    icon: React.ReactNode;
    label: string;
    description: string;
    settingKey: keyof SecuritySettings;
    extra?: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <span className="text-sm font-mono text-foreground">{label}</span>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {extra}
      </div>
      <Button
        onClick={() => handleToggle(settingKey)}
        variant={settings[settingKey] ? "default" : "outline"}
        size="sm"
        className="text-xs font-mono ml-3"
        data-testid={`toggle-${settingKey}`}
      >
        {settings[settingKey] ? "ON" : "OFF"}
      </Button>
    </div>
  );

  return (
    <section className="space-y-4 border-t border-border pt-6">
      <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
        <Shield className="h-4 w-4" /> Advanced Security
      </h2>

      <div className="space-y-3">

        {/* --- Existing features --- */}

        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-mono text-foreground">Safe Mode</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Enables additional security checks and warnings
            </p>
          </div>
          <Button
            onClick={() => handleToggle("enableSafeMode")}
            variant={settings.enableSafeMode ? "default" : "outline"}
            size="sm"
            className="text-xs font-mono"
            data-testid="toggle-enableSafeMode"
          >
            {settings.enableSafeMode ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </Button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm font-mono text-foreground">Activity Monitor</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Detects suspicious activity and DevTools
            </p>
            {suspiciousActivity && settings.enableActivityMonitor && (
              <p className="text-xs text-destructive font-mono mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Suspicious activity detected
              </p>
            )}
          </div>
          <Button
            onClick={() => handleToggle("enableActivityMonitor")}
            variant={settings.enableActivityMonitor ? "default" : "outline"}
            size="sm"
            className="text-xs font-mono"
            data-testid="toggle-enableActivityMonitor"
          >
            {settings.enableActivityMonitor ? "ON" : "OFF"}
          </Button>
        </div>

        <ToggleRow
          icon={<Eye className="h-4 w-4 text-primary" />}
          label="Screenshot Protection"
          description="Blocks screen capture attempts"
          settingKey="enableScreenshotProtection"
        />

        <ToggleRow
          icon={<Lock className="h-4 w-4 text-primary" />}
          label="Clipboard Protection"
          description="Prevents copying sensitive data"
          settingKey="enableClipboardProtection"
        />

        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Smartphone className="h-4 w-4 text-primary" />
              <span className="text-sm font-mono text-foreground">Trusted Device Only</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Restrict access to this device only
            </p>
            {deviceTrusted && (
              <p className="text-xs text-primary font-mono mt-1">This device is trusted</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleTrustDevice}
              variant={deviceTrusted ? "destructive" : "outline"}
              size="sm"
              className="text-xs font-mono"
              data-testid="button-trust-device"
            >
              {deviceTrusted ? "Untrust" : "Trust"}
            </Button>
            <Button
              onClick={() => handleToggle("trustedDeviceOnly")}
              variant={settings.trustedDeviceOnly ? "default" : "outline"}
              size="sm"
              className="text-xs font-mono"
              data-testid="toggle-trustedDeviceOnly"
            >
              {settings.trustedDeviceOnly ? "ON" : "OFF"}
            </Button>
          </div>
        </div>

        <div className="p-3 rounded-lg border border-border bg-secondary/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-mono text-foreground">Session Timeout</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Auto-lock after inactivity (0 = disabled)
          </p>
          <div className="flex flex-wrap gap-2">
            {[0, 5, 10, 15, 30, 60].map((min) => (
              <Button
                key={min}
                variant={settings.sessionTimeout === min ? "default" : "outline"}
                size="sm"
                onClick={() => handleTimeoutChange(min)}
                className="text-xs font-mono"
                data-testid={`button-timeout-${min}`}
              >
                {min === 0 ? "Off" : `${min}m`}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-mono">
            Current session: {formatSessionTime(sessionTime)}
          </p>
        </div>

        <ToggleRow
          icon={<Lock className="h-4 w-4 text-primary" />}
          label="Require Re-authentication"
          description="Ask for password before sensitive actions"
          settingKey="requireReauth"
        />

        {/* --- New features --- */}

        <ToggleRow
          icon={<Ban className="h-4 w-4 text-primary" />}
          label="Block DevTools Shortcuts"
          description="Disables F12, Ctrl+Shift+I, Ctrl+U key combos"
          settingKey="blockDevTools"
        />

        <ToggleRow
          icon={<MousePointerClick className="h-4 w-4 text-primary" />}
          label="Disable Right-Click"
          description="Prevents inspect element via context menu"
          settingKey="disableRightClick"
        />

        <ToggleRow
          icon={<TabletSmartphone className="h-4 w-4 text-primary" />}
          label="Lock on Tab Switch"
          description="Auto-locks when you navigate away from this tab"
          settingKey="lockOnTabSwitch"
        />

        <ToggleRow
          icon={<Bomb className="h-4 w-4 text-primary" />}
          label="Panic on DevTools Detection"
          description="Triggers panic mode if browser DevTools are opened"
          settingKey="enablePanicOnDevTools"
        />

        <ToggleRow
          icon={<LogOut className="h-4 w-4 text-primary" />}
          label="Mouse Leave Lock"
          description="Auto-locks when your cursor exits the browser window (address bar, alt-tab)"
          settingKey="mouseLeaveLock"
        />

        <ToggleRow
          icon={<BluetoothOff className="h-4 w-4 text-primary" />}
          label="Window Blur Lock"
          description="Locks the dashboard if the browser window loses focus"
          settingKey="windowBlurLock"
        />

        <ToggleRow
          icon={<Printer className="h-4 w-4 text-primary" />}
          label="Disable Printing"
          description="Blocks Ctrl+P and hides content from print dialogs"
          settingKey="disablePrinting"
        />

        <ToggleRow
          icon={<Type className="h-4 w-4 text-primary" />}
          label="Disable Text Selection"
          description="Prevents highlighting or selecting any text on the page"
          settingKey="disableTextSelection"
        />

        <ToggleRow
          icon={<Frame className="h-4 w-4 text-primary" />}
          label="Anti-Framing (Iframe Detection)"
          description="Triggers panic if CLOAK is embedded inside another page (clickjacking)"
          settingKey="iframeDetection"
        />

        <ToggleRow
          icon={<History className="h-4 w-4 text-primary" />}
          label="History Scramble on Panic"
          description="Pushes fake history entries on panic so the back button can't reveal CLOAK"
          settingKey="historyScramble"
        />

        {/* Decoy Password */}
        <div className="p-3 rounded-lg border border-border bg-secondary/30">
          <div className="flex items-center gap-2 mb-1">
            <KeyRound className="h-4 w-4 text-primary" />
            <span className="text-sm font-mono text-foreground">Decoy Password</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            A second password that shows a blank decoy screen instead of the real dashboard
          </p>
          {decoyEditing ? (
            <div className="flex gap-2">
              <Input
                type="password"
                value={decoyInput}
                onChange={(e) => setDecoyInput(e.target.value)}
                placeholder="Enter decoy password"
                className="text-xs font-mono h-8"
                data-testid="input-decoy-password"
              />
              <Button size="sm" onClick={handleSaveDecoy} className="text-xs font-mono">
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setDecoyEditing(false); setDecoyInput(settings.decoyPassword); }} className="text-xs font-mono">
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground flex-1">
                {settings.decoyPassword ? "••••••••" : "Not set"}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDecoyEditing(true)}
                className="text-xs font-mono"
                data-testid="button-edit-decoy"
              >
                {settings.decoyPassword ? "Change" : "Set"}
              </Button>
              {settings.decoyPassword && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newSettings = { ...settings, decoyPassword: "" };
                    setSettings(newSettings);
                    saveSecuritySettings(newSettings);
                    setDecoyInput("");
                  }}
                  className="text-xs font-mono border-destructive/30 text-destructive hover:bg-destructive/10"
                  data-testid="button-clear-decoy"
                >
                  Clear
                </Button>
              )}
              {saved && <span className="text-xs text-primary font-mono">Saved</span>}
            </div>
          )}
        </div>

        {/* Failed attempts alert */}
        {failedAttempts > 0 && (
          <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-mono text-destructive">Security Alert</span>
                </div>
                <p className="text-xs text-destructive/80 font-mono">
                  {failedAttempts} failed login attempt{failedAttempts > 1 ? "s" : ""} recorded
                </p>
              </div>
              <Button
                onClick={handleClearAttempts}
                variant="outline"
                size="sm"
                className="text-xs font-mono border-destructive/30 text-destructive hover:bg-destructive/10"
                data-testid="button-clear-attempts"
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Keystroke Pattern Lock */}
        <div className="p-3 rounded-lg border border-border bg-secondary/30">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-primary" />
              <span className="text-sm font-mono text-foreground">Keystroke Pattern Lock</span>
            </div>
            <Button
              onClick={() => handleToggle("keystrokePatternLock")}
              variant={settings.keystrokePatternLock ? "default" : "outline"}
              size="sm"
              className="text-xs font-mono"
            >
              {settings.keystrokePatternLock ? "ON" : "OFF"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Unlock with a specific rhythm of key taps instead of (or alongside) password
          </p>
          {existingPattern ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-primary">
                Pattern set ({existingPattern.length} taps)
              </span>
              <Button size="sm" variant="outline" onClick={() => { setPatternRecording(true); setPatternTaps([]); lastTapRef.current = 0; }} className="text-xs font-mono">
                Re-record
              </Button>
              <Button size="sm" variant="outline" onClick={handleClearPattern} className="text-xs font-mono border-destructive/30 text-destructive hover:bg-destructive/10">
                Clear
              </Button>
            </div>
          ) : !patternRecording ? (
            <Button size="sm" variant="outline" onClick={() => setPatternRecording(true)} className="text-xs font-mono">
              Record Pattern
            </Button>
          ) : null}
          {patternRecording && (
            <div className="mt-2 p-3 rounded border border-primary/30 bg-primary/5 space-y-2">
              <p className="text-xs font-mono text-foreground">
                Tap the button rhythmically to create your pattern ({patternTaps.length + 1} taps so far)
              </p>
              <div className="flex gap-2">
                <Button onClick={handlePatternTap} className="text-xs font-mono flex-1">
                  TAP ({patternTaps.length + 1})
                </Button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={savePattern} disabled={patternTaps.length < 2} className="text-xs font-mono">
                  Save Pattern
                </Button>
                <Button size="sm" variant="outline" onClick={cancelPatternRecording} className="text-xs font-mono">
                  Cancel
                </Button>
              </div>
              {patternTaps.length > 0 && (
                <p className="text-xs text-muted-foreground font-mono">
                  Intervals: {patternTaps.map(t => `${t}ms`).join(", ")}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Stealth Mode Hotkey */}
        <div className="p-3 rounded-lg border border-border bg-secondary/30">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Ghost className="h-4 w-4 text-primary" />
              <span className="text-sm font-mono text-foreground">Stealth Mode Hotkey</span>
            </div>
            <Button
              onClick={() => handleToggle("stealthModeEnabled")}
              variant={settings.stealthModeEnabled ? "default" : "outline"}
              size="sm"
              className="text-xs font-mono"
            >
              {settings.stealthModeEnabled ? "ON" : "OFF"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Press Alt+{settings.stealthModeKey.toUpperCase()} to instantly trigger panic + attempt to minimize window
          </p>
          {editingStealth ? (
            <div className="flex gap-2">
              <Input
                value={stealthKeyInput}
                onChange={(e) => setStealthKeyInput(e.target.value.slice(-1))}
                placeholder="Key"
                className="text-xs font-mono h-8 w-20"
                maxLength={1}
              />
              <Button size="sm" onClick={handleSaveStealthKey} className="text-xs font-mono">Save</Button>
              <Button size="sm" variant="outline" onClick={() => { setEditingStealth(false); setStealthKeyInput(settings.stealthModeKey); }} className="text-xs font-mono">Cancel</Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditingStealth(true)} className="text-xs font-mono">
              Change Key (Alt+{settings.stealthModeKey.toUpperCase()})
            </Button>
          )}
        </div>

        {/* Emergency Data Wipe */}
        <div className="p-3 rounded-lg border border-destructive/40 bg-destructive/5">
          <div className="flex items-center gap-2 mb-1">
            <Trash2 className="h-4 w-4 text-destructive" />
            <span className="text-sm font-mono text-destructive">Emergency Data Wipe</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Immediately clears all CLOAK settings, passwords, and stored data. Cannot be undone.
          </p>
          <Button
            onClick={handleEmergencyWipe}
            variant="destructive"
            size="sm"
            className="text-xs font-mono"
            data-testid="button-emergency-wipe"
          >
            {wipeConfirm ? "Confirm — this cannot be undone" : "Wipe All Data"}
          </Button>
        </div>

      </div>
    </section>
  );
};

export default SecuritySection;

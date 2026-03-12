import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Eye, EyeOff, Lock, Smartphone, Clock, TriangleAlert as AlertTriangle, Activity } from "lucide-react";
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
  detectSuspiciousActivity
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

  const formatSessionTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <section className="space-y-4 border-t border-border pt-6">
      <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
        <Shield className="h-4 w-4" /> Advanced Security
      </h2>

      <div className="space-y-3">
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
          >
            {settings.enableActivityMonitor ? "ON" : "OFF"}
          </Button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-4 w-4 text-primary" />
              <span className="text-sm font-mono text-foreground">Screenshot Protection</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Blocks screen capture attempts
            </p>
          </div>
          <Button
            onClick={() => handleToggle("enableScreenshotProtection")}
            variant={settings.enableScreenshotProtection ? "default" : "outline"}
            size="sm"
            className="text-xs font-mono"
          >
            {settings.enableScreenshotProtection ? "ON" : "OFF"}
          </Button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="h-4 w-4 text-primary" />
              <span className="text-sm font-mono text-foreground">Clipboard Protection</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Prevents copying sensitive data
            </p>
          </div>
          <Button
            onClick={() => handleToggle("enableClipboardProtection")}
            variant={settings.enableClipboardProtection ? "default" : "outline"}
            size="sm"
            className="text-xs font-mono"
          >
            {settings.enableClipboardProtection ? "ON" : "OFF"}
          </Button>
        </div>

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
              <p className="text-xs text-primary font-mono mt-1">
                This device is trusted
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleTrustDevice}
              variant={deviceTrusted ? "destructive" : "outline"}
              size="sm"
              className="text-xs font-mono"
            >
              {deviceTrusted ? "Untrust" : "Trust"}
            </Button>
            <Button
              onClick={() => handleToggle("trustedDeviceOnly")}
              variant={settings.trustedDeviceOnly ? "default" : "outline"}
              size="sm"
              className="text-xs font-mono"
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
              >
                {min === 0 ? "Off" : `${min}m`}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-mono">
            Current session: {formatSessionTime(sessionTime)}
          </p>
        </div>

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
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="h-4 w-4 text-primary" />
              <span className="text-sm font-mono text-foreground">Require Re-authentication</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Ask for password before sensitive actions
            </p>
          </div>
          <Button
            onClick={() => handleToggle("requireReauth")}
            variant={settings.requireReauth ? "default" : "outline"}
            size="sm"
            className="text-xs font-mono"
          >
            {settings.requireReauth ? "ON" : "OFF"}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Save, Timer, Zap, Monitor, Globe } from "lucide-react";
import { loadProfile, saveProfile, type UserProfile, type PanicDestination, type BossKeyStyle } from "@/lib/profile";

interface ProfileSectionProps {
  onProfileChange?: (profile: UserProfile) => void;
}

const disguiseOptions = ["Google", "YouTube", "Google Docs", "Facebook", "Twitter", "Reddit", "Gmail", "Canvas", "Wikipedia", "404"];

const PANIC_DESTINATIONS: { value: PanicDestination; label: string; desc: string }[] = [
  { value: "404",     label: "Broken Page",   desc: "ERR_EMPTY_RESPONSE chrome error" },
  { value: "google",  label: "Google",        desc: "Google homepage" },
  { value: "youtube", label: "YouTube",       desc: "YouTube video page" },
  { value: "docs",    label: "Google Docs",   desc: "Blank document" },
  { value: "facebook", label: "Facebook",     desc: "Facebook homepage" },
  { value: "twitter",  label: "Twitter/X",     desc: "Twitter feed" },
  { value: "reddit",   label: "Reddit",        desc: "Reddit home" },
  { value: "gmail",    label: "Gmail",         desc: "Email inbox" },
  { value: "custom",  label: "Custom URL",    desc: "Any URL (opens in redirect)" },
];

const BOSS_KEY_STYLES: { value: BossKeyStyle; label: string }[] = [
  { value: "google",  label: "Google" },
  { value: "youtube", label: "YouTube" },
  { value: "docs",    label: "Google Docs" },
  { value: "facebook", label: "Facebook" },
  { value: "twitter",  label: "Twitter/X" },
  { value: "reddit",   label: "Reddit" },
  { value: "gmail",    label: "Gmail" },
  { value: "404",     label: "Broken Page" },
  { value: "custom",  label: "Custom URL" },
];

const ProfileSection = ({ onProfileChange }: ProfileSectionProps) => {
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [saved, setSaved] = useState(false);
  const [recordingKey, setRecordingKey] = useState(false);

  useEffect(() => {
    if (recordingKey) {
      const handler = (e: KeyboardEvent) => {
        e.preventDefault();
        setProfile((p) => ({ ...p, panicKey: e.key }));
        setRecordingKey(false);
      };
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }
  }, [recordingKey]);

  const handleSave = () => {
    saveProfile(profile);
    setSaved(true);
    onProfileChange?.(profile);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <section className="space-y-4 border-t border-border pt-6">
      <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
        <User className="h-4 w-4" /> Profile
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Display Name</label>
          <Input
            value={profile.displayName}
            onChange={(e) => setProfile((p) => ({ ...p, displayName: e.target.value }))}
            className="bg-secondary border-border text-foreground focus:border-primary"
            placeholder="Agent"
            data-testid="input-display-name"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Default Disguise</label>
          <div className="flex flex-wrap gap-1.5">
            {disguiseOptions.map((opt) => (
              <Button
                key={opt}
                variant={profile.defaultDisguise === opt ? "default" : "outline"}
                size="sm"
                onClick={() => setProfile((p) => ({ ...p, defaultDisguise: opt }))}
                className={
                  profile.defaultDisguise === opt
                    ? "text-xs font-mono bg-primary text-primary-foreground"
                    : "text-xs font-mono border-border text-muted-foreground hover:text-foreground hover:border-primary hover:bg-secondary"
                }
              >
                {opt}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Panic key */}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Panic Keybind</label>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-secondary rounded text-foreground font-mono text-sm border border-border min-w-[40px] text-center">
            {profile.panicKey === " " ? "Space" : profile.panicKey}
          </kbd>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRecordingKey(true)}
            className={`text-xs font-mono border-border ${
              recordingKey
                ? "border-primary text-primary animate-pulse"
                : "text-muted-foreground hover:text-foreground hover:border-primary"
            }`}
            data-testid="button-record-panic-key"
          >
            {recordingKey ? "Press any key..." : "Change"}
          </Button>
        </div>
      </div>

      {/* Auto-cloak timer */}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          <Timer className="h-3 w-3" /> Auto-Cloak Timer
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {[0, 1, 2, 5, 10, 15].map((min) => (
            <Button
              key={min}
              variant={profile.autoCloakMinutes === min ? "default" : "outline"}
              size="sm"
              onClick={() => setProfile((p) => ({ ...p, autoCloakMinutes: min }))}
              className={
                profile.autoCloakMinutes === min
                  ? "text-xs font-mono bg-primary text-primary-foreground"
                  : "text-xs font-mono border-border text-muted-foreground hover:text-foreground hover:border-primary hover:bg-secondary"
              }
              data-testid={`auto-cloak-${min}`}
            >
              {min === 0 ? "Off" : `${min}m`}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {profile.autoCloakMinutes > 0
            ? `Auto-triggers panic after ${profile.autoCloakMinutes} min of inactivity`
            : "Disabled — no auto-panic"}
        </p>
      </div>

      {/* Panic destination */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          <Zap className="h-3 w-3" /> Panic Destination
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PANIC_DESTINATIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => setProfile((p) => ({ ...p, panicDestination: d.value }))}
              className={`p-2 rounded-lg border text-left transition-colors ${
                profile.panicDestination === d.value
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
              data-testid={`panic-dest-${d.value}`}
            >
              <div className="text-xs font-mono font-medium">{d.label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{d.desc}</div>
            </button>
          ))}
        </div>
        {profile.panicDestination === "custom" && (
          <Input
            value={profile.panicCustomUrl}
            onChange={(e) => setProfile((p) => ({ ...p, panicCustomUrl: e.target.value }))}
            placeholder="https://example.com"
            className="bg-secondary border-border text-foreground focus:border-primary text-xs font-mono"
            data-testid="input-panic-custom-url"
          />
        )}
      </div>

      {/* Boss Key style */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          <Monitor className="h-3 w-3" /> Boss Key Cover (Alt+B)
        </label>
        <p className="text-xs text-muted-foreground">
          Instantly covers the screen with an innocent-looking page without losing your place. Double-click to dismiss.
        </p>
        <div className="flex flex-wrap gap-2">
          {BOSS_KEY_STYLES.map((s) => (
            <Button
              key={s.value}
              variant={profile.bossKeyStyle === s.value ? "default" : "outline"}
              size="sm"
              onClick={() => setProfile((p) => ({ ...p, bossKeyStyle: s.value }))}
              className={
                profile.bossKeyStyle === s.value
                  ? "text-xs font-mono bg-primary text-primary-foreground"
                  : "text-xs font-mono border-border text-muted-foreground hover:text-foreground hover:border-primary hover:bg-secondary"
              }
              data-testid={`boss-key-${s.value}`}
            >
              {s.label}
            </Button>
          ))}
        </div>
        {profile.bossKeyStyle === "custom" && (
          <Input
            value={profile.bossKeyCustomUrl}
            onChange={(e) => setProfile((p) => ({ ...p, bossKeyCustomUrl: e.target.value }))}
            placeholder="https://example.com"
            className="bg-secondary border-border text-foreground focus:border-primary text-xs font-mono"
            data-testid="input-boss-key-url"
          />
        )}
      </div>

      {/* Proxy mode toggle */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          <Globe className="h-3 w-3" /> Stealth Proxy Mode
        </label>
        <p className="text-xs text-muted-foreground">
          Bypasses iframe restrictions by injecting a navigation script. Disable for direct navigation (faster but may fail on sites with X-Frame-Options).
        </p>
        <div className="flex gap-2">
          <Button
            variant={profile.useProxyMode ? "default" : "outline"}
            size="sm"
            onClick={() => setProfile((p) => ({ ...p, useProxyMode: true }))}
            className={
              profile.useProxyMode
                ? "text-xs font-mono bg-primary text-primary-foreground"
                : "text-xs font-mono border-border text-muted-foreground hover:text-foreground hover:border-primary hover:bg-secondary"
            }
            data-testid="proxy-mode-on"
          >
            Proxy (Bypass)
          </Button>
          <Button
            variant={!profile.useProxyMode ? "default" : "outline"}
            size="sm"
            onClick={() => setProfile((p) => ({ ...p, useProxyMode: false }))}
            className={
              !profile.useProxyMode
                ? "text-xs font-mono bg-primary text-primary-foreground"
                : "text-xs font-mono border-border text-muted-foreground hover:text-foreground hover:border-primary hover:bg-secondary"
            }
            data-testid="proxy-mode-off"
          >
            Direct
          </Button>
        </div>
        
        {/* Custom Proxy URL */}
        <div className="mt-3 p-3 rounded-lg border border-border bg-secondary/30">
          <label className="text-xs text-muted-foreground block mb-1">
            Custom Proxy URL (optional)
          </label>
          <p className="text-[10px] text-muted-foreground mb-2">
            Deploy a proxy or use a preset below
          </p>
          <div className="flex flex-wrap gap-1 mb-2">
            <Button
              variant={profile.customProxyUrl === "" ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => setProfile((p) => ({ ...p, customProxyUrl: "" }))}
            >
              None
            </Button>
            <Button
              variant={profile.customProxyUrl === "https://api.allorigins.win/raw?url=" ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => setProfile((p) => ({ ...p, customProxyUrl: "https://api.allorigins.win/raw?url=" }))}
            >
              AllOrigins
            </Button>
            <Button
              variant={profile.customProxyUrl === "https://corsproxy.io/?url=" ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => setProfile((p) => ({ ...p, customProxyUrl: "https://corsproxy.io/?url=" }))}
            >
              CorsProxy
            </Button>
          </div>
          <Input
            type="text"
            value={profile.customProxyUrl || ""}
            onChange={(e) => setProfile((p) => ({ ...p, customProxyUrl: e.target.value }))}
            placeholder="https://your-proxy.example.com/proxy?url="
            className="text-xs font-mono h-8"
          />
        </div>
      </div>

      <Button
        onClick={handleSave}
        variant="outline"
        size="sm"
        className={`gap-2 text-xs font-mono ${
          saved
            ? "border-primary text-primary"
            : "border-border text-muted-foreground hover:text-foreground hover:border-primary"
        }`}
        data-testid="button-save-profile"
      >
        <Save className="h-3 w-3" />
        {saved ? "Saved!" : "Save Profile"}
      </Button>
    </section>
  );
};

export default ProfileSection;

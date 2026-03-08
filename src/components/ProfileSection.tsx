import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Save } from "lucide-react";
import { loadProfile, saveProfile, type UserProfile } from "@/lib/profile";

interface ProfileSectionProps {
  onProfileChange?: (profile: UserProfile) => void;
}

const disguiseOptions = ["Google", "Google Docs", "Canvas", "Wikipedia"];

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
          >
            {recordingKey ? "Press any key..." : "Change"}
          </Button>
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
      >
        <Save className="h-3 w-3" />
        {saved ? "Saved!" : "Save Profile"}
      </Button>
    </section>
  );
};

export default ProfileSection;

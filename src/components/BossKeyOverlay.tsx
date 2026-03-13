import type { BossKeyStyle } from "@/lib/profile";
import FakeGoogle from "./FakeGoogle";
import FakeYouTube from "./FakeYouTube";
import FakeGoogleDocs from "./FakeGoogleDocs";
import Fake404 from "./Fake404";

export type { BossKeyStyle };

interface BossKeyOverlayProps {
  style: BossKeyStyle;
  customUrl?: string;
  onDismiss: () => void;
}

const BossKeyOverlay = ({ style, customUrl, onDismiss }: BossKeyOverlayProps) => {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, overflow: "auto" }}>
      {style === "google"  && <FakeGoogle onReveal={onDismiss} />}
      {style === "youtube" && <FakeYouTube onReveal={onDismiss} />}
      {style === "docs"    && <FakeGoogleDocs onReveal={onDismiss} />}
      {style === "404"     && <Fake404 onReveal={onDismiss} />}
      {style === "custom"  && customUrl && (
        <iframe
          src={customUrl}
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          title="Cover"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      )}
    </div>
  );
};

export default BossKeyOverlay;

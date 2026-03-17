import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Globe, Download, ExternalLink, Lock, Eye, EyeOff } from "lucide-react";

interface PrivacyToolsProps {
  onClose?: () => void;
}

const PrivacyTools = ({ onClose }: PrivacyToolsProps) => {
  const [customTorUrl, setCustomTorUrl] = useState("");

  const privacyTools = [
    {
      name: "Tor Browser",
      description: "Anonymous browsing - hides your IP address",
      icon: "🧅",
      downloadUrl: "https://www.torproject.org/download/",
      color: "bg-purple-600",
    },
    {
      name: "ProtonVPN",
      description: "Free unlimited VPN",
      icon: "🔒",
      downloadUrl: "https://protonvpn.com/free-vpn",
      color: "bg-blue-600",
    },
    {
      name: "Windscribe",
      description: "10GB free per month",
      icon: "💨",
      downloadUrl: "https://windscribe.com",
      color: "bg-green-600",
    },
    {
      name: "Cloudflare WARP",
      description: "Fast free VPN by Cloudflare",
      icon: "☁️",
      downloadUrl: "https://1.1.1.1/warp/",
      color: "bg-orange-500",
    },
  ];

  const openInNewTab = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">Privacy Tools</h2>
      </div>

      <p className="text-sm text-muted-foreground">
        For maximum privacy, use these tools alongside Cloak. A VPN routes all your traffic through an encrypted tunnel.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {privacyTools.map((tool) => (
          <button
            key={tool.name}
            onClick={() => openInNewTab(tool.downloadUrl)}
            className="p-3 rounded-lg border border-border bg-secondary/50 hover:bg-secondary transition-colors text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{tool.icon}</span>
              <span className="font-medium text-sm">{tool.name}</span>
            </div>
            <p className="text-xs text-muted-foreground">{tool.description}</p>
          </button>
        ))}
      </div>

      <div className="border-t border-border pt-4 mt-4">
        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
          <ExternalLink className="h-4 w-4" />
          Quick Launch Tor
        </h3>
        <p className="text-xs text-muted-foreground mb-2">
          Enter a URL to open in Tor Browser (must have Tor installed)
        </p>
        <div className="flex gap-2">
          <Input
            type="text"
            value={customTorUrl}
            onChange={(e) => setCustomTorUrl(e.target.value)}
            placeholder="https://discord.com"
            className="text-xs h-8"
          />
          <Button
            size="sm"
            onClick={() => {
              if (customTorUrl) {
                // This will attempt to open in Tor if it's set as default handler
                window.location.href = customTorUrl;
              }
            }}
            className="h-8"
          >
            Open
          </Button>
        </div>
      </div>

      <div className="border-t border-border pt-4 mt-4">
        <h3 className="text-sm font-medium mb-2">How to Use</h3>
        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Download and install a VPN or Tor Browser</li>
          <li>Connect to the VPN or open Tor Browser</li>
          <li>Then use Cloak for additional tab cloaking</li>
          <li>Your traffic is now doubly protected</li>
        </ol>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-4">
        <p className="text-xs text-yellow-600 dark:text-yellow-400">
          <strong>Note:</strong> Cloak's proxy helps bypass some blocks, but for complete privacy from your organization, use a VPN or Tor. Cloak provides tab-level cloaking, not network-level protection.
        </p>
      </div>
    </div>
  );
};

export default PrivacyTools;

import { useState } from "react";

interface FakeGoogleDocsProps {
  onReveal?: () => void;
}

const FakeGoogleDocs = ({ onReveal }: FakeGoogleDocsProps) => {
  const [docTitle, setDocTitle] = useState("Untitled document");
  const [content, setContent] = useState(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  );

  const menuItems = ["File", "Edit", "View", "Insert", "Format", "Tools", "Extensions", "Help"];
  const toolbarItems = ["↩", "↪", "🖨", "100%", "Normal text", "Arial", "11", "B", "I", "U", "A", "⁰", "≡", "≡", "≡"];

  return (
    <div
      style={{ fontFamily: "Google Sans, Roboto, sans-serif", backgroundColor: "#f0f4f9", minHeight: "100vh", display: "flex", flexDirection: "column", margin: 0 }}
      onDoubleClick={onReveal}
    >
      {/* Header */}
      <div style={{ backgroundColor: "#fff", padding: "8px 16px", boxShadow: "0 1px 2px rgba(0,0,0,.1)", display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Docs icon */}
        <div style={{ width: "30px", height: "40px", backgroundColor: "#4285f4", borderRadius: "2px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <div style={{ width: "18px", height: "22px", backgroundColor: "#fff", borderRadius: "1px", display: "flex", flexDirection: "column", justifyContent: "space-around", padding: "4px 3px" }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ height: "2px", backgroundColor: "#4285f4", borderRadius: "1px", width: i === 3 ? "60%" : "100%" }} />
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <input
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            style={{ fontSize: "18px", border: "none", outline: "none", color: "#202124", fontFamily: "inherit", width: "100%", background: "transparent", padding: "2px 4px", borderRadius: "3px" }}
            onFocus={(e) => { e.target.style.backgroundColor = "#f1f3f4"; }}
            onBlur={(e) => { e.target.style.backgroundColor = "transparent"; }}
          />
          {/* Menu bar */}
          <div style={{ display: "flex", gap: "2px", marginTop: "2px" }}>
            {menuItems.map((item) => (
              <button
                key={item}
                style={{ padding: "3px 8px", fontSize: "13px", color: "#202124", background: "none", border: "none", borderRadius: "4px", cursor: "pointer" }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = "#e8eaed"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = "transparent"; }}
              >{item}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button style={{ padding: "8px 16px", backgroundColor: "#1a73e8", color: "#fff", border: "none", borderRadius: "4px", fontSize: "14px", cursor: "pointer", fontWeight: "500" }}>Share</button>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#1a73e8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: "13px", fontWeight: "600" }}>A</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #e0e0e0", padding: "4px 8px", display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap" }}>
        {toolbarItems.map((item, i) => (
          <button
            key={i}
            style={{
              padding: "4px 8px", minWidth: item === "Normal text" || item === "Arial" ? "90px" : "28px",
              fontSize: "13px", color: "#202124", background: "none",
              border: i > 8 && i < 12 ? "none" : "none",
              borderRadius: "4px", cursor: "pointer",
              fontWeight: item === "B" ? "bold" : "normal",
              fontStyle: item === "I" ? "italic" : "normal",
              textDecoration: item === "U" ? "underline" : "none",
              borderRight: [2, 4, 7].includes(i) ? "1px solid #ddd" : "none",
              marginRight: [2, 4, 7].includes(i) ? "4px" : "0",
            }}
          >{item}</button>
        ))}
      </div>

      {/* Document body */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "20px 0", backgroundColor: "#f0f4f9", overflowY: "auto" }}>
        <div style={{
          width: "816px", minHeight: "1056px", backgroundColor: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,.2)", padding: "96px 96px 96px",
          position: "relative",
        }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: "100%", height: "100%", minHeight: "800px",
              border: "none", outline: "none", resize: "none",
              fontFamily: "Arial, sans-serif", fontSize: "11pt",
              lineHeight: "1.6", color: "#000", background: "transparent",
            }}
          />
        </div>
      </div>

      {/* Status bar */}
      <div style={{ backgroundColor: "#fff", borderTop: "1px solid #e0e0e0", padding: "4px 16px", fontSize: "12px", color: "#5f6368", display: "flex", gap: "16px" }}>
        <span>Word count: {content.split(/\s+/).filter(Boolean).length}</span>
        <span>Saved to Drive</span>
      </div>
    </div>
  );
};

export default FakeGoogleDocs;

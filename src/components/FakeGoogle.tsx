import { useState } from "react";

interface FakeGoogleProps {
  onReveal?: () => void;
}

const FakeGoogle = ({ onReveal }: FakeGoogleProps) => {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
    }
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#fff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        margin: 0,
        padding: 0,
      }}
      onDoubleClick={onReveal}
    >
      {/* Top nav */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 20px", gap: "16px", alignItems: "center" }}>
        <a href="#" style={{ fontSize: "13px", color: "#202124", textDecoration: "none" }}>Gmail</a>
        <a href="#" style={{ fontSize: "13px", color: "#202124", textDecoration: "none" }}>Images</a>
        <div style={{
          width: "32px", height: "32px", borderRadius: "50%",
          backgroundColor: "#1a73e8", display: "flex", alignItems: "center",
          justifyContent: "center", cursor: "pointer",
        }}>
          <span style={{ color: "#fff", fontSize: "13px", fontWeight: "600" }}>A</span>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "120px" }}>
        {/* Google logo */}
        <div style={{ marginBottom: "28px", fontSize: "78px", letterSpacing: "-2px", fontFamily: "'Product Sans', Arial, sans-serif", userSelect: "none" }}>
          <span style={{ color: "#4285f4" }}>G</span>
          <span style={{ color: "#ea4335" }}>o</span>
          <span style={{ color: "#fbbc05" }}>o</span>
          <span style={{ color: "#4285f4" }}>g</span>
          <span style={{ color: "#34a853" }}>l</span>
          <span style={{ color: "#ea4335" }}>e</span>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ width: "100%", maxWidth: "544px", marginBottom: "24px" }}>
          <div style={{
            display: "flex", alignItems: "center",
            border: "1px solid #dfe1e5", borderRadius: "24px",
            padding: "8px 16px", gap: "12px",
            boxShadow: "none", transition: "box-shadow 0.2s",
          }}
            onFocus={(e) => (e.currentTarget.style.boxShadow = "0 1px 6px rgba(32,33,36,.28)")}
            onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            <svg focusable="false" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="#9aa0a6" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: 1, border: "none", outline: "none",
                fontSize: "16px", color: "#202124", background: "transparent",
              }}
              autoComplete="off"
            />
            <svg focusable="false" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.42 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" fill="#4285f4" />
            </svg>
          </div>
        </form>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={handleSearch}
            style={{
              padding: "8px 18px", backgroundColor: "#f8f9fa",
              border: "1px solid #f8f9fa", borderRadius: "4px",
              fontSize: "14px", color: "#3c4043", cursor: "pointer",
            }}
          >Google Search</button>
          <button
            style={{
              padding: "8px 18px", backgroundColor: "#f8f9fa",
              border: "1px solid #f8f9fa", borderRadius: "4px",
              fontSize: "14px", color: "#3c4043", cursor: "pointer",
            }}
          >I'm Feeling Lucky</button>
        </div>

        <p style={{ marginTop: "28px", fontSize: "13px", color: "#70757a" }}>
          Google offered in: <a href="#" style={{ color: "#1a0dab", textDecoration: "none" }}>Español</a>{" "}
          <a href="#" style={{ color: "#1a0dab", textDecoration: "none" }}>Français</a>
        </p>
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: "#f2f2f2", padding: "12px 24px" }}>
        <div style={{ borderTop: "1px solid #e4e4e4", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#70757a" }}>
          <div style={{ display: "flex", gap: "20px" }}>
            <a href="#" style={{ color: "#70757a", textDecoration: "none" }}>Advertising</a>
            <a href="#" style={{ color: "#70757a", textDecoration: "none" }}>Business</a>
            <a href="#" style={{ color: "#70757a", textDecoration: "none" }}>How Search works</a>
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            <a href="#" style={{ color: "#70757a", textDecoration: "none" }}>Privacy</a>
            <a href="#" style={{ color: "#70757a", textDecoration: "none" }}>Terms</a>
            <a href="#" style={{ color: "#70757a", textDecoration: "none" }}>Settings</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FakeGoogle;

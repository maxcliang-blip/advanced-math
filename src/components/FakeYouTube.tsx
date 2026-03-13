interface FakeYouTubeProps {
  onReveal?: () => void;
}

const RECOMMENDED = [
  { title: "10 Study Techniques That Actually Work", channel: "StudyWithMe", views: "2.4M views", age: "3 months ago", dur: "12:44" },
  { title: "How to Stay Focused for Hours", channel: "Mind Academy", views: "891K views", age: "1 year ago", dur: "8:21" },
  { title: "The Best Note-Taking Method", channel: "Thomas Frank", views: "5.1M views", age: "2 years ago", dur: "11:03" },
  { title: "Pomodoro Technique Explained", channel: "Ali Abdaal", views: "3.2M views", age: "8 months ago", dur: "9:15" },
  { title: "How to Read a Textbook Efficiently", channel: "PreMed Life", views: "1.1M views", age: "1 year ago", dur: "7:52" },
  { title: "Study Music — Deep Focus Mix", channel: "Chill Music Lab", views: "18M views", age: "4 years ago", dur: "3:02:11" },
];

const FakeYouTube = ({ onReveal }: FakeYouTubeProps) => {
  return (
    <div
      style={{ fontFamily: "Roboto, Arial, sans-serif", backgroundColor: "#0f0f0f", color: "#fff", minHeight: "100vh", margin: 0, display: "flex", flexDirection: "column" }}
      onDoubleClick={onReveal}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "8px 16px", backgroundColor: "#0f0f0f", borderBottom: "1px solid #272727", gap: "16px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "32px", height: "22px", backgroundColor: "#ff0000", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderLeft: "12px solid white", marginLeft: "2px" }} />
          </div>
          <span style={{ fontSize: "18px", fontWeight: "700", letterSpacing: "-0.5px", color: "#fff" }}>YouTube</span>
        </div>

        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", maxWidth: "600px", width: "100%" }}>
            <input
              type="text"
              placeholder="Search"
              defaultValue="study music focus"
              style={{
                flex: 1, padding: "8px 16px", fontSize: "16px",
                backgroundColor: "#121212", border: "1px solid #303030", borderRight: "none",
                borderRadius: "24px 0 0 24px", color: "#fff", outline: "none",
              }}
            />
            <button style={{
              padding: "0 24px", backgroundColor: "#222222", border: "1px solid #303030",
              borderRadius: "0 24px 24px 0", color: "#fff", cursor: "pointer", fontSize: "16px",
            }}>🔍</button>
          </div>
        </div>

        <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#5f6368", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <span style={{ fontSize: "13px", fontWeight: "600" }}>A</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, maxWidth: "1280px", margin: "0 auto", width: "100%", padding: "20px 16px", gap: "24px" }}>
        {/* Main video */}
        <div style={{ flex: 1 }}>
          {/* Video player */}
          <div style={{ backgroundColor: "#000", width: "100%", paddingBottom: "56.25%", position: "relative", borderRadius: "8px", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "64px", height: "64px", backgroundColor: "rgba(0,0,0,0.7)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <div style={{ width: 0, height: 0, borderTop: "18px solid transparent", borderBottom: "18px solid transparent", borderLeft: "30px solid white", marginLeft: "6px" }} />
              </div>
            </div>
            {/* Progress bar */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", backgroundColor: "#555" }}>
              <div style={{ height: "100%", width: "34%", backgroundColor: "#ff0000" }} />
            </div>
          </div>

          {/* Video info */}
          <div style={{ padding: "12px 0" }}>
            <h1 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 8px", lineHeight: "1.4" }}>
              Study Music — Deep Focus Mix for Studying &amp; Concentration | 3 Hours
            </h1>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#5f6368" }} />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>Chill Music Lab</div>
                  <div style={{ fontSize: "12px", color: "#aaa" }}>4.8M subscribers</div>
                </div>
                <button style={{ padding: "8px 16px", backgroundColor: "#fff", color: "#000", border: "none", borderRadius: "18px", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}>Subscribe</button>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button style={{ padding: "8px 16px", backgroundColor: "#272727", border: "none", borderRadius: "18px", color: "#fff", fontSize: "14px", cursor: "pointer", display: "flex", gap: "6px", alignItems: "center" }}>
                  👍 <span>142K</span>
                </button>
                <button style={{ padding: "8px 16px", backgroundColor: "#272727", border: "none", borderRadius: "18px", color: "#fff", fontSize: "14px", cursor: "pointer" }}>
                  Share
                </button>
              </div>
            </div>
            <div style={{ marginTop: "12px", backgroundColor: "#272727", borderRadius: "8px", padding: "10px 12px" }}>
              <p style={{ fontSize: "14px", margin: "0 0 4px", fontWeight: "500" }}>18,243,891 views · 4 years ago</p>
              <p style={{ fontSize: "14px", color: "#ccc", margin: 0 }}>
                Deep focus study music to improve concentration — great for reading, writing, homework, and studying. No distractions, just music.
              </p>
            </div>
          </div>
        </div>

        {/* Recommended */}
        <div style={{ width: "380px", flexShrink: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {RECOMMENDED.map((v, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", cursor: "pointer" }}>
                <div style={{ width: "168px", flexShrink: 0, backgroundColor: "#272727", borderRadius: "8px", position: "relative", paddingBottom: "28%" }}>
                  <span style={{ position: "absolute", bottom: "4px", right: "4px", backgroundColor: "rgba(0,0,0,0.8)", color: "#fff", fontSize: "11px", padding: "1px 4px", borderRadius: "2px" }}>{v.dur}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "13px", fontWeight: "500", margin: "0 0 4px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{v.title}</p>
                  <p style={{ fontSize: "12px", color: "#aaa", margin: "0 0 2px" }}>{v.channel}</p>
                  <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>{v.views} · {v.age}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FakeYouTube;

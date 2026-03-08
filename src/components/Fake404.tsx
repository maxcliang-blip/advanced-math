interface Fake404Props {
  onReveal?: () => void;
}

const Fake404 = ({ onReveal }: Fake404Props) => {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        color: "#333",
        backgroundColor: "#fff",
        margin: 0,
        padding: "40px 20px",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: "24px", fontWeight: "normal", margin: "0 0 10px" }}>
        This page isn't working
      </h1>
      <p style={{ fontSize: "14px", color: "#666", margin: "0 0 20px" }}>
        <strong>{window.location.hostname}</strong> didn't send any data
        {onReveal ? (
          <span
            onClick={onReveal}
            style={{ cursor: "default", userSelect: "none" }}
            title=""
          >.</span>
        ) : "."}
      </p>
      <p style={{ fontSize: "14px", color: "#666" }}>ERR_EMPTY_RESPONSE</p>
      <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "30px 0" }} />
      <p style={{ fontSize: "13px", color: "#888" }}>
        Try:
      </p>
      <ul style={{ fontSize: "13px", color: "#888", paddingLeft: "20px" }}>
        <li>Checking the connection</li>
        <li>Checking the proxy and the firewall</li>
        <li>Running Windows Network Diagnostics</li>
      </ul>
    </div>
  );
};

export default Fake404;

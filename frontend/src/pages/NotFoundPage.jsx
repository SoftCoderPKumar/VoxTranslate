import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <div
    className="page-wrapper"
    style={{
      background:
        "radial-gradient(ellipse at center, rgba(255,107,26,0.1) 0%, transparent 70%), var(--dark-bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      textAlign: "center",
      padding: "2rem",
    }}
  >
    <div style={{ maxWidth: 480 }}>
      <div
        style={{ fontSize: "6rem", fontWeight: 800, lineHeight: 1 }}
        className="gradient-text"
      >
        404
      </div>
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          marginTop: "0.5rem",
          marginBottom: "0.75rem",
        }}
      >
        Page Not Found
      </h2>
      <p
        style={{
          color: "var(--dark-muted)",
          marginBottom: "2rem",
          lineHeight: 1.7,
        }}
      >
        The page you're looking for doesn't exist or has been moved. Let's get
        you back on track.
      </p>
      <div className="d-flex gap-3 justify-content-center flex-wrap">
        <Link to="/" className="btn-orange btn">
          <i className="bi bi-house me-2" />
          Go Home
        </Link>
        <Link to="/translate" className="btn-outline-orange btn">
          <i className="bi bi-mic me-2" />
          Translator
        </Link>
      </div>
    </div>
  </div>
);

export default NotFoundPage;

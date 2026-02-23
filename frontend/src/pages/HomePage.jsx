import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FeatureCard = ({ icon, title, desc, isGreen }) => (
  <div
    className="card-dark p-4 h-100 hover-lift"
    style={{ borderRadius: "var(--radius-lg)" }}
  >
    <div className={`feature-icon ${isGreen ? "green" : ""}`}>
      <span>{icon}</span>
    </div>
    <h5 style={{ fontWeight: 600, marginBottom: 8, color: "var(--dark-text)" }}>
      {title}
    </h5>
    <p
      style={{
        color: "var(--dark-muted)",
        fontSize: "0.93rem",
        marginBottom: 0,
      }}
    >
      {desc}
    </p>
  </div>
);

const StatBox = ({ value, label }) => (
  <div className="text-center">
    <div
      style={{ fontSize: "2.2rem", fontWeight: 700 }}
      className="gradient-text"
    >
      {value}
    </div>
    <div style={{ color: "var(--dark-muted)", fontSize: "0.9rem" }}>
      {label}
    </div>
  </div>
);

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="page-wrapper">
      {/* Hero Section */}
      <section className="bg-gradient-hero" style={{ padding: "90px 0 80px" }}>
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 animate-fadeup">
              <div className="d-flex align-items-center gap-2 mb-4">
                <span className="badge-orange">🎙️ AI-Powered Translation</span>
                <span className="badge-green">🌍 70+ Languages</span>
              </div>
              <h1
                style={{
                  fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
                  fontWeight: 800,
                  lineHeight: 1.15,
                  marginBottom: "1.25rem",
                  letterSpacing: "-0.02em",
                }}
              >
                Speak Any Language,{" "}
                <span className="gradient-text">Instantly</span>
              </h1>
              <p
                style={{
                  fontSize: "1.15rem",
                  color: "var(--dark-muted)",
                  maxWidth: 500,
                  lineHeight: 1.8,
                  marginBottom: "2rem",
                }}
              >
                Real-time audio translation powered by AI. Record your voice,
                get instant translations into 70+ languages with studio-quality
                accuracy.
              </p>

              <div className="d-flex flex-wrap gap-3 mb-4">
                {user ? (
                  <Link to="/translate" className="btn-orange btn btn-lg">
                    <i className="bi bi-mic-fill me-2" />
                    Start Translating
                  </Link>
                ) : (
                  <>
                    <Link to="/signup" className="btn-orange btn btn-lg">
                      <i className="bi bi-rocket-takeoff me-2" />
                      Get Started Free
                    </Link>
                    <Link to="/login" className="btn-outline-orange btn btn-lg">
                      Sign In
                    </Link>
                  </>
                )}
              </div>

              {/* Trust indicators */}
              <div
                className="d-flex align-items-center gap-3 flex-wrap"
                style={{ fontSize: "0.85rem", color: "var(--dark-muted)" }}
              >
                <span>
                  <i className="bi bi-shield-check text-orange me-1" />
                  Secure & Private
                </span>
                <span>
                  <i
                    className="bi bi-lightning-fill text-green me-1"
                    style={{ color: "var(--green-light)" }}
                  />
                  Sub-second latency
                </span>
                <span>
                  <i className="bi bi-globe text-orange me-1" />
                  Works Worldwide
                </span>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="col-lg-6 animate-float d-none d-lg-block">
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {/* Main orb */}
                <div
                  style={{
                    width: 340,
                    height: 340,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(ellipse at 40% 40%, rgba(255,107,26,0.3) 0%, rgba(45,125,70,0.2) 50%, transparent 70%)",
                    border: "1px solid rgba(255,107,26,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: 220,
                      height: 220,
                      borderRadius: "50%",
                      background:
                        "radial-gradient(ellipse, rgba(255,107,26,0.2), rgba(45,125,70,0.15))",
                      border: "1px solid rgba(255,107,26,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ fontSize: "5rem" }}>🎙️</div>
                  </div>

                  {/* Floating language chips */}
                  {[
                    { label: "🇯🇵 Japanese", style: { top: "5%", left: "-5%" } },
                    {
                      label: "🇫🇷 French",
                      style: { top: "15%", right: "-10%" },
                    },
                    {
                      label: "🇩🇪 German",
                      style: { bottom: "25%", right: "-15%" },
                    },
                    {
                      label: "🇪🇸 Spanish",
                      style: { bottom: "5%", left: "0%" },
                    },
                    { label: "🇮🇳 Hindi", style: { top: "45%", left: "-18%" } },
                  ].map((chip, i) => (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        ...chip.style,
                        background: "var(--dark-surface)",
                        border: "1px solid var(--dark-border)",
                        borderRadius: "var(--radius-full)",
                        padding: "6px 14px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "var(--dark-text)",
                        whiteSpace: "nowrap",
                        animation: `float ${3 + i * 0.4}s ease-in-out infinite`,
                        animationDelay: `${i * 0.3}s`,
                      }}
                    >
                      {chip.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="row g-4 mt-4">
            <div className="col-12">
              <div
                style={{
                  background: "rgba(22,27,34,0.6)",
                  border: "1px solid var(--dark-border)",
                  borderRadius: "var(--radius-xl)",
                  padding: "1.5rem 2rem",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="row g-3 text-center">
                  <div className="col-6 col-md-3">
                    <StatBox value="70+" label="Languages" />
                  </div>
                  <div className="col-6 col-md-3">
                    <StatBox value="<1s" label="Avg. Latency" />
                  </div>
                  <div className="col-6 col-md-3">
                    <StatBox value="99.9%" label="Uptime" />
                  </div>
                  <div className="col-6 col-md-3">
                    <StatBox value="AES-256" label="Encryption" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: "80px 0", background: "var(--dark-bg)" }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2
              style={{
                fontSize: "2.2rem",
                fontWeight: 700,
                marginBottom: "0.75rem",
              }}
            >
              Everything You Need for{" "}
              <span className="gradient-text">Seamless Translation</span>
            </h2>
            <p
              style={{
                color: "var(--dark-muted)",
                fontSize: "1.05rem",
                maxWidth: 540,
                margin: "0 auto",
              }}
            >
              Powerful features designed for real-world communication
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <FeatureCard
                icon="🎤"
                title="Real-time Voice Translation"
                desc="Speak and get instant translations. Our AI processes audio with industry-leading accuracy."
              />
            </div>
            <div className="col-md-4">
              <FeatureCard
                icon="🌍"
                title="70+ Languages Supported"
                desc="From Arabic to Zulu, we cover all major and many rare languages with full bidirectional support."
                isGreen
              />
            </div>
            <div className="col-md-4">
              <FeatureCard
                icon="⚡"
                title="Lightning Fast"
                desc="WebSocket-powered streaming delivers translations in under a second for fluid conversations."
              />
            </div>
            <div className="col-md-4">
              <FeatureCard
                icon="🔐"
                title="Privacy First"
                desc="End-to-end encryption, secure JWT authentication, and zero data retention policies."
                isGreen
              />
            </div>
            <div className="col-md-4">
              <FeatureCard
                icon="📚"
                title="Translation History"
                desc="Full searchable history of all your translations with export and sharing capabilities."
              />
            </div>
            <div className="col-md-4">
              <FeatureCard
                icon="🤖"
                title="OpenAI Integration"
                desc="Leverage GPT-4 and Whisper for state-of-the-art accuracy. Bring your own API key."
                isGreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section style={{ padding: "80px 0", background: "var(--dark-surface)" }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2
              style={{
                fontSize: "2.2rem",
                fontWeight: 700,
                marginBottom: "0.75rem",
              }}
            >
              How It <span className="gradient-text">Works</span>
            </h2>
          </div>
          <div className="row g-4 justify-content-center">
            {[
              {
                step: "01",
                icon: "✍️",
                title: "Sign Up",
                desc: "Create your free account in seconds",
              },
              {
                step: "02",
                icon: "🎤",
                title: "Record",
                desc: "Click record and speak naturally",
              },
              {
                step: "03",
                icon: "🌐",
                title: "Choose Language",
                desc: "Select your target language",
              },
              {
                step: "04",
                icon: "⚡",
                title: "Get Translation",
                desc: "Receive instant AI-powered translation",
              },
            ].map((item) => (
              <div key={item.step} className="col-sm-6 col-lg-3">
                <div className="text-center">
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--orange-primary)",
                      letterSpacing: "0.1em",
                      marginBottom: 8,
                    }}
                  >
                    STEP {item.step}
                  </div>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, rgba(255,107,26,0.15), rgba(45,125,70,0.1))",
                      border: "1.5px solid rgba(255,107,26,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.75rem",
                      margin: "0 auto 1rem",
                    }}
                  >
                    {item.icon}
                  </div>
                  <h5 style={{ fontWeight: 600, marginBottom: 6 }}>
                    {item.title}
                  </h5>
                  <p
                    style={{
                      color: "var(--dark-muted)",
                      fontSize: "0.9rem",
                      marginBottom: 0,
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-5">
            <Link
              to={user ? "/translate" : "/signup"}
              className="btn-orange btn btn-lg"
            >
              {user ? "🎙️ Start Now" : "🚀 Get Started Free"}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: "var(--dark-bg)",
          borderTop: "1px solid var(--dark-border)",
          padding: "40px 0 24px",
        }}
      >
        <div className="container">
          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span style={{ fontSize: "1.3rem" }}>🎙️</span>
                <span className="logo-text">VoxTranslate</span>
              </div>
              <p
                style={{
                  color: "var(--dark-muted)",
                  fontSize: "0.9rem",
                  maxWidth: 260,
                }}
              >
                Breaking language barriers with AI-powered real-time
                translation.
              </p>
            </div>
            <div className="col-md-4">
              <h6
                style={{
                  fontWeight: 600,
                  marginBottom: 12,
                  color: "var(--dark-text)",
                }}
              >
                Navigation
              </h6>
              <div className="d-flex flex-column gap-2">
                {[
                  ["/", "Home"],
                  ["/about", "About"],
                  ["/terms", "Terms & Conditions"],
                ].map(([to, label]) => (
                  <Link
                    key={to}
                    to={to}
                    style={{
                      color: "var(--dark-muted)",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      transition: "var(--transition)",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.color = "var(--orange-primary)")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.color = "var(--dark-muted)")
                    }
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="col-md-4">
              <h6
                style={{
                  fontWeight: 600,
                  marginBottom: 12,
                  color: "var(--dark-text)",
                }}
              >
                Account
              </h6>
              <div className="d-flex flex-column gap-2">
                {user
                  ? [
                      ["/translate", "Translator"],
                      ["/history", "History"],
                      ["/settings", "Settings"],
                    ]
                  : [
                      ["/login", "Login"],
                      ["/signup", "Sign Up"],
                    ].map(([to, label]) => (
                      <Link
                        key={to}
                        to={to}
                        style={{
                          color: "var(--dark-muted)",
                          textDecoration: "none",
                          fontSize: "0.9rem",
                        }}
                      >
                        {label}
                      </Link>
                    ))}
              </div>
            </div>
          </div>
          <hr className="divider-gradient" style={{ margin: "0 0 1.25rem" }} />
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <p
              style={{
                color: "var(--dark-muted)",
                fontSize: "0.85rem",
                margin: 0,
              }}
            >
              © 2024 VoxTranslate. All rights reserved.
            </p>
            <div className="d-flex gap-3">
              {["🐦", "💼", "🐙"].map((icon, i) => (
                <span
                  key={i}
                  style={{
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    opacity: 0.6,
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.opacity = "1")}
                  onMouseLeave={(e) => (e.target.style.opacity = "0.6")}
                >
                  {icon}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

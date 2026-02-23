import React from "react";
import { Link } from "react-router-dom";

const AboutPage = () => (
  <div className="page-wrapper" style={{ background: "var(--dark-bg)" }}>
    {/* Hero */}
    <section
      style={{
        background:
          "radial-gradient(ellipse at 30% 50%, rgba(255,107,26,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(45,125,70,0.12) 0%, transparent 60%), var(--dark-surface)",
        padding: "70px 0 60px",
        borderBottom: "1px solid var(--dark-border)",
      }}
    >
      <div className="container text-center">
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background:
              "linear-gradient(135deg, var(--orange-primary), var(--green-primary))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            margin: "0 auto 1.5rem",
            boxShadow: "0 12px 40px rgba(255,107,26,0.35)",
          }}
        >
          🎙️
        </div>
        <h1
          style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 800,
            marginBottom: "1rem",
          }}
        >
          About <span className="gradient-text">VoxTranslate</span>
        </h1>
        <p
          style={{
            color: "var(--dark-muted)",
            fontSize: "1.1rem",
            maxWidth: 600,
            margin: "0 auto",
            lineHeight: 1.8,
          }}
        >
          We're on a mission to break language barriers and make global
          communication effortless through AI-powered real-time translation.
        </p>
      </div>
    </section>

    {/* Mission */}
    <section style={{ padding: "70px 0" }}>
      <div className="container">
        <div className="row g-5 align-items-center">
          <div className="col-lg-5">
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                marginBottom: "1rem",
              }}
            >
              Our <span className="gradient-text">Mission</span>
            </h2>
            <p
              style={{
                color: "var(--dark-muted)",
                lineHeight: 1.8,
                marginBottom: "1rem",
              }}
            >
              Language should never be a barrier to human connection, business
              success, or personal growth. VoxTranslate was built with a single
              purpose: to make every conversation possible, regardless of
              language.
            </p>
            <p style={{ color: "var(--dark-muted)", lineHeight: 1.8 }}>
              We leverage the latest in AI — OpenAI's Whisper and GPT models —
              combined with a modern, secure architecture to deliver
              translations you can trust in real-time.
            </p>
          </div>
          <div className="col-lg-7">
            <div className="row g-3">
              {[
                {
                  icon: "🎯",
                  title: "Accuracy First",
                  desc: "Powered by state-of-the-art AI models for the most accurate translations available.",
                },
                {
                  icon: "⚡",
                  title: "Real-Time Speed",
                  desc: "WebSocket-powered architecture delivers translations with sub-second latency.",
                },
                {
                  icon: "🔐",
                  title: "Privacy & Security",
                  desc: "AES-256 encryption, secure JWT auth, and zero plain-text data storage.",
                },
                {
                  icon: "🌍",
                  title: "Global Reach",
                  desc: "70+ languages supported, covering billions of speakers worldwide.",
                },
              ].map((item, i) => (
                <div key={i} className="col-6">
                  <div className="card-dark p-3 h-100">
                    <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>
                      {item.icon}
                    </div>
                    <div
                      style={{
                        fontWeight: 600,
                        marginBottom: 4,
                        fontSize: "0.95rem",
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        color: "var(--dark-muted)",
                        fontSize: "0.83rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Tech Stack */}
    <section
      style={{
        padding: "60px 0",
        background: "var(--dark-surface)",
        borderTop: "1px solid var(--dark-border)",
        borderBottom: "1px solid var(--dark-border)",
      }}
    >
      <div className="container">
        <div className="text-center mb-5">
          <h2 style={{ fontSize: "1.9rem", fontWeight: 700 }}>
            Built With Modern <span className="gradient-text">Technology</span>
          </h2>
        </div>
        <div className="row g-3 justify-content-center">
          {[
            { name: "React", desc: "Frontend UI", color: "var(--accent-teal)" },
            {
              name: "Node.js",
              desc: "Backend Runtime",
              color: "var(--green-light)",
            },
            {
              name: "Express",
              desc: "Web Framework",
              color: "var(--dark-muted)",
            },
            { name: "MongoDB", desc: "Database", color: "#47A248" },
            { name: "Redis", desc: "Token Cache", color: "#E53935" },
            {
              name: "OpenAI",
              desc: "AI Engine",
              color: "var(--orange-primary)",
            },
            { name: "Bootstrap", desc: "CSS Framework", color: "#7952B3" },
            {
              name: "WebSocket",
              desc: "Real-time",
              color: "var(--accent-gold)",
            },
          ].map((tech, i) => (
            <div key={i} className="col-6 col-sm-4 col-md-3 col-lg-2">
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--dark-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "14px 12px",
                  textAlign: "center",
                  transition: "var(--transition)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "var(--orange-primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "var(--dark-border)")
                }
              >
                <div
                  style={{
                    fontWeight: 700,
                    color: tech.color,
                    marginBottom: 4,
                    fontSize: "0.95rem",
                  }}
                >
                  {tech.name}
                </div>
                <div
                  style={{ fontSize: "0.75rem", color: "var(--dark-muted)" }}
                >
                  {tech.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Security */}
    <section style={{ padding: "70px 0" }}>
      <div className="container">
        <div className="text-center mb-5">
          <h2 style={{ fontSize: "1.9rem", fontWeight: 700 }}>
            Security <span className="gradient-text">by Design</span>
          </h2>
          <p
            style={{
              color: "var(--dark-muted)",
              maxWidth: 500,
              margin: "0.75rem auto 0",
            }}
          >
            Your data privacy is not an afterthought — it's fundamental to how
            VoxTranslate is built.
          </p>
        </div>
        <div className="row g-4 justify-content-center">
          {[
            {
              icon: "🍪",
              title: "Secure HttpOnly Cookies",
              desc: "JWT tokens stored in HttpOnly, Secure, SameSite cookies — not vulnerable to XSS attacks.",
            },
            {
              icon: "🔄",
              title: "Token Rotation",
              desc: "Refresh tokens stored in Redis and rotated on every use. Stolen tokens are automatically invalidated.",
            },
            {
              icon: "🔑",
              title: "Encrypted API Keys",
              desc: "Your OpenAI API keys are encrypted with AES-256-CBC before being stored in the database.",
            },
            {
              icon: "🛡️",
              title: "Rate Limiting",
              desc: "IP-based rate limiting on all endpoints prevents abuse and brute-force attacks.",
            },
          ].map((item, i) => (
            <div key={i} className="col-md-6 col-lg-3">
              <div className="card-dark p-4 h-100 text-center">
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>
                  {item.icon}
                </div>
                <h6 style={{ fontWeight: 700, marginBottom: 8 }}>
                  {item.title}
                </h6>
                <p
                  style={{
                    color: "var(--dark-muted)",
                    fontSize: "0.85rem",
                    margin: 0,
                    lineHeight: 1.7,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section
      style={{
        padding: "60px 0 80px",
        background: "var(--dark-surface)",
        borderTop: "1px solid var(--dark-border)",
      }}
    >
      <div className="container text-center">
        <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>
          Ready to Break{" "}
          <span className="gradient-text">Language Barriers?</span>
        </h2>
        <p
          style={{
            color: "var(--dark-muted)",
            marginBottom: "2rem",
            maxWidth: 460,
            margin: "0 auto 2rem",
          }}
        >
          Join thousands of users who communicate across languages effortlessly.
        </p>
        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <Link to="/signup" className="btn-orange btn btn-lg">
            🚀 Get Started Free
          </Link>
          <Link to="/terms" className="btn-outline-orange btn btn-lg">
            📄 Terms & Conditions
          </Link>
        </div>
      </div>
    </section>
  </div>
);

export default AboutPage;

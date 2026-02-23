import React, { useState } from "react";

const Section = ({ id, title, children }) => (
  <div id={id} style={{ marginBottom: "2.5rem", scrollMarginTop: "90px" }}>
    <h3
      style={{
        fontSize: "1.15rem",
        fontWeight: 700,
        marginBottom: "0.75rem",
        color: "var(--orange-light)",
      }}
    >
      {title}
    </h3>
    {children}
  </div>
);

const TermsPage = () => {
  const [activeSection, setActiveSection] = useState(null);
  const lastUpdated = "February 20, 2026";

  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms" },
    { id: "service", title: "2. Description of Service" },
    { id: "accounts", title: "3. User Accounts" },
    { id: "privacy", title: "4. Privacy & Data" },
    { id: "apikeys", title: "5. API Keys & Third-Party Services" },
    { id: "acceptable", title: "6. Acceptable Use" },
    { id: "ip", title: "7. Intellectual Property" },
    { id: "liability", title: "8. Limitation of Liability" },
    { id: "changes", title: "9. Changes to Terms" },
    { id: "contact", title: "10. Contact Information" },
  ];

  const textStyle = {
    color: "var(--dark-muted)",
    lineHeight: 1.8,
    fontSize: "0.95rem",
  };

  return (
    <div className="page-wrapper" style={{ background: "var(--dark-bg)" }}>
      {/* Header */}
      <section
        style={{
          background: "var(--dark-surface)",
          borderBottom: "1px solid var(--dark-border)",
          padding: "50px 0 40px",
        }}
      >
        <div className="container">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background:
                  "linear-gradient(135deg, var(--orange-primary), var(--green-primary))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
              }}
            >
              📄
            </div>
            <div>
              <h1
                style={{ fontSize: "1.9rem", fontWeight: 800, marginBottom: 4 }}
              >
                Terms & <span className="gradient-text">Conditions</span>
              </h1>
              <p
                style={{
                  color: "var(--dark-muted)",
                  margin: 0,
                  fontSize: "0.88rem",
                }}
              >
                Last updated: {lastUpdated}
              </p>
            </div>
          </div>
          <div
            style={{
              background: "rgba(247,201,72,0.08)",
              border: "1px solid rgba(247,201,72,0.25)",
              borderRadius: "var(--radius-md)",
              padding: "12px 16px",
              fontSize: "0.875rem",
              color: "var(--accent-gold)",
            }}
          >
            <i className="bi bi-exclamation-triangle-fill me-2" />
            Please read these terms carefully before using VoxTranslate. By
            accessing our services, you agree to be bound by these terms.
          </div>
        </div>
      </section>

      <div className="container py-5">
        <div className="row g-4">
          {/* Table of Contents Sidebar */}
          <div className="col-lg-3">
            <div
              style={{
                background: "var(--dark-surface)",
                border: "1px solid var(--dark-border)",
                borderRadius: "var(--radius-lg)",
                padding: "1.25rem",
                position: "sticky",
                top: 90,
              }}
            >
              <h6
                style={{
                  fontWeight: 700,
                  marginBottom: "0.75rem",
                  color: "var(--dark-muted)",
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Contents
              </h6>
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setActiveSection(s.id)}
                  style={{
                    display: "block",
                    padding: "5px 8px",
                    fontSize: "0.82rem",
                    color:
                      activeSection === s.id
                        ? "var(--orange-primary)"
                        : "var(--dark-muted)",
                    textDecoration: "none",
                    borderLeft: `2px solid ${activeSection === s.id ? "var(--orange-primary)" : "transparent"}`,
                    marginBottom: 2,
                    transition: "var(--transition)",
                    borderRadius: "0 4px 4px 0",
                  }}
                  onMouseEnter={(e) => {
                    if (activeSection !== s.id)
                      e.target.style.color = "var(--dark-text)";
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== s.id)
                      e.target.style.color = "var(--dark-muted)";
                  }}
                >
                  {s.title}
                </a>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="col-lg-9">
            <div
              style={{
                background: "var(--dark-surface)",
                border: "1px solid var(--dark-border)",
                borderRadius: "var(--radius-xl)",
                padding: "2.5rem",
              }}
            >
              <Section id="acceptance" title="1. Acceptance of Terms">
                <p style={textStyle}>
                  By accessing or using VoxTranslate ("Service"), you agree to
                  be bound by these Terms and Conditions ("Terms"). If you do
                  not agree to these Terms, please do not use our Service.
                </p>
                <p style={textStyle}>
                  These Terms constitute a legally binding agreement between you
                  and VoxTranslate Inc. Your continued use of the Service
                  constitutes your acceptance of any modifications to these
                  Terms.
                </p>
              </Section>

              <hr className="divider-gradient" />

              <Section id="service" title="2. Description of Service">
                <p style={textStyle}>VoxTranslate provides:</p>
                <ul style={{ ...textStyle, paddingLeft: "1.5rem" }}>
                  <li style={{ marginBottom: 6 }}>
                    Real-time audio and text translation powered by AI
                  </li>
                  <li style={{ marginBottom: 6 }}>
                    Support for 70+ languages with automatic language detection
                  </li>
                  <li style={{ marginBottom: 6 }}>
                    Translation history storage and management
                  </li>
                  <li style={{ marginBottom: 6 }}>
                    Integration with OpenAI's Whisper and GPT APIs
                  </li>
                  <li style={{ marginBottom: 6 }}>
                    Secure user account management
                  </li>
                </ul>
                <p style={textStyle}>
                  We reserve the right to modify, suspend, or discontinue any
                  aspect of the Service at any time with reasonable notice.
                </p>
              </Section>

              <hr className="divider-gradient" />

              <Section id="accounts" title="3. User Accounts">
                <p style={textStyle}>
                  To use certain features you must create an account. You agree
                  to:
                </p>
                <ul style={{ ...textStyle, paddingLeft: "1.5rem" }}>
                  <li style={{ marginBottom: 6 }}>
                    Provide accurate, current, and complete information during
                    registration
                  </li>
                  <li style={{ marginBottom: 6 }}>
                    Maintain the security of your password and account
                    credentials
                  </li>
                  <li style={{ marginBottom: 6 }}>
                    Notify us immediately of any unauthorized access to your
                    account
                  </li>
                  <li style={{ marginBottom: 6 }}>
                    Be responsible for all activities that occur under your
                    account
                  </li>
                  <li style={{ marginBottom: 6 }}>
                    Not share your account with others or create multiple
                    accounts
                  </li>
                </ul>
                <p style={textStyle}>
                  We reserve the right to suspend or terminate accounts that
                  violate these Terms, engage in fraudulent activity, or pose a
                  security risk to our platform or other users.
                </p>
              </Section>

              <hr className="divider-gradient" />

              <Section id="privacy" title="4. Privacy & Data">
                <p style={textStyle}>
                  Your privacy is important to us. Our data practices include:
                </p>
                <ul style={{ ...textStyle, paddingLeft: "1.5rem" }}>
                  <li style={{ marginBottom: 6 }}>
                    Audio recordings are processed transiently and not stored
                    permanently on our servers
                  </li>
                  <li style={{ marginBottom: 6 }}>
                    Translation text may be stored in your translation history
                    for your convenience
                  </li>
                  <li style={{ marginBottom: 6 }}>
                    Your API keys are encrypted with AES-256-CBC encryption
                    before storage
                  </li>
                  <li style={{ marginBottom: 6 }}>
                    We use secure, HttpOnly cookies for authentication token
                    storage
                  </li>
                  <li style={{ marginBottom: 6 }}>
                    We do not sell your personal data to third parties
                  </li>
                  <li style={{ marginBottom: 6 }}>
                    Data transmitted to OpenAI is subject to OpenAI's Privacy
                    Policy
                  </li>
                </ul>
                <p style={textStyle}>
                  You may request deletion of your account and associated data
                  at any time by contacting our support team.
                </p>
              </Section>

              <hr className="divider-gradient" />

              <Section id="apikeys" title="5. API Keys & Third-Party Services">
                <p style={textStyle}>
                  VoxTranslate integrates with OpenAI's API. When you provide
                  your own API key:
                </p>
                <ul style={{ ...textStyle, paddingLeft: "1.5rem" }}>
                  <li style={{ marginBottom: 6 }}>
                    You are solely responsible for your OpenAI API usage and
                    associated costs
                  </li>
                  <li style={{ marginBottom: 6 }}>
                    Your API key is encrypted and stored securely; we never log
                    or display it in plaintext
                  </li>
                  <li style={{ marginBottom: 6 }}>
                    VoxTranslate is not responsible for any charges incurred on
                    your OpenAI account
                  </li>
                  <li style={{ marginBottom: 6 }}>
                    You must comply with OpenAI's Terms of Service and Usage
                    Policies
                  </li>
                  <li style={{ marginBottom: 6 }}>
                    You may remove your API key at any time from the Settings
                    page
                  </li>
                </ul>
              </Section>

              <hr className="divider-gradient" />

              <Section id="acceptable" title="6. Acceptable Use">
                <p style={textStyle}>You agree NOT to use VoxTranslate to:</p>
                <ul style={{ ...textStyle, paddingLeft: "1.5rem" }}>
                  <li style={{ marginBottom: 6 }}>
                    Translate content that is illegal, harmful, abusive, or
                    offensive
                  </li>
                  <li style={{ marginBottom: 6 }}>
                    Circumvent, disable, or interfere with security features
                  </li>
                  <li style={{ marginBottom: 6 }}>
                    Attempt to access other users' accounts or data
                  </li>
                  <li style={{ marginBottom: 6 }}>
                    Use automated scripts to abuse the service or circumvent
                    rate limits
                  </li>
                  <li style={{ marginBottom: 6 }}>
                    Infringe on intellectual property rights of others
                  </li>
                  <li style={{ marginBottom: 6 }}>
                    Violate any applicable local, national, or international
                    laws
                  </li>
                </ul>
                <p style={textStyle}>
                  Violation of these terms may result in immediate account
                  suspension without notice.
                </p>
              </Section>

              <hr className="divider-gradient" />

              <Section id="ip" title="7. Intellectual Property">
                <p style={textStyle}>
                  The VoxTranslate service, including its code, design,
                  trademarks, and content (excluding user-provided content), is
                  owned by VoxTranslate Inc. and protected by intellectual
                  property laws.
                </p>
                <p style={textStyle}>
                  You retain ownership of any text or audio content you submit.
                  By using our Service, you grant us a limited, non-exclusive
                  license to process your content solely for the purpose of
                  providing translation services.
                </p>
              </Section>

              <hr className="divider-gradient" />

              <Section id="liability" title="8. Limitation of Liability">
                <p style={textStyle}>
                  VoxTranslate is provided "as is" without warranties of any
                  kind. We do not guarantee that translations will be 100%
                  accurate, and you should not rely solely on AI translations
                  for critical communications such as medical, legal, or
                  safety-critical contexts.
                </p>
                <p style={textStyle}>
                  To the maximum extent permitted by law, VoxTranslate shall not
                  be liable for any indirect, incidental, special,
                  consequential, or punitive damages resulting from your use of
                  the service.
                </p>
              </Section>

              <hr className="divider-gradient" />

              <Section id="changes" title="9. Changes to Terms">
                <p style={textStyle}>
                  We reserve the right to update these Terms at any time. We
                  will notify registered users of significant changes via email
                  or in-app notification. Continued use of the Service after
                  changes constitutes acceptance of the new Terms. We recommend
                  reviewing these Terms periodically.
                </p>
              </Section>

              <hr className="divider-gradient" />

              <Section id="contact" title="10. Contact Information">
                <p style={textStyle}>
                  For questions about these Terms, privacy concerns, or support:
                </p>
                <div
                  style={{
                    background: "rgba(255,107,26,0.06)",
                    border: "1px solid rgba(255,107,26,0.2)",
                    borderRadius: "var(--radius-md)",
                    padding: "1rem 1.25rem",
                  }}
                >
                  <div style={{ marginBottom: 6 }}>
                    📧 <strong>Email:</strong>{" "}
                    <span style={{ color: "var(--orange-light)" }}>
                      pappukumar2190@gmail.com
                    </span>
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    🏢 <strong>Company:</strong> VoxTranslate Inc.
                  </div>
                  <div>
                    📍 <strong>Address:</strong> c-18 IT tower, sector-45 Noida
                    U.P India
                  </div>
                </div>
              </Section>

              {/* Footer note */}
              <div
                style={{
                  background: "rgba(45,125,70,0.08)",
                  border: "1px solid rgba(45,125,70,0.2)",
                  borderRadius: "var(--radius-md)",
                  padding: "12px 16px",
                  fontSize: "0.85rem",
                  color: "var(--green-light)",
                  marginTop: "2rem",
                }}
              >
                <i className="bi bi-check-circle-fill me-2" />
                These terms are effective as of {lastUpdated}. By creating an
                account, you acknowledge that you have read and understood these
                Terms.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;

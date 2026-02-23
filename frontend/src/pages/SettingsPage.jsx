import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

const Section = ({ title, icon, children }) => (
  <div className="card-dark p-4 mb-4">
    <h5
      style={{
        fontWeight: 700,
        marginBottom: "1.25rem",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span style={{ fontSize: "1.2rem" }}>{icon}</span>
      {title}
    </h5>
    {children}
  </div>
);

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [openAIApiKey, setOpenAIApiKey] = useState("");
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [savingOpenAIKey, setSavingOpenAIKey] = useState(false);
  const [removingOpenAIKey, setRemovingOpenAIKey] = useState(false);

  const [groqAIApiKey, setGroqAIApiKey] = useState("");
  const [showGroqAIKey, setShowGroqAIKey] = useState(false);
  const [savingGroqAIKey, setSavingGroqAIKey] = useState(false);
  const [removingGroqAIKey, setRemovingGroqAIKey] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: user?.name || "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPwd, setSavingPwd] = useState(false);

  const handleSaveOpenAIApiKey = async () => {
    if (!openAIApiKey.trim()) {
      toast.error("Please enter an OpenAI API key");
      return;
    }
    setSavingOpenAIKey(true);
    try {
      await api.put("/api/user/api-key", {
        apiKey: openAIApiKey.trim(),
        provider: "openai",
      });
      updateUser({ hasOpenApiKey: true });
      setOpenAIApiKey("");
      toast.success("OpenAI API key saved and verified! ✅");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save OpenAI API key");
    } finally {
      setSavingOpenAIKey(false);
    }
  };

  const handleRemoveOpenAIApiKey = async () => {
    if (
      !window.confirm(
        "Remove your OpenAI API key? OpenAI translation will be disabled.",
      )
    )
      return;
    setRemovingOpenAIKey(true);
    try {
      await api.delete("/api/user/api-key", {
        data: {
          provider: "openai",
        },
      });
      updateUser({ hasOpenApiKey: false });
      toast.success("OpenAI API key removed");
    } catch {
      toast.error("Failed to remove OpenAI API key");
    } finally {
      setRemovingOpenAIKey(false);
    }
  };

  const handleSaveGroqAIApiKey = async () => {
    if (!groqAIApiKey.trim()) {
      toast.error("Please enter an GroqAI API key");
      return;
    }
    setSavingGroqAIKey(true);
    try {
      await api.put("/api/user/api-key", {
        apiKey: groqAIApiKey.trim(),
        provider: "groq",
      });
      updateUser({ hasGroqApiKey: true });
      setGroqAIApiKey("");
      toast.success("GroqAI API key saved and verified! ✅");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save GroqAI API key");
    } finally {
      setSavingGroqAIKey(false);
    }
  };

  const handleRemoveGroqAIApiKey = async () => {
    if (
      !window.confirm(
        "Remove your GroqAI API key? GroqAI translation will be disabled.",
      )
    )
      return;
    setRemovingGroqAIKey(true);
    try {
      await api.delete("/api/user/api-key", {
        data: {
          provider: "groq",
        },
      });
      updateUser({ hasGroqApiKey: false });
      toast.success("GroqAI API key removed");
    } catch {
      toast.error("Failed to remove GroqAI API key");
    } finally {
      setRemovingGroqAIKey(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await api.put("/api/user/profile", profileForm);
      updateUser(res.data.user);
      toast.success("Profile updated! ✅");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwdForm.currentPassword || !pwdForm.newPassword) {
      toast.error("All fields required");
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (pwdForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSavingPwd(true);
    try {
      await api.put("/api/user/password", {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed. Please log in again.");
      setTimeout(() => (window.location.href = "/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ background: "var(--dark-bg)" }}>
      <div className="container py-4" style={{ maxWidth: 700 }}>
        <div className="mb-4">
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 4 }}>
            <span className="gradient-text">Settings</span>
          </h1>
          <p
            style={{
              color: "var(--dark-muted)",
              fontSize: "0.9rem",
              margin: 0,
            }}
          >
            Manage your account and preferences
          </p>
        </div>

        {/* Account Info */}
        <Section title="Account Information" icon="👤">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "12px 16px",
              background: "rgba(255,107,26,0.05)",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(255,107,26,0.15)",
              marginBottom: "1.25rem",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, var(--orange-primary), var(--green-primary))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.3rem",
                fontWeight: 700,
                color: "white",
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{user?.name}</div>
              <div style={{ color: "var(--dark-muted)", fontSize: "0.88rem" }}>
                {user?.email}
              </div>
              <div style={{ marginTop: 4 }}>
                <span
                  className={
                    user?.hasOpenApiKey ? "badge-green" : "badge-orange"
                  }
                  style={{ fontSize: "0.72rem" }}
                >
                  {user?.hasOpenApiKey
                    ? "✅ OpenAI Ready"
                    : "⚠️ No OpenAI API Key"}
                </span>
                <span
                  className={
                    user?.hasGroqApiKey ? "badge-green m-1" : "badge-orange m-1"
                  }
                  style={{ fontSize: "0.72rem" }}
                >
                  {user?.hasGroqApiKey
                    ? "✅ GroqAI Ready"
                    : "⚠️ No GroqAI API Key"}
                </span>
              </div>
            </div>
            <div className="ms-auto text-end">
              <div style={{ color: "var(--dark-muted)", fontSize: "0.8rem" }}>
                Translations
              </div>
              <div
                style={{ fontSize: "1.4rem", fontWeight: 700 }}
                className="gradient-text"
              >
                {user?.translationCount || 0}
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--dark-muted)",
                display: "block",
                marginBottom: 6,
              }}
            >
              Display Name
            </label>
            <input
              type="text"
              className="form-control-dark"
              value={profileForm.name}
              onChange={(e) =>
                setProfileForm((f) => ({ ...f, name: e.target.value }))
              }
              placeholder="Your full name"
            />
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="btn-orange btn btn-sm"
          >
            {savingProfile ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" />
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </button>
        </Section>

        {/* OpenAI API Key */}
        <Section title="OpenAI API Key" icon="🔑">
          <div
            style={{
              background: "rgba(247,201,72,0.08)",
              border: "1px solid rgba(247,201,72,0.25)",
              borderRadius: "var(--radius-md)",
              padding: "12px 16px",
              marginBottom: "1.25rem",
              fontSize: "0.875rem",
            }}
          >
            <i
              className="bi bi-info-circle me-2"
              style={{ color: "var(--accent-gold)" }}
            />
            <strong style={{ color: "var(--accent-gold)" }}>
              OpenAI API Key
            </strong>
            <span style={{ color: "var(--dark-muted)" }}>
              {" "}
              is required for AI-powered translation and voice recognition. Your
              key is encrypted and stored securely.{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--orange-light)" }}
              >
                Get one free →
              </a>
            </span>
          </div>

          {user?.hasOpenApiKey ? (
            <div
              style={{
                background: "rgba(45,125,70,0.08)",
                border: "1px solid rgba(45,125,70,0.3)",
                borderRadius: "var(--radius-md)",
                padding: "14px 16px",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    color: "var(--green-light)",
                    marginBottom: 2,
                  }}
                >
                  <i className="bi bi-shield-lock-fill me-2" />
                  OpenAI API Key Active
                </div>
                <div style={{ color: "var(--dark-muted)", fontSize: "0.8rem" }}>
                  sk-••••••••••••••••••••••••••••••••••••
                </div>
              </div>
              <button
                onClick={handleRemoveOpenAIApiKey}
                disabled={removingOpenAIKey}
                style={{
                  background: "rgba(229,57,53,0.15)",
                  border: "1px solid rgba(229,57,53,0.3)",
                  color: "#EF9A9A",
                  borderRadius: "var(--radius-md)",
                  padding: "6px 14px",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                {removingOpenAIKey ? "Removing..." : "🗑️ Remove"}
              </button>
            </div>
          ) : null}

          <div className="mb-3">
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--dark-muted)",
                display: "block",
                marginBottom: 6,
              }}
            >
              {user?.hasOpenApiKey
                ? "Update OpenAI API Key"
                : "Add OpenAI API Key"}
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showOpenAIKey ? "text" : "password"}
                className="form-control-dark"
                value={openAIApiKey}
                onChange={(e) => setOpenAIApiKey(e.target.value)}
                placeholder="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                style={{
                  paddingRight: 44,
                  fontFamily: "monospace",
                  fontSize: "0.9rem",
                }}
              />
              <button
                type="button"
                onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--dark-muted)",
                  cursor: "pointer",
                }}
              >
                <i className={`bi bi-eye${showOpenAIKey ? "-slash" : ""}`} />
              </button>
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--dark-muted)",
                marginTop: 4,
              }}
            >
              <i className="bi bi-lock-fill me-1 text-green" />
              Encrypted with AES-256 before storage
            </div>
          </div>
          <button
            onClick={handleSaveOpenAIApiKey}
            disabled={savingOpenAIKey || !openAIApiKey.trim()}
            className="btn-orange btn btn-sm"
          >
            {savingOpenAIKey ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" />
                Verifying & Saving...
              </>
            ) : (
              "💾 Save OpenAI API Key"
            )}
          </button>
        </Section>

        {/* Groq API Key */}
        <Section title="GroqAI API Key" icon="🔑">
          <div
            style={{
              background: "rgba(247,201,72,0.08)",
              border: "1px solid rgba(247,201,72,0.25)",
              borderRadius: "var(--radius-md)",
              padding: "12px 16px",
              marginBottom: "1.25rem",
              fontSize: "0.875rem",
            }}
          >
            <i
              className="bi bi-info-circle me-2"
              style={{ color: "var(--accent-gold)" }}
            />
            <strong style={{ color: "var(--accent-gold)" }}>
              GroqAI API Key
            </strong>
            <span style={{ color: "var(--dark-muted)" }}>
              {" "}
              is required for AI-powered translation and voice recognition. Your
              key is encrypted and stored securely.{" "}
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--orange-light)" }}
              >
                Get one free →
              </a>
            </span>
          </div>

          {user?.hasGroqApiKey ? (
            <div
              style={{
                background: "rgba(45,125,70,0.08)",
                border: "1px solid rgba(45,125,70,0.3)",
                borderRadius: "var(--radius-md)",
                padding: "14px 16px",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    color: "var(--green-light)",
                    marginBottom: 2,
                  }}
                >
                  <i className="bi bi-shield-lock-fill me-2" />
                  GroqAI API Key Active
                </div>
                <div style={{ color: "var(--dark-muted)", fontSize: "0.8rem" }}>
                  sk-••••••••••••••••••••••••••••••••••••
                </div>
              </div>
              <button
                onClick={handleRemoveGroqAIApiKey}
                disabled={removingGroqAIKey}
                style={{
                  background: "rgba(229,57,53,0.15)",
                  border: "1px solid rgba(229,57,53,0.3)",
                  color: "#EF9A9A",
                  borderRadius: "var(--radius-md)",
                  padding: "6px 14px",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                {removingGroqAIKey ? "Removing..." : "🗑️ Remove"}
              </button>
            </div>
          ) : null}

          <div className="mb-3">
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--dark-muted)",
                display: "block",
                marginBottom: 6,
              }}
            >
              {user?.hasGroqApiKey
                ? "Update GroqAI API Key"
                : "Add GroqAI API Key"}
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showGroqAIKey ? "text" : "password"}
                className="form-control-dark"
                value={groqAIApiKey}
                onChange={(e) => setGroqAIApiKey(e.target.value)}
                placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                style={{
                  paddingRight: 44,
                  fontFamily: "monospace",
                  fontSize: "0.9rem",
                }}
              />
              <button
                type="button"
                onClick={() => setShowGroqAIKey(!showGroqAIKey)}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--dark-muted)",
                  cursor: "pointer",
                }}
              >
                <i className={`bi bi-eye${showGroqAIKey ? "-slash" : ""}`} />
              </button>
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--dark-muted)",
                marginTop: 4,
              }}
            >
              <i className="bi bi-lock-fill me-1 text-green" />
              Encrypted with AES-256 before storage
            </div>
          </div>
          <button
            onClick={handleSaveGroqAIApiKey}
            disabled={savingGroqAIKey || !groqAIApiKey.trim()}
            className="btn-orange btn btn-sm"
          >
            {savingGroqAIKey ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" />
                Verifying & Saving...
              </>
            ) : (
              "💾 Save GroqAI API Key"
            )}
          </button>
        </Section>

        {/* Change Password */}
        <Section title="Change Password" icon="🔐">
          <div className="mb-3">
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--dark-muted)",
                display: "block",
                marginBottom: 6,
              }}
            >
              Current Password
            </label>
            <input
              type="password"
              className="form-control-dark"
              value={pwdForm.currentPassword}
              onChange={(e) =>
                setPwdForm((f) => ({ ...f, currentPassword: e.target.value }))
              }
              placeholder="Current password"
            />
          </div>
          <div className="mb-3">
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--dark-muted)",
                display: "block",
                marginBottom: 6,
              }}
            >
              New Password
            </label>
            <input
              type="password"
              className="form-control-dark"
              value={pwdForm.newPassword}
              onChange={(e) =>
                setPwdForm((f) => ({ ...f, newPassword: e.target.value }))
              }
              placeholder="Min 8 chars, uppercase, number"
            />
          </div>
          <div className="mb-3">
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--dark-muted)",
                display: "block",
                marginBottom: 6,
              }}
            >
              Confirm New Password
            </label>
            <input
              type="password"
              className="form-control-dark"
              value={pwdForm.confirmPassword}
              onChange={(e) =>
                setPwdForm((f) => ({ ...f, confirmPassword: e.target.value }))
              }
              placeholder="Repeat new password"
            />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={savingPwd}
            className="btn-outline-orange btn btn-sm"
          >
            {savingPwd ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" />
                Changing...
              </>
            ) : (
              "🔑 Change Password"
            )}
          </button>
        </Section>

        {/* Danger Zone */}
        <div
          style={{
            border: "1px solid rgba(229,57,53,0.3)",
            borderRadius: "var(--radius-lg)",
            padding: "1.25rem",
          }}
        >
          <h6
            style={{
              color: "#EF9A9A",
              marginBottom: "0.75rem",
              fontWeight: 700,
            }}
          >
            ⚠️ Danger Zone
          </h6>
          <p
            style={{
              color: "var(--dark-muted)",
              fontSize: "0.875rem",
              marginBottom: "0.75rem",
            }}
          >
            Deactivating your account will disable access. This action cannot be
            easily undone.
          </p>
          <button
            onClick={() =>
              toast.error("Please contact support to delete your account.")
            }
            style={{
              background: "rgba(229,57,53,0.1)",
              border: "1px solid rgba(229,57,53,0.3)",
              color: "#EF9A9A",
              borderRadius: "var(--radius-md)",
              padding: "8px 20px",
              fontSize: "0.875rem",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
            }}
          >
            🗑️ Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

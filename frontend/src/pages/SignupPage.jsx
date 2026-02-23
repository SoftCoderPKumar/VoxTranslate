import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const passwordStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

const StrengthBar = ({ password }) => {
  const score = passwordStrength(password);
  const levels = [
    { label: "Very Weak", color: "#E53935" },
    { label: "Weak", color: "#FF6B1A" },
    { label: "Fair", color: "#F7C948" },
    { label: "Strong", color: "#66BB6A" },
    { label: "Very Strong", color: "#2D7D46" },
  ];
  if (!password) return null;
  const level = levels[Math.min(score - 1, 4)] || levels[0];
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i <= score ? level.color : "var(--dark-border)",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: "0.75rem", color: level.color }}>
        {level.label}
      </span>
    </div>
  );
};

const SignupPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    else if (form.name.trim().length < 2)
      e.name = "Name must be at least 2 characters";
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email format";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8)
      e.password = "Must be at least 8 characters";
    else if (
      !/[A-Z]/.test(form.password) ||
      !/[a-z]/.test(form.password) ||
      !/\d/.test(form.password)
    )
      e.password = "Must contain uppercase, lowercase, and number";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    if (!agreed) e.terms = "You must agree to the Terms of Service";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name.trim(), form.email, form.password);
      toast.success("Account created! Welcome to VoxTranslate! 🎉");
      navigate("/translate");
    } catch (err) {
      const msg =
        err.response?.data?.error || "Registration failed. Please try again.";
      toast.error(msg);
      if (msg.toLowerCase().includes("email")) setErrors({ email: msg });
      else setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  const field = (name) => ({
    value: form[name],
    onChange: (e) => setForm((f) => ({ ...f, [name]: e.target.value })),
    disabled: loading,
  });

  return (
    <div
      className="auth-bg"
      style={{
        alignItems: "flex-start",
        paddingTop: "5rem",
        paddingBottom: "3rem",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5">
            <div className="auth-card">
              {/* Header */}
              <div className="text-center mb-4">
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 16,
                    background:
                      "linear-gradient(135deg, var(--green-primary), var(--orange-primary))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.6rem",
                    margin: "0 auto 1rem",
                    boxShadow: "var(--shadow-green)",
                  }}
                >
                  🚀
                </div>
                <h2
                  style={{
                    fontWeight: 700,
                    fontSize: "1.7rem",
                    marginBottom: 4,
                  }}
                >
                  Create Account
                </h2>
                <p style={{ color: "var(--dark-muted)", fontSize: "0.93rem" }}>
                  Start translating in seconds
                </p>
              </div>

              {errors.form && (
                <div
                  style={{
                    background: "rgba(229,57,53,0.1)",
                    border: "1px solid rgba(229,57,53,0.3)",
                    borderRadius: "var(--radius-md)",
                    padding: "10px 14px",
                    marginBottom: 16,
                    color: "#EF9A9A",
                    fontSize: "0.88rem",
                  }}
                >
                  <i className="bi bi-exclamation-triangle me-2" />
                  {errors.form}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Name */}
                <div className="mb-3">
                  <label
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: "var(--dark-text)",
                      marginBottom: 6,
                      display: "block",
                    }}
                  >
                    Full Name
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--dark-muted)",
                      }}
                    >
                      <i className="bi bi-person" />
                    </span>
                    <input
                      type="text"
                      className="form-control-dark"
                      style={{ paddingLeft: 40 }}
                      placeholder="John Doe"
                      {...field("name")}
                    />
                  </div>
                  {errors.name && (
                    <div
                      style={{
                        color: "var(--orange-primary)",
                        fontSize: "0.8rem",
                        marginTop: 4,
                      }}
                    >
                      {errors.name}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: "var(--dark-text)",
                      marginBottom: 6,
                      display: "block",
                    }}
                  >
                    Email Address
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--dark-muted)",
                      }}
                    >
                      <i className="bi bi-envelope" />
                    </span>
                    <input
                      type="email"
                      className="form-control-dark"
                      style={{ paddingLeft: 40 }}
                      placeholder="you@example.com"
                      {...field("email")}
                    />
                  </div>
                  {errors.email && (
                    <div
                      style={{
                        color: "var(--orange-primary)",
                        fontSize: "0.8rem",
                        marginTop: 4,
                      }}
                    >
                      {errors.email}
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="mb-3">
                  <label
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: "var(--dark-text)",
                      marginBottom: 6,
                      display: "block",
                    }}
                  >
                    Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--dark-muted)",
                      }}
                    >
                      <i className="bi bi-lock" />
                    </span>
                    <input
                      type={showPass ? "text" : "password"}
                      className="form-control-dark"
                      style={{ paddingLeft: 40, paddingRight: 44 }}
                      placeholder="Min 8 chars, uppercase, number"
                      {...field("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{
                        position: "absolute",
                        right: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "var(--dark-muted)",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      <i className={`bi bi-eye${showPass ? "-slash" : ""}`} />
                    </button>
                  </div>
                  <StrengthBar password={form.password} />
                  {errors.password && (
                    <div
                      style={{
                        color: "var(--orange-primary)",
                        fontSize: "0.8rem",
                        marginTop: 4,
                      }}
                    >
                      {errors.password}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="mb-3">
                  <label
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: "var(--dark-text)",
                      marginBottom: 6,
                      display: "block",
                    }}
                  >
                    Confirm Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--dark-muted)",
                      }}
                    >
                      <i className="bi bi-shield-lock" />
                    </span>
                    <input
                      type="password"
                      className="form-control-dark"
                      style={{ paddingLeft: 40 }}
                      placeholder="Repeat password"
                      {...field("confirm")}
                    />
                  </div>
                  {errors.confirm && (
                    <div
                      style={{
                        color: "var(--orange-primary)",
                        fontSize: "0.8rem",
                        marginTop: 4,
                      }}
                    >
                      {errors.confirm}
                    </div>
                  )}
                </div>

                {/* Terms */}
                <div className="mb-4">
                  <label
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      style={{
                        marginTop: 3,
                        accentColor: "var(--orange-primary)",
                        width: 16,
                        height: 16,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--dark-muted)",
                      }}
                    >
                      I agree to the{" "}
                      <Link
                        to="/terms"
                        style={{
                          color: "var(--orange-primary)",
                          textDecoration: "none",
                        }}
                        target="_blank"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/terms"
                        style={{
                          color: "var(--orange-primary)",
                          textDecoration: "none",
                        }}
                        target="_blank"
                      >
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.terms && (
                    <div
                      style={{
                        color: "var(--orange-primary)",
                        fontSize: "0.8rem",
                        marginTop: 4,
                      }}
                    >
                      {errors.terms}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-green btn w-100"
                  disabled={loading}
                  style={{ padding: "13px", fontSize: "1rem" }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus me-2" />
                      Create Account
                    </>
                  )}
                </button>
              </form>

              <hr className="divider-gradient" />
              <p
                className="text-center mb-0"
                style={{ color: "var(--dark-muted)", fontSize: "0.9rem" }}
              >
                Already have an account?{" "}
                <Link
                  to="/login"
                  style={{
                    color: "var(--orange-primary)",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Sign In →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

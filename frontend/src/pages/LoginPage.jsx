import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back! 🎉");
      navigate("/translate");
    } catch (err) {
      const msg =
        err.response?.data?.error || "Login failed. Please try again.";
      toast.error(msg);
      if (msg.includes("password")) setErrors({ password: msg });
      else setErrors({ email: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
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
                      "linear-gradient(135deg, var(--orange-primary), var(--green-primary))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.6rem",
                    margin: "0 auto 1rem",
                    boxShadow: "var(--shadow-orange)",
                  }}
                >
                  🎙️
                </div>
                <h2
                  style={{
                    fontWeight: 700,
                    fontSize: "1.7rem",
                    marginBottom: 4,
                  }}
                >
                  Welcome Back
                </h2>
                <p style={{ color: "var(--dark-muted)", fontSize: "0.93rem" }}>
                  Sign in to continue translating
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
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
                        fontSize: "1rem",
                      }}
                    >
                      <i className="bi bi-envelope" />
                    </span>
                    <input
                      type="email"
                      className="form-control-dark"
                      style={{ paddingLeft: 40 }}
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      disabled={loading}
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
                      <i className="bi bi-exclamation-circle me-1" />
                      {errors.email}
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-1">
                    <label
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        color: "var(--dark-text)",
                      }}
                    >
                      Password
                    </label>
                  </div>
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
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, password: e.target.value }))
                      }
                      disabled={loading}
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
                  {errors.password && (
                    <div
                      style={{
                        color: "var(--orange-primary)",
                        fontSize: "0.8rem",
                        marginTop: 4,
                      }}
                    >
                      <i className="bi bi-exclamation-circle me-1" />
                      {errors.password}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="btn-orange btn w-100"
                  disabled={loading}
                  style={{ padding: "13px", fontSize: "1rem" }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              <hr className="divider-gradient" />

              <p
                className="text-center mb-0"
                style={{ color: "var(--dark-muted)", fontSize: "0.9rem" }}
              >
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  style={{
                    color: "var(--orange-primary)",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Create one →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

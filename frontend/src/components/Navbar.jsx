import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav
      className="navbar navbar-expand-lg fixed-top navbar-dark-custom"
      style={{
        boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.3)" : "none",
        transition: "box-shadow 0.3s ease",
      }}
    >
      <div className="container">
        {/* Logo */}
        <Link
          to="/"
          className="navbar-brand d-flex align-items-center gap-2 text-decoration-none"
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #FF6B1A, #2D7D46)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
            }}
          >
            🎙️
          </div>
          <span className="logo-text">VoxTranslate</span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ color: "var(--dark-text)" }}
        >
          <i
            className={`bi bi-${menuOpen ? "x-lg" : "list"}`}
            style={{ fontSize: "1.4rem" }}
          />
        </button>

        {/* Nav Links */}
        <div className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}>
          <ul className="navbar-nav me-auto gap-1">
            <li className="nav-item">
              <Link
                to="/"
                className="nav-link px-3"
                style={{
                  color: isActive("/")
                    ? "var(--orange-primary)"
                    : "var(--dark-muted)",
                  fontWeight: isActive("/") ? 600 : 400,
                }}
              >
                Home
              </Link>
            </li>
            {user && (
              <>
                <li className="nav-item">
                  <Link
                    to="/translate"
                    className="nav-link px-3"
                    style={{
                      color: isActive("/translate")
                        ? "var(--orange-primary)"
                        : "var(--dark-muted)",
                      fontWeight: isActive("/translate") ? 600 : 400,
                    }}
                  >
                    <i className="bi bi-record-circle me-1" />
                    Translator
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/speech-translate"
                    className="nav-link px-3"
                    style={{
                      color: isActive("/speech-translate")
                        ? "var(--orange-primary)"
                        : "var(--dark-muted)",
                      fontWeight: isActive("/speech-translate") ? 600 : 400,
                    }}
                  >
                    <i className="bi bi-mic-fill me-1" />
                    Speech
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/history"
                    className="nav-link px-3"
                    style={{
                      color: isActive("/history")
                        ? "var(--orange-primary)"
                        : "var(--dark-muted)",
                      fontWeight: isActive("/history") ? 600 : 400,
                    }}
                  >
                    <i className="bi bi-clock-history me-1" />
                    History
                  </Link>
                </li>
              </>
            )}
            <li className="nav-item">
              <Link
                to="/about"
                className="nav-link px-3"
                style={{
                  color: isActive("/about")
                    ? "var(--orange-primary)"
                    : "var(--dark-muted)",
                  fontWeight: isActive("/about") ? 600 : 400,
                }}
              >
                About
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/terms"
                className="nav-link px-3"
                style={{
                  color: isActive("/terms")
                    ? "var(--orange-primary)"
                    : "var(--dark-muted)",
                  fontWeight: isActive("/terms") ? 600 : 400,
                }}
              >
                Terms
              </Link>
            </li>
          </ul>

          {/* Right Side */}
          <div className="d-flex align-items-center gap-2">
            {user ? (
              <>
                {/* Settings */}
                <Link
                  to="/settings"
                  className="btn btn-sm"
                  style={{
                    background: "rgba(255,107,26,0.1)",
                    color: "var(--orange-primary)",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid rgba(255,107,26,0.2)",
                    padding: "6px 14px",
                    transition: "var(--transition)",
                  }}
                  title="Settings"
                >
                  <i className="bi bi-gear me-1" />
                  Settings
                </Link>

                {/* User Avatar + Name */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 14px",
                    background: "rgba(45,125,70,0.1)",
                    border: "1px solid rgba(45,125,70,0.2)",
                    borderRadius: "var(--radius-full)",
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, var(--green-primary), var(--green-light))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span
                    style={{
                      color: "var(--green-light)",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                    }}
                  >
                    {user.name?.split(" ")[0]}
                  </span>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="btn btn-sm"
                  style={{
                    background: "transparent",
                    color: "var(--dark-muted)",
                    border: "1px solid var(--dark-border)",
                    borderRadius: "var(--radius-full)",
                    padding: "6px 14px",
                    transition: "var(--transition)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = "#E53935";
                    e.target.style.borderColor = "#E53935";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "var(--dark-muted)";
                    e.target.style.borderColor = "var(--dark-border)";
                  }}
                >
                  <i className="bi bi-box-arrow-right me-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline-orange btn btn-sm">
                  Login
                </Link>
                <Link to="/signup" className="btn-orange btn btn-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

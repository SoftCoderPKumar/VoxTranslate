import React, { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

const HistoryPage = () => {
  const [translations, setTranslations] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("");
  const [expanded, setExpanded] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (langFilter) params.append("targetLanguage", langFilter);
      const res = await api.get(`/api/translate/history?${params}`);
      setTranslations(res.data.translations);
      setTotalPages(res.data.pagination.pages);
    } catch {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [page, langFilter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  //fetch Language
  const fetchLanguage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/translate/languages`);
      setLanguages(res.data.languages);
    } catch {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLanguage();
  }, [fetchLanguage]);

  const handleDelete = async (id) => {
    // if (!window.confirm("Delete this translation?")) return;
    try {
      await api.delete(`/api/translate/history/${id}`);
      setTranslations((prev) => prev.filter((t) => t._id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filteredTranslations = translations.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.originalText?.toLowerCase().includes(q) ||
      t.translatedText?.toLowerCase().includes(q)
    );
  });

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => toast.success("Copied!"));
  };

  return (
    <div className="page-wrapper" style={{ background: "var(--dark-bg)" }}>
      <div className="container py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h1
              style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 4 }}
            >
              <span className="gradient-text">Translation History</span>
            </h1>
            <p
              style={{
                color: "var(--dark-muted)",
                fontSize: "0.9rem",
                margin: 0,
              }}
            >
              All your past translations
            </p>
          </div>
          <button
            onClick={fetchHistory}
            className="btn btn-sm"
            style={{
              background: "rgba(255,107,26,0.1)",
              border: "1px solid rgba(255,107,26,0.2)",
              color: "var(--orange-primary)",
              borderRadius: "var(--radius-full)",
              padding: "7px 16px",
              cursor: "pointer",
            }}
          >
            <i className="bi bi-arrow-clockwise me-1" />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="card-dark p-3 mb-4 d-flex gap-3 flex-wrap align-items-center">
          <div style={{ flex: 2, minWidth: 200 }}>
            <div style={{ position: "relative" }}>
              <i
                className="bi bi-search"
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--dark-muted)",
                }}
              />
              <input
                type="text"
                className="form-control-dark"
                style={{ paddingLeft: 36 }}
                placeholder="Search translations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <select
              className="form-select-dark"
              value={langFilter}
              onChange={(e) => {
                setLangFilter(e.target.value);
                setPage(1);
              }}
            >
              <option key="all-languages" value="">
                All Languages
              </option>
              {languages.map(
                (l, i) =>
                  l.code !== "auto" && (
                    <option key={l.code + i} value={l.code}>
                      {l.name}
                    </option>
                  ),
              )}
            </select>
          </div>
          {(search || langFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setLangFilter("");
                setPage(1);
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--dark-muted)",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              <i className="bi bi-x-circle me-1" />
              Clear
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-orange mx-auto" />
            <p style={{ color: "var(--dark-muted)", marginTop: 16 }}>
              Loading history...
            </p>
          </div>
        ) : filteredTranslations.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>📋</div>
            <h4 style={{ fontWeight: 600, marginBottom: 8 }}>
              No translations yet
            </h4>
            <p style={{ color: "var(--dark-muted)" }}>
              Start translating to see your history here
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredTranslations.map((t) => (
              <div
                key={t._id}
                className="history-card"
                onClick={() => setExpanded(expanded === t._id ? null : t._id)}
              >
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Source text preview */}
                    <div
                      style={{
                        color: "var(--dark-text)",
                        fontSize: "0.95rem",
                        whiteSpace: expanded === t._id ? "pre-wrap" : "nowrap",
                        overflow: expanded === t._id ? "visible" : "hidden",
                        textOverflow: "ellipsis",
                        marginBottom: 6,
                      }}
                    >
                      {t.originalText}
                    </div>

                    {/* Translation preview */}
                    <div
                      style={{
                        color: "var(--green-light)",
                        fontSize: "0.9rem",
                        whiteSpace: expanded === t._id ? "pre-wrap" : "nowrap",
                        overflow: expanded === t._id ? "visible" : "hidden",
                        textOverflow: "ellipsis",
                        marginBottom: 8,
                      }}
                    >
                      → {t.translatedText}
                    </div>

                    {/* Meta */}
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                      <span
                        className="badge-orange"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {languages.find(
                          (lang) => lang.code === t?.detectedLanguage,
                        )?.name ||
                          languages.find(
                            (lang) => lang.code === t.sourceLanguage,
                          )?.name}
                      </span>
                      <i
                        className="bi bi-arrow-right"
                        style={{
                          color: "var(--dark-muted)",
                          fontSize: "0.75rem",
                        }}
                      />
                      <span
                        className="badge-green"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {
                          languages.find(
                            (lang) => lang.code === t.targetLanguage,
                          )?.name
                        }
                      </span>
                      {t.inputType && (
                        <span
                          style={{
                            fontSize: "0.72rem",
                            background:
                              t.inputType == "audio"
                                ? "#2e066eff"
                                : "#1a07eaff",
                            border: "1px solid var(--dark-border)",
                            borderRadius: 4,
                            padding: "2px 6px",
                          }}
                        >
                          <i
                            className={
                              t.inputType == "audio"
                                ? "bi bi-mic"
                                : "bi bi-fonts"
                            }
                          />
                          {t.inputType}
                        </span>
                      )}
                      {t.provider && (
                        <span
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--dark-muted)",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid var(--dark-border)",
                            borderRadius: 4,
                            padding: "2px 6px",
                          }}
                        >
                          <i className="bi bi-cpu me-1" />
                          {t.provider}
                        </span>
                      )}
                      <span
                        style={{
                          color: "var(--dark-muted)",
                          fontSize: "0.78rem",
                          marginLeft: "auto",
                        }}
                      >
                        <i className="bi bi-clock me-1" />
                        {formatDate(t.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="d-flex flex-column gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => copyToClipboard(t.translatedText)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--dark-muted)",
                        cursor: "pointer",
                        padding: "4px 8px",
                        fontSize: "0.9rem",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.color = "var(--green-light)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.color = "var(--dark-muted)")
                      }
                      title="Copy translation"
                    >
                      <i className="bi bi-clipboard" />
                    </button>
                    <button
                      onClick={() => handleDelete(t._id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--dark-muted)",
                        cursor: "pointer",
                        padding: "4px 8px",
                        fontSize: "0.9rem",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.target.style.color = "#E53935")}
                      onMouseLeave={(e) =>
                        (e.target.style.color = "var(--dark-muted)")
                      }
                      title="Delete"
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center gap-2 mt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-sm"
              style={{
                background: "var(--dark-surface)",
                border: "1px solid var(--dark-border)",
                color: "var(--dark-text)",
                borderRadius: "var(--radius-md)",
                padding: "6px 16px",
                cursor: "pointer",
              }}
            >
              ← Prev
            </button>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    background:
                      page === p
                        ? "linear-gradient(135deg, var(--orange-primary), var(--orange-light))"
                        : "var(--dark-surface)",
                    border: `1px solid ${page === p ? "transparent" : "var(--dark-border)"}`,
                    color: "white",
                    borderRadius: "var(--radius-md)",
                    padding: "6px 14px",
                    cursor: "pointer",
                    fontWeight: page === p ? 700 : 400,
                  }}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                background: "var(--dark-surface)",
                border: "1px solid var(--dark-border)",
                color: "var(--dark-text)",
                borderRadius: "var(--radius-md)",
                padding: "6px 16px",
                cursor: "pointer",
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;

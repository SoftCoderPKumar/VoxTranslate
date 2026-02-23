import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

const TranslatorPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("audio"); // 'audio' | 'text'
  const initialProvider = user.hasGroqApiKey
    ? "groq"
    : user.hasOpenApiKey
      ? "openai"
      : null;
  const [provider, setProvider] = useState(initialProvider); // null | 'groq' | 'openai'
  const [Languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState(
    user?.preferredTargetLanguage || "en",
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [detectedLang, setDetectedLang] = useState(null);
  const [audioWaveform, setAudioWaveform] = useState(false);
  const [browserTranscript, setBrowserTranscript] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);

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

  // Browser Speech Recognition for real-time transcription
  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang =
      sourceLang === "auto"
        ? "en-US"
        : `${sourceLang}-${sourceLang.toUpperCase()}`;

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += transcript;
        else interim += transcript;
      }
      setBrowserTranscript(final || interim);

      if (final) setSourceText((prev) => prev + final + " ");
    };

    recognition.onerror = (event) => {
      if (event.error !== "no-speech") {
        console.error("Speech recognition error:", event.error);
      }
    };

    return recognition;
  }, [sourceLang]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      streamRef.current = stream;
      audioChunksRef.current = [];

      // Start browser speech recognition for real-time display
      const recognition = initSpeechRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
      }

      // MediaRecorder for audio capture
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/ogg",
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setAudioWaveform(true);
      setBrowserTranscript("");
      setTranslatedText("");
      toast.success("Recording started — speak now!", { icon: "🎤" });
    } catch (err) {
      if (err.name === "NotAllowedError") {
        toast.error(
          "Microphone permission denied. Please allow microphone access.",
        );
      } else {
        toast.error("Failed to access microphone: " + err.message);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = handleRecordingStop;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
    setAudioWaveform(false);
  };

  const handleRecordingStop = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    if (audioBlob.size < 1000) {
      toast.error("Recording too short. Please record for at least 1 second.");
      return;
    }
    await translateAudio(audioBlob);
  };

  const translateAudio = async (audioBlob) => {
    setIsTranslating(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("targetLanguage", targetLang);
      formData.append("sourceLanguage", sourceLang);
      formData.append("provider", provider);

      const res = await api.post("/api/translate/audio", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });

      setSourceText(res.data.originalText);
      setTranslatedText(res.data.translatedText);
      setDetectedLang(res.data.detectedLanguageName);
      setBrowserTranscript("");
      toast.success("Translation complete! ✨");
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        "Translation failed. Please check your API key settings.";
      toast.error(msg);
      if (msg.includes("API key")) {
        setTimeout(() => navigate("/settings"), 2000);
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const translateText = async () => {
    if (!sourceText.trim()) {
      toast.error("Please enter text to translate");
      return;
    }
    setIsTranslating(true);
    try {
      const res = await api.post("/api/translate/text", {
        text: sourceText,
        targetLanguage: targetLang,
        sourceLanguage: sourceLang,
        provider,
      });
      setTranslatedText(res.data.translatedText);
      setDetectedLang(res.data.detectedLanguageName);
      toast.success("Translated! ✨");
    } catch (err) {
      const msg = err.response?.data?.error || "Translation failed";
      toast.error(msg);
      if (msg.includes("API key")) {
        setTimeout(() => navigate("/settings"), 2000);
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const swapLanguages = () => {
    if (sourceLang === "auto") return;
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied to clipboard!"));
  };

  const speakText = (text, langCode) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const clearAll = () => {
    setSourceText("");
    setTranslatedText("");
    setDetectedLang(null);
    setBrowserTranscript("");
  };

  useEffect(() => {
    return () => {
      if (streamRef.current)
        streamRef.current.getTracks().forEach((t) => t.stop());
      if (recognitionRef.current) recognitionRef.current.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const targetLangObj = Languages.find((l) => l.code === targetLang);

  return (
    <div className="page-wrapper" style={{ background: "var(--dark-bg)" }}>
      <div className="container py-4">
        {/* Page Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h1
              style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 4 }}
            >
              <span className="gradient-text">Voice-Text Translator</span>
            </h1>
            <p
              style={{
                color: "var(--dark-muted)",
                fontSize: "0.9rem",
                margin: 0,
              }}
            >
              {user?.hasOpenApiKey || user?.hasGroqApiKey
                ? "✅ AI translation enabled"
                : "⚠️ No API key — using browser translation"}
            </p>
          </div>

          {/* provider Toggle  */}
          {(user?.hasOpenApiKey || user?.hasGroqApiKey) && (
            <div
              style={{
                background: "var(--dark-surface)",
                border: "1px solid var(--dark-border)",
                borderRadius: "var(--radius-full)",
                padding: 4,
                display: "flex",
              }}
            >
              {[
                { id: "groq", label: "GroqAI", icon: "bi bi-lightning-charge" },
                {
                  id: "openai",
                  label: "OpenAI",
                  icon: "bi bi-openai",
                },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setProvider(m.id)}
                  style={{
                    background:
                      provider === m.id
                        ? "linear-gradient(135deg, var(--green-primary), var(--green-light))"
                        : "transparent",
                    color: provider === m.id ? "white" : "var(--dark-muted)",
                    border: "none",
                    borderRadius: "var(--radius-full)",
                    padding: "8px 20px",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    transition: "var(--transition)",
                    fontFamily: "var(--font-body)",
                  }}
                  className={
                    (m.id == "openai" && !user?.hasOpenApiKey) ||
                    (m.id == "groq" && !user?.hasGroqApiKey)
                      ? "d-none"
                      : ""
                  }
                >
                  {
                    <>
                      <i className={m.icon}></i> {m.label}
                    </>
                  }
                </button>
              ))}
            </div>
          )}

          {/* Mode Toggle */}
          <div
            style={{
              background: "var(--dark-surface)",
              border: "1px solid var(--dark-border)",
              borderRadius: "var(--radius-full)",
              padding: 4,
              display: "flex",
            }}
          >
            {[
              { id: "audio", label: "🎤 Voice", icon: "mic-fill" },
              { id: "text", label: "✍️ Text", icon: "type" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                style={{
                  background:
                    mode === m.id
                      ? "linear-gradient(135deg, var(--orange-primary), var(--orange-light))"
                      : "transparent",
                  color: mode === m.id ? "white" : "var(--dark-muted)",
                  border: "none",
                  borderRadius: "var(--radius-full)",
                  padding: "8px 20px",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  transition: "var(--transition)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-orange mx-auto" />
            <p style={{ color: "var(--dark-muted)", marginTop: 16 }}>
              Loading Language...
            </p>
          </div>
        ) : (
          <>
            {/* Language Selectors */}
            <div className="card-dark p-3 mb-3 d-flex align-items-center gap-3 flex-wrap">
              {/* Source Language */}
              <div style={{ flex: 1, minWidth: 180 }}>
                <label
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--dark-muted)",
                    display: "block",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  From
                </label>
                <select
                  className="form-select-dark"
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                >
                  <option key="auto" value="auto">
                    🔍 Auto Detect
                  </option>
                  {Languages.map(
                    (l) =>
                      l.code !== "auto" && (
                        <option key={l.code} value={l.code}>
                          {l.name}
                        </option>
                      ),
                  )}
                </select>
              </div>

              {/* Swap Button */}
              <button
                onClick={swapLanguages}
                disabled={sourceLang === "auto"}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background:
                    sourceLang === "auto"
                      ? "rgba(255,255,255,0.04)"
                      : "linear-gradient(135deg, var(--orange-primary), var(--green-primary))",
                  border: "none",
                  color: "white",
                  cursor: sourceLang === "auto" ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "var(--transition)",
                  flexShrink: 0,
                  marginTop: 18,
                  opacity: sourceLang === "auto" ? 0.4 : 1,
                }}
                title="Swap languages"
              >
                <i className="bi bi-arrow-left-right" />
              </button>

              {/* Target Language */}
              <div style={{ flex: 1, minWidth: 180 }}>
                <label
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--dark-muted)",
                    display: "block",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  To
                </label>
                <select
                  className="form-select-dark"
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                >
                  {Languages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Main Translation Area */}
            <div className="row g-3 mb-3">
              {/* Input Panel */}
              <div className="col-md-6">
                <div
                  className="translator-panel h-100"
                  style={{ border: "1px solid var(--dark-border)" }}
                >
                  <div
                    style={{
                      padding: "10px 16px",
                      borderBottom: "1px solid var(--dark-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "var(--dark-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {sourceLang === "auto"
                        ? "Source Text"
                        : Languages.find((l) => l.code === sourceLang)?.name}
                      {detectedLang && sourceLang === "auto" && (
                        <span style={{ marginLeft: 8 }} className="badge-green">
                          Detected: {detectedLang}
                        </span>
                      )}
                    </span>
                    <div className="d-flex gap-2">
                      {sourceText && (
                        <>
                          <button
                            onClick={() =>
                              speakText(
                                sourceText,
                                sourceLang !== "auto" ? sourceLang : "en",
                              )
                            }
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--dark-muted)",
                              cursor: "pointer",
                              fontSize: "1rem",
                              padding: "2px 6px",
                            }}
                            title="Read aloud"
                          >
                            <i className="bi bi-volume-up" />
                          </button>
                          <button
                            onClick={() => copyToClipboard(sourceText)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--dark-muted)",
                              cursor: "pointer",
                              fontSize: "0.9rem",
                              padding: "2px 6px",
                            }}
                            title="Copy"
                          >
                            <i className="bi bi-clipboard" />
                          </button>
                        </>
                      )}
                      {(sourceText || translatedText) && (
                        <button
                          onClick={clearAll}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--dark-muted)",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            padding: "2px 6px",
                          }}
                          title="Clear"
                        >
                          <i className="bi bi-x-circle" />
                        </button>
                      )}
                    </div>
                  </div>

                  <textarea
                    className="translator-textarea"
                    placeholder={
                      mode === "audio"
                        ? "Transcribed speech will appear here...\nOr type text to translate below"
                        : "Type or paste text to translate..."
                    }
                    value={
                      isRecording
                        ? browserTranscript || "Listening..."
                        : sourceText
                    }
                    onChange={(e) => setSourceText(e.target.value)}
                    readOnly={isRecording}
                    style={{ opacity: isRecording ? 0.7 : 1 }}
                  />

                  {/* Character count */}
                  <div
                    style={{
                      padding: "6px 16px",
                      borderTop: "1px solid var(--dark-border)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--dark-muted)",
                      }}
                    >
                      {sourceText.length} / 5000 Characters
                    </span>
                    {mode === "text" && (
                      <button
                        onClick={translateText}
                        disabled={isTranslating || !sourceText.trim()}
                        className="btn-orange btn btn-sm"
                        style={{ padding: "5px 16px", fontSize: "0.85rem" }}
                      >
                        {isTranslating ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" />
                            Translating...
                          </>
                        ) : (
                          "⚡ Translate"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Output Panel */}
              <div className="col-md-6">
                <div
                  className="translator-panel h-100"
                  style={{
                    border: translatedText
                      ? "1px solid rgba(45,125,70,0.4)"
                      : "1px solid var(--dark-border)",
                    transition: "border-color 0.3s",
                  }}
                >
                  <div
                    style={{
                      padding: "10px 16px",
                      borderBottom: "1px solid var(--dark-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      <span style={{ color: "var(--green-light)" }}>
                        {targetLangObj?.name || "Translation"}
                      </span>
                    </span>
                    {translatedText && (
                      <div className="d-flex gap-2">
                        <button
                          onClick={() => speakText(translatedText, targetLang)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--dark-muted)",
                            cursor: "pointer",
                            fontSize: "1rem",
                            padding: "2px 6px",
                          }}
                          title="Read aloud"
                        >
                          <i className="bi bi-volume-up" />
                        </button>
                        <button
                          onClick={() => copyToClipboard(translatedText)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--green-light)",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            padding: "2px 6px",
                          }}
                          title="Copy"
                        >
                          <i className="bi bi-clipboard-check" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ position: "relative", minHeight: 180 }}>
                    {isTranslating ? (
                      <div
                        style={{
                          padding: "1.5rem",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div className="spinner-orange" />
                        <span
                          style={{
                            color: "var(--dark-muted)",
                            fontSize: "0.95rem",
                          }}
                        >
                          Translating with AI...
                        </span>
                      </div>
                    ) : (
                      <div
                        className="translator-textarea"
                        style={{
                          color: translatedText
                            ? "var(--dark-text)"
                            : "var(--dark-muted)",
                          display: "block",
                          minHeight: 180,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          overflowY: "auto",
                        }}
                      >
                        {translatedText || "Translation will appear here..."}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      padding: "6px 16px",
                      borderTop: "1px solid var(--dark-border)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--dark-muted)",
                      }}
                    >
                      {translatedText
                        ? `${translatedText.length} characters`
                        : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Audio Recording Controls */}
            {mode === "audio" && (
              <div
                style={{
                  background: "var(--dark-surface)",
                  border: `1px solid ${isRecording ? "rgba(229,57,53,0.4)" : "var(--dark-border)"}`,
                  borderRadius: "var(--radius-xl)",
                  padding: "1.5rem 2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "2rem",
                  flexWrap: "wrap",
                  transition: "border-color 0.3s",
                }}
              >
                {/* Waveform */}
                <div
                  style={{
                    minWidth: 100,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {audioWaveform ? (
                    <div className="recording-wave">
                      {[...Array(7)].map((_, i) => (
                        <span
                          key={i}
                          style={{ height: `${16 + Math.random() * 20}px` }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        color: "var(--dark-muted)",
                        fontSize: "0.85rem",
                      }}
                    >
                      {isTranslating
                        ? "⚡ Processing..."
                        : "🎤 Ready to record"}
                    </div>
                  )}
                </div>

                {/* Big Mic Button */}
                <button
                  className={`mic-btn mic-btn-lg ${isRecording ? "recording" : ""}`}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isTranslating}
                  title={isRecording ? "Stop recording" : "Start recording"}
                >
                  <i
                    className={`bi bi-${isRecording ? "stop-fill" : "mic-fill"}`}
                  />
                </button>

                {/* Status */}
                <div style={{ minWidth: 120, textAlign: "center" }}>
                  {isRecording ? (
                    <div>
                      <div
                        style={{
                          color: "#E53935",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          marginBottom: 2,
                        }}
                      >
                        ● Recording...
                      </div>
                      <div
                        style={{
                          color: "var(--dark-muted)",
                          fontSize: "0.8rem",
                        }}
                      >
                        Click stop when done
                      </div>
                    </div>
                  ) : isTranslating ? (
                    <div
                      style={{
                        color: "var(--orange-primary)",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      Translating...
                    </div>
                  ) : (
                    <div>
                      <div
                        style={{
                          color: "var(--dark-muted)",
                          fontSize: "0.85rem",
                          marginBottom: 2,
                        }}
                      >
                        Click mic to start
                      </div>
                      <div
                        style={{
                          color: "var(--dark-muted)",
                          fontSize: "0.75rem",
                        }}
                      >
                        Translating to {targetLangObj?.name}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* API Key Warning */}

        {!user?.hasOpenApiKey && !user?.hasGroqApiKey && (
          <div
            style={{
              background: "rgba(255,107,26,0.08)",
              border: "1px solid rgba(255,107,26,0.25)",
              borderRadius: "var(--radius-md)",
              padding: "12px 16px",
              marginTop: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ fontSize: "0.875rem", color: "var(--dark-text)" }}>
              <i className="bi bi-info-circle text-orange me-2" />
              Add your OpenAI API key to enable AI translation and voice
              recognition.
            </div>
            <button
              onClick={() => navigate("/settings")}
              className="btn btn-sm btn-outline-orange"
              style={{ fontSize: "0.8rem", padding: "5px 14px" }}
            >
              <i className="bi bi-key me-1" />
              Add API Key
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslatorPage;

import React, { useCallback, useEffect, useRef, useState } from "react";
import ChatBubble from "../components/ChatBubble";
import "./ChatbotPage.css";
import ChatInput from "../components/ChatInput";
import api from "../utils/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const ChatbotPage = () => {
  const { user } = useAuth();
  const initialProvider = user.hasGroqApiKey
    ? "groq"
    : user.hasOpenApiKey
      ? "openai"
      : null;
  const [provider, setProvider] = useState(initialProvider); // null | 'groq' | 'openai'
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: `**Hello ${user.name},** \nHow can I assist you with your medical queries today? You can ask about symptoms, medications, or general health advice.`,
    },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const recognitionRef = useRef(null);
  const messageListRef = useRef(null);

  // auto-scroll
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const appendMessage = (role, text) => {
    setMessages((m) => [...m, { id: Date.now() + Math.random(), role, text }]);
  };

  const handleSendText = async (text) => {
    if (!text.trim()) return;
    appendMessage("user", text);
    await respondTo(text);
  };

  const respondTo = async (text) => {
    // placeholder assistant behavior — replace with API call
    setIsThinking(true);
    // small delay to simulate network/processing
    const res = await fetchQueryAnswer(text);
    await appendMessage(
      "assistant",
      `${res || "Sorry, I couldn't fetch a response."}`,
    );
    setIsThinking(false);
  };

  // Audio capture using Web Speech API (browser)
  const initSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const recognition = new SpeechRecognition();
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      if (transcript.trim()) {
        appendMessage("user", transcript);
        respondTo(transcript);
      }
    };
    recognition.onerror = (err) => {
      console.error("Speech recognition error", err);
    };
    return recognition;
  };

  const startRecording = async () => {
    // Try to start SpeechRecognition first
    const recognition = initSpeechRecognition();
    if (!recognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);
  };

  //fetch Language
  const fetchQueryAnswer = async (query) => {
    try {
      if (!provider) {
        toast.error("No AI provider configured.");
        return;
      }
      const response = await api.post("/api/genai/chatbot", {
        query,
        provider,
      });
      return response.data.res;
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        "An error occurred while fetching the response.";
      toast.error(msg);
      if (msg.includes("API key")) {
        setTimeout(() => Navigate("/settings"), 2000);
      }
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ background: "var(--dark-bg)" }}>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h1
              style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 4 }}
            >
              <span className="gradient-text">Medical Assistant</span>
            </h1>
            <p
              style={{
                color: "var(--dark-muted)",
                margin: 0,
                fontSize: "0.9rem",
              }}
            >
              {user?.hasOpenApiKey || user?.hasGroqApiKey
                ? "✅ AI translation enabled"
                : "⚠️ No API key — using browser translation"}
            </p>
            <p
              style={{
                color: "var(--dark-muted)",
                margin: 0,
                fontSize: "0.9rem",
              }}
            >
              Ask by typing or using audio. Responses are powered by your
              configured AI provider.
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
        </div>

        <div className="card-dark p-3 chat-container">
          <div className="messages" ref={messageListRef}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`d-flex ${m.role === "user" ? "justify-content-end" : "justify-content-start"}`}
              >
                <ChatBubble message={m} />
              </div>
            ))}

            {isThinking && (
              <div className="d-flex justify-content-start">
                <div className="card-dark p-2 mb-2 typing-dot" />
              </div>
            )}
          </div>

          <div className="mt-3">
            <ChatInput
              onSendText={handleSendText}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              isRecording={isRecording}
            />
          </div>
        </div>
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
              Add your OpenAI or GroqAI API key to enable AI translation and
              voice recognition.
            </div>
            <button
              onClick={() => Navigate("/settings")}
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

export default ChatbotPage;

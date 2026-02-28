import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import ChatBubble from "../components/ChatBubble";
import ChatInput from "../components/ChatInput";
import "./ChatbotPage.css";

const ChatbotPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", text: "Hi — I'm your assistant. How can I help you today?" },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const recognitionRef = useRef(null);
  const messageListRef = useRef(null);

  useEffect(() => {
    // auto-scroll
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const appendMessage = (role, text) => {
    setMessages((m) => [...m, { id: Date.now() + Math.random(), role, text }]);
  };

  const handleSendText = async (text) => {
    appendMessage("user", text);
    await respondTo(text);
  };

  const respondTo = async (text) => {
    // placeholder assistant behavior — replace with API call
    setIsThinking(true);
    // small delay to simulate network/processing
    setTimeout(() => {
      appendMessage("assistant", `You asked: ${text}`);
      setIsThinking(false);
    }, 900);
  };

  // Audio capture using Web Speech API (browser)
  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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

  return (
    <div className="page-wrapper" style={{ background: "var(--dark-bg)" }}>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>
              <span className="gradient-text">Chat Assistant</span>
            </h1>
            <p style={{ color: "var(--dark-muted)", margin: 0 }}>
              Ask by typing or using audio. Responses are powered by your configured AI provider (UI placeholder).
            </p>
          </div>
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
      </div>
    </div>
  );
};

export default ChatbotPage;

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
  const fetchQueryAnswer = useCallback(async (query) => {
    try {
      const response = await api.post("/api/genai/chatbot", {
        query,
      });
      console.log("API response:", response, response.data);
      if (!response.status || response.status >= 400)
        throw new Error(response.message || "Server side error");
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
  }, []);

  return (
    <div className="page-wrapper" style={{ background: "var(--dark-bg)" }}>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>
              <span className="gradient-text">Medical Assistant</span>
            </h1>
            <p style={{ color: "var(--dark-muted)", margin: 0 }}>
              Ask by typing or using audio. Responses are powered by your
              configured AI provider.
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

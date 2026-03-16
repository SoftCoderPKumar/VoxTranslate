import React, { useState, useRef, useEffect, useCallback, use } from "react";
import "./AiTutorPage.css";
import api from "../utils/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import DOMPurify from "dompurify";
import { marked } from "marked";

const AiTutorPage = () => {
  const { user } = useAuth();
  const initialProvider = user.hasGroqApiKey
    ? "groq"
    : user.hasOpenApiKey
      ? "openai"
      : null;
  const [provider, setProvider] = useState(initialProvider); // null | 'groq' | 'openai'
  const [greetingMsg, setGreetingMsg] = useState("");
  const greetingMsgRef = useRef(
    `Hi <b>${user.name}!</b> It's great to meet you! How can I assist you in improving your English today? Would you like to practice a specific topic or have a casual conversation?`,
  );
  const speakMsgRef = useRef(null);
  const speed = 15;
  const [isPlayingGreetingText, setIsPlayingGreetingText] = useState(false);
  const [topic, setTopic] = useState("");
  const [isInvalidTopic, setIsInvalidTopic] = useState(false);
  const [topicError, setTopicError] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [selectedError, setSelectedError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef(null);
  const conversationRef = useRef(null);

  // Typewriter effect for assistant messages
  useEffect(() => {
    setGreetingMsg(""); // reset on new message
    let i = 0;
    speakMsgRef.current = greetingMsgRef.current;
    let msg = speakMsgRef.current;
    speakGreetingText(msg);
    const interval = setInterval(() => {
      if (i < msg.length) {
        setGreetingMsg(msg.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => {
      clearInterval(interval);
      muteGreetingText();
    };
  }, []);

  const speakGreetingText = (text) => {
    if ("speechSynthesis" in window) {
      const planText = text.replace(/(<([^>]+)>)/gi, "");
      window.speechSynthesis.cancel();
      const synth = window.speechSynthesis;
      const voices = synth.getVoices();
      const utterance = new SpeechSynthesisUtterance(planText);
      utterance.lang = "en-IN";
      for (const voice of voices) {
        if (voice.name === "Google हिन्दी") {
          utterance.voice = voice;
        }
      }
      utterance.onstart = () => setIsPlayingGreetingText(true);
      utterance.onend = () => setIsPlayingGreetingText(false);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      synth.speak(utterance);
    }
  };

  const muteGreetingText = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlayingGreetingText(false);
    }
  };

  // Auto-scroll conversation
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversation]);

  // Speech synthesis
  const speakText = useCallback((text) => {
    if ("speechSynthesis" in window) {
      const planText = text.replace(/(<([^>]+)>)/gi, "");
      const synth = window.speechSynthesis;
      const voices = synth.getVoices();
      const utterance = new SpeechSynthesisUtterance(planText);
      utterance.lang = "en-IN";
      for (const voice of voices) {
        if (voice.name === "Google हिन्दी") {
          utterance.voice = voice;
        }
      }
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      synth.speak(utterance);
    }
  }, []);

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      setIsSpeaking(false);
      setIsPlayingGreetingText(false);
    }
  };

  // Speech recognition
  const startRecording = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onstart = () => setIsRecording(true);
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserAnswer((prev) => prev + transcript);
    };
    recognitionRef.current.onend = () => setIsRecording(false);
    recognitionRef.current.onerror = () => {
      setIsRecording(false);
      toast.error("Speech recognition error");
    };

    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Start conversation with topic
  const startConversation = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    if (!provider) {
      toast.error("Please select an AI provider");
      return;
    }
    muteGreetingText();
    setIsThinking(true);
    try {
      const response = await api.post("/api/talk/general", {
        topic: topic.trim(),
        provider,
      });

      const data = response.data.res;
      if (!data.topic_valid) {
        setIsInvalidTopic(true);
        setTopicError(data.ai_response);
        setTopic("");
        speakGreetingText(data.ai_response);
        speakMsgRef.current = data.ai_response;
        return;
      } else {
        setIsInvalidTopic(false);
        setTopicError(null);
        speakMsgRef.current = greetingMsgRef.current;
      }

      setCurrentQuestion(data.next_question);
      setConversation([
        {
          type: "question",
          text: data.next_question,
          audioPlayed: false,
        },
      ]);
      speakText(data.ai_response);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to start conversation",
      );
    } finally {
      setIsThinking(false);
    }
  };

  // Submit answer
  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.error("Please provide an answer");
      return;
    }

    setIsThinking(true);
    const answer = userAnswer.trim();
    setUserAnswer("");

    // Add user answer to conversation
    setConversation((prev) => [
      ...prev,
      {
        type: "user_answer",
        text: answer,
      },
    ]);

    try {
      const response = await api.post("/api/talk/general", {
        topic,
        question: currentQuestion,
        studentAnswer: answer,
        provider,
        difficultyLevel: "Beginner",
      });

      const data = response.data.res;

      // Add AI response to conversation
      setConversation((prev) => [
        ...prev,
        {
          type: "ai_response",
          text: data.ai_response ?? "",
          original: data.original ?? "",
          corrected: data.corrected ?? "",
          errors: data.errors ?? [],
          evaluation: data.evaluation ?? {},
          suggestion: data.suggestion ?? {},
          nextQuestion: data.next_question ?? "",
        },
      ]);

      setCurrentQuestion(data.next_question);
      speakText(data.ai_response);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to get response");
    } finally {
      setIsThinking(false);
    }
  };

  // Render corrected text with errors
  const renderCorrectedText = (text, errors) => {
    if (!errors || errors.length === 0) return text;

    errors.sort((a, b) => a.position - b.position);

    const parts = [];
    let lastWordIndex = 0;
    const textArr = text.split(" ");

    errors.forEach((error, index) => {
      if (error.position !== null && error.position >= 0) {
        const errTextArr = error.corrected_phrase.split(" ");

        const beforeError = textArr.slice(lastWordIndex, error.position);

        const errorTextArr = textArr.slice(
          error.position,
          error.position + errTextArr.length,
        );

        const errorText = errorTextArr.join(" ");

        if (beforeError) parts.push(beforeError.join(" "));
        parts.push(
          <span
            key={index}
            className="error-highlight"
            onClick={() => setSelectedError(error)}
            title="Click to see error details"
          >
            {errorText}
          </span>,
        );

        lastWordIndex = error.position + errTextArr.length;
      }
    });

    const remaining = textArr.slice(lastWordIndex);

    if (remaining) parts.push(remaining.join(" "));
    return parts;
  };

  return (
    <div className="page-wrapper" style={{ background: "var(--dark-bg)" }}>
      <div className="container py-4">
        <div className="card-dark p-4">
          <h1
            className="text-center"
            style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 4 }}
          >
            <span className="gradient-text">LexiAI Teacher</span>
          </h1>

          {/* Provider Selection */}
          {(!topic || conversation.length === 0) && (
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <div>
                <p
                  style={{
                    color: "var(--dark-muted)",
                    margin: 0,
                    fontSize: "0.9rem",
                  }}
                >
                  {user?.hasOpenApiKey || user?.hasGroqApiKey
                    ? "✅ LaxiAI Teacher ready."
                    : "⚠️ No API key"}
                </p>

                {(user?.hasOpenApiKey || user?.hasGroqApiKey) && (
                  <>
                    <p
                      style={{
                        color: "var(--dark-muted)",
                        margin: 0,
                        fontSize: "0.9rem",
                      }}
                    >
                      <i className="bi bi-record-circle me-1 text-info" />
                      Talk about anything.
                    </p>
                  </>
                )}
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
                    {
                      id: "groq",
                      label: "GroqAI",
                      icon: "bi bi-lightning-charge",
                    },
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
                        color:
                          provider === m.id ? "white" : "var(--dark-muted)",
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
          )}

          {/* Topic Selection */}
          {conversation.length === 0 && (
            <div className="mb-4">
              <div
                className="card mb-4"
                style={{
                  border: "1px solid var(--dark-border)",
                  background: "var(--dark-surface)",
                  color: "var(--dark-muted)",
                }}
              >
                <div className="card-body" style={{ padding: "0px" }}>
                  <div
                    className="card-title p-2 d-flex"
                    style={{ justifyContent: "space-between" }}
                  >
                    <div style={{ fontWeight: "bolder" }}>
                      <i className="bi bi-robot text-blue me-1"></i>
                      LaxiAI Teacher
                    </div>
                    <button
                      onClick={() => {
                        isPlayingGreetingText
                          ? muteGreetingText()
                          : speakGreetingText(speakMsgRef.current);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--dark-muted)",
                        cursor: "pointer",
                        fontSize: "1rem",
                        padding: "2px 6px",
                      }}
                      title={`${isPlayingGreetingText ? "Stop" : "Read aloud"}`}
                    >
                      <i
                        className={`bi ${isPlayingGreetingText ? "bi-volume-mute text-danger" : "bi-volume-up text-info"}`}
                      />
                    </button>
                  </div>

                  {isInvalidTopic ? (
                    <>
                      <div
                        className="card-text p-2 text-danger"
                        style={{ border: "1px solid var(--dark-border)" }}
                      >
                        <i class="bi bi-bug me-1"></i>
                        {topicError}
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="card-text p-2"
                        style={{ border: "1px solid var(--dark-border)" }}
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            marked.parse(
                              '<i class="bi bi-envelope-open-heart me-1 text-info-emphasis"></i>' +
                                greetingMsg,
                              { breaks: true },
                            ),
                          ),
                        }}
                      ></div>
                    </>
                  )}
                </div>
              </div>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Travel, Food, Hobbies, Weather..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyUp={(e) => e.key === "Enter" && startConversation()}
                />
                <button
                  className="btn btn-orange"
                  onClick={startConversation}
                  disabled={!topic.trim() || !provider || isThinking}
                >
                  {isThinking ? (
                    <div className="spinner-border spinner-border-sm" />
                  ) : (
                    "Start Conversation"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Conversation */}
          {conversation.length > 0 && (
            <div className="conversation-container mb-4">
              <div className="conversation" ref={conversationRef}>
                {conversation.map((item, index) => (
                  <div key={index} className={`message ${item.type}`}>
                    {item.type === "question" && (
                      <div className="question-bubble">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <i className="bi bi-question-circle text-orange"></i>
                          <span className="fw-bold">Question:</span>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => speakText(item.text)}
                            disabled={isSpeaking}
                          >
                            <i className="bi bi-volume-up"></i>
                          </button>
                        </div>
                        <p className="mb-0">{item.text}</p>
                      </div>
                    )}

                    {item.type === "user_answer" && (
                      <div className="user-answer-bubble">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <i className="bi bi-person-circle"></i>
                          <span className="fw-bold">Your Answer:</span>
                        </div>
                        <p className="mb-0">{item.text}</p>
                      </div>
                    )}

                    {item.type === "ai_response" && (
                      <div className="ai-response-bubble">
                        {item.corrected && (
                          <div className="mt-3">
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <i className="bi bi-check-circle text-green"></i>
                              <span className="fw-bold">
                                Corrected Version:
                              </span>
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => speakText(item.corrected)}
                                disabled={isSpeaking}
                              >
                                <i className="bi bi-volume-up"></i>
                              </button>
                            </div>
                            <p className="mb-0 corrected-text">
                              {item.original}
                            </p>
                            <p className="mb-0 corrected-text">
                              {renderCorrectedText(item.corrected, item.errors)}
                            </p>
                          </div>
                        )}

                        {/* Feedback Toggle */}
                        {item.suggestion && (
                          <div className="mt-3">
                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => setShowSuggestion(!showSuggestion)}
                            >
                              {showSuggestion ? "Hide" : "Show"} Feedback
                            </button>
                            {showSuggestion && (
                              <div className="suggestion-card mt-2 p-3">
                                <h6>Feedback</h6>
                                <p>
                                  <strong>Overall Quality:</strong>{" "}
                                  {item.suggestion.overall_quality}/10
                                </p>
                                <div>
                                  <strong>Strengths:</strong>
                                  <ul>
                                    {item.suggestion.strengths.map(
                                      (strength, i) => (
                                        <li key={i}>{strength}</li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                                <div>
                                  <strong>Improvements:</strong>
                                  <ul>
                                    {item.suggestion.improvements.map(
                                      (improvement, i) => (
                                        <li key={i}>{improvement}</li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                                <p>
                                  <em>{item.suggestion.encouragement}</em>
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        {/* explanation Toggle */}
                        {item.evaluation && (
                          <div className="mt-3">
                            <button
                              className="btn btn-sm btn-outline-info me-2"
                              onClick={() => setShowEvaluation(!showEvaluation)}
                            >
                              {showEvaluation ? "Hide" : "Show"} Explanation
                            </button>
                            {showEvaluation && (
                              <div className="evaluation-card mt-2 p-3">
                                <h6>Explanation</h6>
                                <div className="row">
                                  <div className="col-md-4">
                                    <strong>Grammar:</strong>{" "}
                                    {item.evaluation.grammar_score}/10
                                  </div>
                                  <div className="col-md-4">
                                    <strong>Fluency:</strong>{" "}
                                    {item.evaluation.fluency_score}/10
                                  </div>
                                  <div className="col-md-4">
                                    <strong>Vocabulary:</strong>{" "}
                                    {item.evaluation.vocabulary_score}/10
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <strong>Level:</strong>{" "}
                                  {item.evaluation.fluency_level} |
                                  <strong> Tone:</strong> {item.evaluation.tone}{" "}
                                  |<strong> Mindset:</strong>{" "}
                                  {item.evaluation.user_mindset}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div
                          className="d-flex align-items-center gap-2 mb-2"
                          style={{ border: "1px solid var(--dark-border)" }}
                        >
                          <i className="bi bi-robot text-blue"></i>
                          <span className="fw-bold">LexiAI Teacher:</span>
                        </div>
                        <p className="mb-0 text-blue">{item.text}</p>
                      </div>
                    )}
                  </div>
                ))}

                {isThinking && (
                  <div className="d-flex justify-content-start">
                    <div className="card-dark p-2 mb-2 typing-dot" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Answer Input */}
          {conversation.length > 0 && (
            <div className="answer-input">
              <label className="form-label">Your Answer</label>
              <div className="input-group">
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Type your answer here..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && !e.shiftKey && submitAnswer()
                  }
                />
                <div className="input-group-append d-flex flex-column">
                  <button
                    className={`btn ${isRecording ? "btn-danger" : "btn-outline-secondary"}`}
                    onClick={isRecording ? stopRecording : startRecording}
                    title={isRecording ? "Stop recording" : "Start voice input"}
                  >
                    <i className={`bi bi-mic${isRecording ? "-fill" : ""}`}></i>
                  </button>
                  <button
                    className="btn btn-orange mt-1"
                    onClick={submitAnswer}
                    disabled={!userAnswer.trim() || isThinking}
                  >
                    {isThinking ? (
                      <div className="spinner-border spinner-border-sm" />
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Details Modal */}
          {selectedError && (
            <div
              className="error-modal-overlay"
              onClick={() => setSelectedError(null)}
              style={{ zIndex: 100 }}
            >
              <div className="error-modal" onClick={(e) => e.stopPropagation()}>
                <h6>Error Details</h6>
                <p>
                  <strong>Type:</strong> {selectedError.type}
                </p>
                <p>
                  <strong>Original:</strong> "{selectedError.original_phrase}"
                </p>
                <p>
                  <strong>Corrected:</strong> "{selectedError.corrected_phrase}"
                </p>
                <p>
                  <strong>Explanation:</strong> {selectedError.explanation}
                </p>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setSelectedError(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Stop Speaking Button */}
          {isSpeaking && (
            <div className="stop-speaking-btn">
              <button className="btn btn-danger" onClick={stopSpeaking}>
                <i className="bi bi-stop-circle me-2"></i>
                Stop Speaking
              </button>
            </div>
          )}
        </div>

        {/* API Key Warning */}
        {!user?.hasOpenApiKey && !user?.hasGroqApiKey && (
          <div className="mt-4" style={{ ...warningStyle }}>
            <div style={{ fontSize: "0.875rem", color: "var(--dark-text)" }}>
              <i className="bi bi-info-circle text-orange me-2" />
              Add your OpenAI or GroqAI API key to enable AI tutoring.
            </div>
            <button
              onClick={() => (window.location.href = "/settings")}
              className="btn btn-sm btn-outline-orange mt-2"
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

const warningStyle = {
  background: "rgba(255,107,26,0.08)",
  border: "1px solid rgba(255,107,26,0.25)",
  borderRadius: "var(--radius-md)",
  padding: "12px 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 8,
};

export default AiTutorPage;

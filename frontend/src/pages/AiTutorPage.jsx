import { useState, useRef, useEffect, useCallback } from "react";
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
  const [playingActiveBtn, setPlayingActiveBtn] = useState(null);
  const [topic, setTopic] = useState("");
  const [isInvalidTopic, setIsInvalidTopic] = useState(false);
  const [topicError, setTopicError] = useState(null);

  const [userAnswer, setUserAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [browserTranscript, setBrowserTranscript] = useState("");

  const [currentQuestion, setCurrentQuestion] = useState("");

  const [conversation, setConversation] = useState([]);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [selectedError, setSelectedError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef(null);
  const conversationRef = useRef(null);
  const questionCount = useRef(1);

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
      // utterance.lang = "en-IN";
      for (const voice of voices) {
        if (voice.name === "Google हिन्दी") {
          utterance.voice = voice;
        }
      }
      utterance.onstart = () => {
        setIsPlayingGreetingText(true);
        stopRecording();
      };
      utterance.onend = () => {
        setIsPlayingGreetingText(false);
        setPlayingActiveBtn(null);
      };
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      synth.speak(utterance);
    }
  };

  const muteGreetingText = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlayingGreetingText(false);
      setPlayingActiveBtn(null);
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
      // utterance.lang = "en-IN";
      for (const voice of voices) {
        if (voice.name === "Google हिन्दी") {
          utterance.voice = voice;
        }
      }
      utterance.rate = 1;
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
      setPlayingActiveBtn(null);
    }
  };

  // Browser Speech Recognition for real-time transcription
  const initSpeechRecognition = useCallback((recordingSection = "") => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported in this browser");
      return null;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += transcript;
        else interim += transcript;
      }

      setBrowserTranscript(final || interim);
      if (recordingSection == "topic") {
        if (final) setTopic((prev) => prev + final + " ");
      } else {
        if (final) setUserAnswer((prev) => prev + final + " ");
      }
    };

    // recognition.current.onend = () => setIsRecording(false);
    recognition.onerror = (event) => {
      if (event.error !== "no-speech") {
        console.error("Speech recognition error:", event.error);
      } else {
        toast.error("Speech recognition error");
      }
      setIsRecording(false);
    };
    return recognition;
  }, []);

  const startRecording = async (recordingSection = "") => {
    try {
      // Start browser speech recognition for real-time display
      const recognition = initSpeechRecognition(recordingSection);
      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
      }
      if (recordingSection === "topic") {
        muteGreetingText();
      }
      setIsRecording(true);
      setBrowserTranscript("");
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

  const clearAll = () => {
    muteGreetingText();
    setBrowserTranscript("");
    setIsPlayingGreetingText(false);
    setUserAnswer("");
    setPlayingActiveBtn(null);
  };
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied to clipboard!"));
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
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
    setIsRecording(false);
    setBrowserTranscript("");
    try {
      const response = await api.post("/api/talk/general", {
        topic: topic.trim(),
        provider,
      });

      const data = response.data.res;
      if (!data.topic_valid || !data.current_topic) {
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

    muteGreetingText();
    setIsRecording(false);

    setIsThinking(true);
    const answer = userAnswer.trim();
    setUserAnswer("");
    setBrowserTranscript("");

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
        difficultyLevel: await getDifficultyLevel(),
      });

      const data = response.data.res;

      if (!data.topic_valid || !data.current_topic) {
        setIsInvalidTopic(true);
        setTopicError(data.ai_response);
        setTopic("");
        speakGreetingText(data.ai_response);
        speakMsgRef.current = data.ai_response;
        return;
      } else {
        setIsInvalidTopic(false);
        setTopicError(null);
        setTopic(data.current_topic);
        speakMsgRef.current = greetingMsgRef.current;
      }
      // Add AI response to conversation
      setConversation((prev) => [
        ...prev,
        {
          type: "ai_response",
          text: data.ai_response,
          original: data.original,
          corrected: data.corrected,
          errors: data.errors,
          evaluation: data.evaluation,
          suggestion: data.suggestion,
          nextQuestion: data.next_question,
        },
      ]);

      setCurrentQuestion(data.next_question);
      speakText(data.ai_response);
      questionCount.current = questionCount.current + 1;
    } catch (error) {
      setUserAnswer(answer);
      // pop user answer to conversation
      setConversation((prev) => {
        prev.pop();
        return prev;
      });
      console.error(error);
      toast.error("Failed to get response, try again!");
    } finally {
      setIsThinking(false);
    }
  };

  const getDifficultyLevel = async () => {
    const num = questionCount.current;

    switch (true) {
      case num >= 1 && num <= 5:
        return "Beginner";

      case num > 5 && num <= 10:
        return "Elementary";

      case num > 10 && num <= 15:
        return "Intermediate";

      case num > 15 && num <= 20:
        return "Upper-Intermediate";

      case num > 20 && num <= 25:
        return "Advanced";

      case num > 25:
        return "Expert";

      default:
        return "Beginner";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitAnswer();
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

        if (beforeError) parts.push(beforeError.join(" "));
        if (lastWordIndex <= error.position) {
          const errorTextArr = textArr.slice(
            error.position,
            error.position + errTextArr.length,
          );

          const errorText = errorTextArr.join(" ");
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
        }

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

          {/* Provider Selection and */}
          {(!topic || isInvalidTopic || conversation.length === 0) && (
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
              {/* show provider Toggle  */}
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
          {(!topic || isInvalidTopic || conversation.length === 0) && (
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
                        setPlayingActiveBtn("greet-btn");
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
                        className={`bi ${isPlayingGreetingText && playingActiveBtn === "greet-btn" ? "bi-volume-mute text-danger" : "bi-volume-up text-info"}`}
                      />
                    </button>
                  </div>
                  {/* greeting or topic error message */}
                  {isInvalidTopic ? (
                    <>
                      <div
                        className="card-text p-2 text-danger"
                        style={{ border: "1px solid var(--dark-border)" }}
                      >
                        <i className="bi bi-bug me-1"></i>
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
                              '<i className="bi bi-envelope-open-heart me-1 text-info-emphasis"></i>' +
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

              {/* Topic input section */}
              <div className="input-group topic-class">
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Travel, Food, Hobbies, Weather..."
                  value={
                    isRecording ? browserTranscript || "Listening..." : topic
                  }
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyUp={(e) => e.key === "Enter" && startConversation()}
                />
                {!isThinking && (
                  <>
                    <button
                      className={`btn mic-btn ${isRecording ? "recording" : ""}`}
                      title={
                        isRecording ? "Stop recording" : "Start voice input"
                      }
                      disabled={!provider || isThinking}
                      onClick={() =>
                        isRecording ? stopRecording() : startRecording("topic")
                      }
                      style={{ height: "inherit" }}
                    >
                      <i
                        className={`bi bi-${isRecording ? "stop-circle" : "mic-fill"}`}
                      />
                    </button>
                  </>
                )}
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
          {topic && !isInvalidTopic && conversation.length > 0 && (
            <div className="conversation-container mb-4">
              <div className="conversation" ref={conversationRef}>
                {conversation.map((item, index) => (
                  <div key={index} className={`message ${item.type}`}>
                    {item.type === "question" && (
                      <div className="question-bubble">
                        <div className="d-flex justify-content-between gap-2 mb-2">
                          <span className="fw-bold">
                            <i className="bi bi-question-circle text-orange"></i>{" "}
                            Question:
                          </span>
                          <button
                            onClick={() => {
                              setPlayingActiveBtn(`question-btn-${index}`);
                              isPlayingGreetingText
                                ? muteGreetingText()
                                : speakGreetingText(item.text);
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
                              className={`bi ${isPlayingGreetingText && playingActiveBtn === "question-btn-" + index ? "bi-volume-mute text-danger" : "bi-volume-up text-info"}`}
                            />
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
                          <div className="mt-1">
                            <div className="d-flex justify-content-between gap-2 mb-2">
                              <span className="fw-bold">
                                <i className="bi bi-check-circle text-green"></i>{" "}
                                Corrected Version:
                              </span>
                              <button
                                onClick={() => {
                                  setPlayingActiveBtn(
                                    `correct-answer-btn-${index}`,
                                  );
                                  isPlayingGreetingText
                                    ? muteGreetingText()
                                    : speakGreetingText(item.corrected);
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
                                  className={`bi ${isPlayingGreetingText && playingActiveBtn === "correct-answer-btn-" + index ? "bi-volume-mute text-danger" : "bi-volume-up text-info"}`}
                                />
                              </button>
                            </div>
                            <p
                              className={`mb-2 ${item.errors.length > 0 ? "incorrect-answer-bubble" : "corrected-text"} `}
                            >
                              {item.original}
                            </p>
                            <hr style={{ margin: "0px" }} />
                            <p className="mt-2 corrected-text">
                              {renderCorrectedText(item.corrected, item.errors)}
                            </p>
                          </div>
                        )}
                        <div
                          className="d-flex justify-content-center align-items-center mb-3 flex-wrap gap-2"
                          style={{
                            borderRadius: "var(--radius-full)",
                            padding: "4px",
                          }}
                        >
                          {item?.suggestion && (
                            <div>
                              <button
                                className={`btn btn-sm btn-outline-warning ${showSuggestion ? "selected-feedback" : ""}`}
                                onClick={() => {
                                  setShowEvaluation(false);
                                  setShowSuggestion(!showSuggestion);
                                }}
                              >
                                {showSuggestion ? "Hide" : "Show"} Feedback
                              </button>
                            </div>
                          )}
                          {item?.evaluation && (
                            <div>
                              <button
                                className={`btn btn-sm btn-outline-info me-2 ${showEvaluation ? "selected-explanation" : ""}`}
                                onClick={() => {
                                  setShowSuggestion(false);
                                  setShowEvaluation(!showEvaluation);
                                }}
                              >
                                {showEvaluation ? "Hide" : "Show"} Explanation
                              </button>
                            </div>
                          )}
                        </div>
                        {/* Feedback Toggle */}
                        {item?.suggestion && showSuggestion && (
                          <div className="mt-3 mb-3">
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
                          </div>
                        )}
                        {/* explanation Toggle */}
                        {item?.evaluation && showEvaluation && (
                          <div className="mt-3 mb-3">
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
                              <div className="mt-2 row">
                                <div className="col-md-4">
                                  <strong>Level:</strong>{" "}
                                  {item.evaluation.fluency_level}
                                </div>
                                <div className="col-md-4">
                                  <strong> Tone:</strong> {item.evaluation.tone}
                                </div>
                                <div className="col-md-4">
                                  <strong> Mindset:</strong>{" "}
                                  {item.evaluation.user_mindset}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="question-bubble">
                          <div
                            className="d-flex justify-content-between align-items-center gap-2 mb-2"
                            style={{
                              borderBottom: "1px solid rgba(255, 107, 26, 0.2)",
                              padding: "6px",
                            }}
                          >
                            <span className="fw-bold">
                              <i className="bi bi-robot text-blue me-1"></i>
                              LexiAI Teacher:
                            </span>
                            <button
                              onClick={() => {
                                setPlayingActiveBtn(`next-answer-btn-${index}`);
                                isPlayingGreetingText
                                  ? muteGreetingText()
                                  : speakGreetingText(item.nextQuestion);
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
                                className={`bi ${isPlayingGreetingText && playingActiveBtn === "next-answer-btn-" + index ? "bi-volume-mute text-danger" : "bi-volume-up text-info"}`}
                              />
                            </button>
                          </div>
                          <p className="mb-0">{item.text}</p>
                        </div>
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
          {topic && !isInvalidTopic && conversation.length > 0 && (
            <div className="card-dark p-3 chat-input-wrapper align-items-center gap-2">
              {/* <div className="badge-green" style={{ minWidth: "fit-content" }}>
                <i className="bi bi-chat-right-text me-1"></i>
                Your Answer
              </div> */}
              <div
                className="input-group"
                style={{
                  flexWrap: "unset",
                  alignItems: "center",
                  border: "inherit",
                  borderRadius: "inherit",
                  background: "inherit",
                  marginLeft: "1px",
                }}
              >
                <textarea
                  className="form-control-dark"
                  style={{
                    borderRadius: "inherit",
                    border: "none",
                    borderRight: "inherit",
                  }}
                  rows="3"
                  placeholder={`Transcribed Answer will appear here...\nOr type your Answer..`}
                  value={
                    isRecording
                      ? browserTranscript || "Listening..."
                      : userAnswer
                  }
                  readOnly={isRecording}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <button
                    onClick={() => {
                      setPlayingActiveBtn(`user-answer-btn`);
                      isPlayingGreetingText
                        ? muteGreetingText()
                        : speakGreetingText(userAnswer);
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
                      className={`bi ${isPlayingGreetingText && playingActiveBtn === "user-answer-btn" ? "bi-volume-mute text-danger" : "bi-volume-up text-info"}`}
                    />
                  </button>
                  <button
                    onClick={() => copyToClipboard(userAnswer)}
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
                    <i className="bi bi-clipboard text-success" />
                  </button>
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
                    <i className="bi bi-x-circle text-danger" />
                  </button>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  className={`mic-btn ${isRecording ? "recording" : ""}`}
                  onClick={isRecording ? stopRecording : startRecording}
                  title={isRecording ? "Stop recording" : "Start voice input"}
                >
                  <i
                    className={`bi bi-${isRecording ? "stop-circle" : "mic-fill"}`}
                  />
                </button>
                <button
                  className="btn btn-orange"
                  style={{ padding: "10px 18px" }}
                  title={!isThinking && "Submit"}
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
                  <strong>Original:</strong>{" "}
                  <span className=" text-danger">
                    "{selectedError.original_phrase}"
                  </span>
                </p>
                <p>
                  <strong>Corrected:</strong>{" "}
                  <span className=" text-green">
                    "{selectedError.corrected_phrase}"
                  </span>
                </p>
                <p>
                  <strong>Explanation:</strong>{" "}
                  <span>{selectedError.explanation}</span>
                </p>
                <button
                  className="btn btn-sm btn-danger float-end"
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

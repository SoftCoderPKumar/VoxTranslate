import React, { useState } from "react";

const ChatInput = ({ onSendText, onStartRecording, onStopRecording, isRecording }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSendText(text.trim());
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="card-dark p-3 chat-input-wrapper d-flex align-items-center gap-2">
      <textarea
        className="form-control-dark"
        placeholder="Ask anything... (press Enter to send)"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        style={{ flex: 1, resize: "none" }}
      />

      <div className="d-flex align-items-center gap-2">
        <button
          className={`mic-btn ${isRecording ? "recording" : ""}`}
          onClick={() => (isRecording ? onStopRecording() : onStartRecording())}
          title={isRecording ? "Stop recording" : "Start recording"}
        >
          <i className={`bi bi-${isRecording ? "stop-circle" : "mic-fill"}`} />
        </button>

        <button
          onClick={handleSend}
          className="btn btn-orange"
          style={{ padding: "10px 18px" }}
          title="Send"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInput;

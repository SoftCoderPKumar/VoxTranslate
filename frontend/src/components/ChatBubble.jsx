import React from "react";

const ChatBubble = ({ message }) => {
  const isUser = message.role === "user";
  return (
    <div
      className={`chat-bubble ${isUser ? "user" : "assistant"} card-dark p-2 mb-2`}
      style={{ maxWidth: "85%" }}
    >
      <div style={{ fontSize: "0.9rem", color: isUser ? "#E6EDF3" : "#D8E9DF" }}>
        {message.text}
      </div>
    </div>
  );
};

export default ChatBubble;

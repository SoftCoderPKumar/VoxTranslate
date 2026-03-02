import React, { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";

const ChatBubble = ({ message, speed = 15 }) => {
  const isUser = message.role === "user";
  const [displayed, setDisplayed] = useState("");

  // Typewriter effect for assistant messages
  useEffect(() => {
    setDisplayed(""); // reset on new message
    let i = 0;
    const interval = setInterval(() => {
      if (i < message.text.length) {
        setDisplayed(message.text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [message.text, speed]);

  return (
    <div
      className={`chat-bubble ${isUser ? "user" : "assistant"} card-dark p-2 mb-2`}
      style={{ maxWidth: "85%" }}
    >
      <div
        style={{ fontSize: "0.9rem", color: isUser ? "#E6EDF3" : "#D8E9DF" }}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(marked.parse(displayed, { breaks: true })),
        }}
      ></div>
    </div>
  );
};

export default ChatBubble;

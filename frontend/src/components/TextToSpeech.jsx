import { useSpeech } from "react-text-to-speech";

export default function TextToSpeech({
  items,
  autoPlay = false,
  highlightText = false,
}) {
  let text = "";
  for (let i = 1; i <= items.length; i++) {
    text += `Rule number ${i}, ${items[i - 1]} \n`;
  }
  const { speechStatus, start, stop } = useSpeech({
    text: text,
    pitch: 1,
    rate: 1,
    volume: 1,
    lang: "hi-IN",
    voiceURI: "Google हिन्दी",
    autoPlay,
    highlightText,
    pause: async () => {
      setTimeout(() => start(), 2000);
    },
  });
  return (
    <button
      onClick={() => {
        speechStatus !== "started" ? start() : stop();
      }}
      style={{
        background: "none",
        border: "none",
        color: "var(--dark-muted)",
        cursor: "pointer",
        fontSize: "1rem",
        padding: "2px 6px",
      }}
      title={`${speechStatus === "started" ? "Stop" : "Read aloud"}`}
    >
      <i
        className={`bi ${speechStatus == "started" ? "bi-volume-mute text-danger" : "bi-volume-up text-info"}`}
      />
    </button>
  );
}

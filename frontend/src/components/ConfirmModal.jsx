import React from "react";

const ConfirmModal = ({ show, title, message, onConfirm, onCancel }) => {
  if (!show) return null;
  return (
    <div
      className="confirm-modal"
      style={{ position: "fixed", inset: 0, zIndex: 2000 }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
        }}
        onClick={onCancel}
      />
      <div
        style={{
          position: "relative",
          maxWidth: 520,
          margin: "10% auto",
          background: "var(--dark-surface)",
          border: "1px solid var(--dark-border)",
          borderRadius: 12,
          padding: 20,
        }}
      >
        <h5 style={{ marginTop: 0 }}>{title}</h5>
        <p style={{ color: "var(--dark-muted)" }}>{message}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button className="btn btn-outline-green" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-orange" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

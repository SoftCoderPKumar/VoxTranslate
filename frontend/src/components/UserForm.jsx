import React, { useState, useEffect, useRef, use } from "react";

const UserForm = ({ initial = {}, onSave, onCancel }) => {
  const [form, setForm] = useState({ name: "", email: "", isActive: true });
  const formScrollRef = useRef(null);
  useEffect(() => {
    formScrollRef.current?.scrollIntoView({
      behavior: "smooth", // Smooth animation
      block: "start", // Align to top of viewport
      
    });
    if (initial) setForm((f) => ({ ...f, ...initial }));
  }, [initial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="card-dark p-3"
        ref={formScrollRef}
      >
        <h2
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            marginBottom: 4,
            textAlign: "center",
          }}
        >
          <span className="gradient-text">
            {initial?._id ? "Edit User" : "Add User"}
          </span>
        </h2>
        <div className="mb-3">
          <label style={{ color: "var(--dark-muted)", fontWeight: 600 }}>
            Name
          </label>
          <input
            className="form-control-dark"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="mb-3">
          <label style={{ color: "var(--dark-muted)", fontWeight: 600 }}>
            Email
          </label>
          <input
            readOnly={!!initial?._id}
            className="form-control-dark"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="mb-3 d-flex align-items-center gap-2">
          <input
            disabled={!!initial?._id}
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            id="user-active"
          />
          <label htmlFor="user-active" style={{ color: "var(--dark-muted)" }}>
            Active
          </label>
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-outline-green"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-orange">
            Save
          </button>
        </div>
      </form>
    </>
  );
};

export default UserForm;

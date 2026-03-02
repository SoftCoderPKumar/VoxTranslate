import React from "react";

const UserRow = ({ user, onEdit, onDelete, onToggle }) => {
  return (
    <tr>
      <td>{user._id || user.id || "-"}</td>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>{user.active ? "Enabled" : "Disabled"}</td>
      <td>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-outline-green btn-sm"
            onClick={() => onEdit(user)}
          >
            Edit
          </button>
          <button
            className="btn btn-outline-orange btn-sm"
            onClick={() => onDelete(user)}
          >
            Delete
          </button>
          <button className="btn btn-sm" onClick={() => onToggle(user)}>
            {user.active ? "Disable" : "Enable"}
          </button>
        </div>
      </td>
    </tr>
  );
};

export default UserRow;

import React from "react";
import { useAuth } from "../context/AuthContext";

const UserRow = ({ userData, id, onEdit, onDelete, onToggle }) => {
  const { user } = useAuth();
  return (
    <tr>
      <td>{id || "-"}</td>
      <td>{userData.name}</td>
      <td>{userData.email}</td>
      <td>{userData.translationCount}</td>
      <td>
        <span
          className={`badge ${userData.isActive ? "badge-green" : "badge-orange"}`}
        >
          {userData.isActive ? "active" : "inactive"}
        </span>
      </td>
      <td>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-outline-green btn-sm"
            onClick={() => onEdit(userData)}
          >
            Edit
          </button>
          {user.id !== userData._id && (
            <>
              <button
                className="btn btn-outline-orange btn-sm"
                onClick={() => onDelete(userData)}
              >
                Delete
              </button>
              <button
                className={`btn ${userData.isActive ? "btn-outline-green" : "btn-outline-orange"}  btn-sm`}
                onClick={() => onToggle(userData)}
              >
                {userData.isActive ? "Disable" : "Enable"}
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default UserRow;

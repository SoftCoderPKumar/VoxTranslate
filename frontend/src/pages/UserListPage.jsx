import React, { useEffect, useState, useCallback } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import UserRow from "../components/UserRow";
import UserForm from "../components/UserForm";
import ConfirmModal from "../components/ConfirmModal";
import "./UserListPage.css";

const PER_PAGE = 8;

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [confirm, setConfirm] = useState({ show: false, user: null });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/api/user/list?page=${page}&limit=${PER_PAGE}&q=${encodeURIComponent(query)}`,
      );
      setUsers(res.data.users || []);
      setTotal(res.data.pagination.total || 0);
    } catch {
      toast.error("Failed to User list from server.");
    } finally {
      setLoading(false);
      handleStates();
    }
  }, [page, query]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStates = () => {
    setEditing(null);
    setShowForm(false);
    setConfirm({ show: false, user: null });
  };
  const handleAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (u) => {
    setEditing(u);
    setShowForm(true);
  };

  const handleDelete = (u) => {
    setConfirm({ show: true, user: u });
  };

  const confirmDelete = async () => {
    const u = confirm.user;
    try {
      await api.delete(`/api/user/delete/${u._id || u.id}`);
      toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Failed to delete user.");
    } finally {
      handleStates();
    }
  };

  const handleToggle = async (u) => {
    try {
      await api.patch(`/api/user/update`, {
        userId: u._id || u.id,
        isActive: !u.isActive,
      });
      toast.success(`User ${u.isActive ? "disabled" : "enabled"} successfully`);
      fetchUsers();
    } catch {
      toast.error("Failed to toggle user status.");
    } finally {
      handleStates();
    }
  };

  const handleSave = async (data) => {
    try {
      if (editing) {
        await api.patch(`/api/user/update`, {
          userId: editing._id || editing.id,
          name: data.name,
        });
        toast.success("User updated successfully");
        fetchUsers();
      } else {
        await api.post(`/api/user/add`, {
          name: data.name,
          email: data.email,
          isActive: data.isActive,
        });
        toast.success("User created successfully");
      }
      handleStates();
      fetchUsers();
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to save user.";
      toast.error(msg);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="page-wrapper">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 4 }}>
            <span className="gradient-text">Users</span>
          </h2>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="form-control-dark w-auto"
              placeholder="Search by name or email"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
            <button className="btn btn-outline-green" onClick={handleAdd}>
              Add User
            </button>
          </div>
        </div>

        <div className="card-dark p-3">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-orange" />
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table  table-dark table-hover mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Translation Count</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-muted-dark">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((u, i) => (
                        <UserRow
                          key={u._id || u.id}
                          userData={u}
                          id={i + 1}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onToggle={handleToggle}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div style={{ color: "var(--dark-muted)" }}>
                  Page {page} of {totalPages}
                </div>
                <div>
                  <button
                    className="btn btn-sm btn-outline-orange me-2"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Prev
                  </button>
                  <button
                    className="btn btn-sm btn-orange"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {showForm && (
          <div className="mt-3">
            <UserForm
              initial={editing}
              onSave={handleSave}
              onCancel={() => {
                (setShowForm(false), setEditing(null));
              }}
            />
          </div>
        )}

        <ConfirmModal
          show={confirm.show}
          title="Delete user"
          message={`Delete ${confirm.user?.name || ""}? This cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setConfirm({ show: false, user: null })}
        />
      </div>
    </div>
  );
};

export default UserListPage;

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { deleteUser, getAllUsers } from "../../api/admin";
import type { User } from "../../types";
import { extractApiError } from "../../utils/errors";

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      setUsers([]);
      toast.error(extractApiError(error, "No users found"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (email: string) => {
    if (!window.confirm(`Delete user ${email}?`)) return;
    try {
      await deleteUser(email);
      toast.success("User deleted");
      await load();
    } catch (error) {
      toast.error(extractApiError(error));
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">People</p>
          <h1>Registered users</h1>
        </div>
      </header>

      <div className="table-wrap">
        {loading ? (
          <div className="page-center compact">
            <div className="spinner" />
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <h2>No users</h2>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Age</th>
                <th>City</th>
                <th>Role</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.email}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.age}</td>
                  <td>{user.address?.city ?? "—"}</td>
                  <td>
                    <span className="role-pill">{user.role}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => onDelete(user.email)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

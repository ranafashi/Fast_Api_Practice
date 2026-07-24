import { useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { extractApiError } from "../utils/errors";

export function ProfilePage() {
  const { user, refreshMe } = useAuthStore();

  useEffect(() => {
    refreshMe().catch((error) => toast.error(extractApiError(error)));
  }, [refreshMe]);

  if (!user) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page narrow">
      <header className="page-header">
        <div>
          <p className="eyebrow">GET /me</p>
          <h1>Account profile</h1>
        </div>
        <Link to="/orders" className="primary-btn">
          My orders
        </Link>
      </header>

      <div className="profile-panel">
        <dl>
          <div>
            <dt>Name</dt>
            <dd>{user.name}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Age</dt>
            <dd>{user.age}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd className="role-pill">{user.role}</dd>
          </div>
          <div>
            <dt>City</dt>
            <dd>{user.address?.city ?? "—"}</dd>
          </div>
          <div>
            <dt>Postal code</dt>
            <dd>{user.address?.postal_Code ?? "—"}</dd>
          </div>
          {user._id && (
            <div>
              <dt>User ID</dt>
              <dd className="mono">{user._id}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

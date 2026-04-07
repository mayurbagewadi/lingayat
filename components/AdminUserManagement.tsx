import React, { useState, useEffect, useCallback } from 'react';
import styles from './AdminUserManagement.module.css';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  subscription_status: string;
  created_at: string;
  last_login: string;
}

interface AdminUserManagementProps {
  token: string;
}

export default function AdminUserManagement({ token }: AdminUserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filterRole) params.append('role', filterRole);
      if (filterStatus) params.append('status', filterStatus);

      const response = await fetch(`/api/admin/users/list?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.data);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading users');
    } finally {
      setIsLoading(false);
    }
  }, [token, page, searchTerm, filterRole, filterStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateUser = async (
    userId: string,
    updates: { role?: string; subscription_status?: string }
  ) => {
    setUpdatingUser(userId);

    try {
      const response = await fetch('/api/admin/users/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          ...updates
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, ...updates } : u
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating user');
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.filterSection}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <select
            value={filterRole}
            onChange={(e) => {
              setFilterRole(e.target.value);
              setPage(1);
            }}
            className={styles.filterSelect}
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="subscriber">Subscriber</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className={styles.filterSelect}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className={styles.loadingState}>
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No users found</p>
        </div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Subscription</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.full_name}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleUpdateUser(user.id, { role: e.target.value })
                        }
                        disabled={updatingUser === user.id}
                        className={styles.roleSelect}
                      >
                        <option value="user">User</option>
                        <option value="subscriber">Subscriber</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <select
                        value={user.subscription_status}
                        onChange={(e) =>
                          handleUpdateUser(user.id, {
                            subscription_status: e.target.value
                          })
                        }
                        disabled={updatingUser === user.id}
                        className={styles.statusSelect}
                      >
                        <option value="inactive">Inactive</option>
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                      </select>
                    </td>
                    <td className={styles.joinedDate}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                        disabled={updatingUser === user.id}
                      >
                        {updatingUser === user.id ? 'Updating...' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              <span className={styles.pageInfo}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

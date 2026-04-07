'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/lib/hooks/useNotifications';

interface User {
  id: string;
  full_name: string;
  email: string;
  subscription_status?: string;
  subscription_expires_at?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { notifications, unreadCount } = useNotifications(token, !!token);

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (!savedToken) {
      router.push('/auth/login');
      return;
    }
    setToken(savedToken);
    fetchUserData(savedToken);
  }, [router]);

  const fetchUserData = async (authToken: string) => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUser(data.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
      localStorage.removeItem('auth_token');
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/');
  };

  if (isLoading) {
    return (
      <main className="container" style={{ textAlign: 'center', padding: '40px' }}>
        <div className="spinner"></div>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '30px 0' }}>
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="btn btn-secondary">
          Sign Out
        </button>
      </div>

      {user && (
        <div className="grid grid-2" style={{ marginBottom: '30px' }}>
          <div className="card">
            <h2>Profile Information</h2>
            <p><strong>Name:</strong> {user.full_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p>
              <strong>Subscription:</strong>{' '}
              {user.subscription_status === 'active' ? (
                <span style={{ color: '#10b981' }}>Active</span>
              ) : (
                <span style={{ color: '#ef4444' }}>Inactive</span>
              )}
            </p>
            {user.subscription_expires_at && (
              <p>
                <strong>Expires:</strong> {new Date(user.subscription_expires_at).toLocaleDateString()}
              </p>
            )}
            <a href="/profile/edit" className="btn btn-primary" style={{ marginTop: '20px' }}>
              Edit Profile
            </a>
          </div>

          <div className="card">
            <h2>Notifications {unreadCount > 0 && `(${unreadCount})`}</h2>
            {notifications.length > 0 ? (
              <div>
                {notifications.slice(0, 5).map((notif) => (
                  <div key={notif.id} style={{ padding: '10px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <p style={{ fontWeight: 'bold' }}>{notif.title}</p>
                    <p style={{ fontSize: '14px', color: '#666' }}>{notif.message}</p>
                    <p style={{ fontSize: '12px', color: '#999' }}>
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                <a href="/notifications" style={{ color: '#2563eb', marginTop: '10px', display: 'block' }}>
                  View all notifications
                </a>
              </div>
            ) : (
              <p style={{ color: '#666' }}>No notifications</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-3" style={{ marginBottom: '30px' }}>
        <a href="/browse" className="card" style={{ textAlign: 'center', textDecoration: 'none', cursor: 'pointer' }}>
          <h3>👥 Browse Profiles</h3>
          <p>View other member profiles</p>
        </a>

        <a href="/subscription/plans" className="card" style={{ textAlign: 'center', textDecoration: 'none', cursor: 'pointer' }}>
          <h3>🎁 Subscription Plans</h3>
          <p>View and upgrade your plan</p>
        </a>

        <a href="/profile/edit" className="card" style={{ textAlign: 'center', textDecoration: 'none', cursor: 'pointer' }}>
          <h3>📝 Edit Profile</h3>
          <p>Update your information</p>
        </a>
      </div>
    </main>
  );
}

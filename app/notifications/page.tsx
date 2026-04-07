'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/lib/hooks/useNotifications';

export default function NotificationsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const { notifications, unreadCount, markAsRead, isLoading } = useNotifications(
    token,
    !!token
  );

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (!savedToken) {
      router.push('/auth/login');
      return;
    }
    setToken(savedToken);
  }, [router]);

  const handleMarkAllAsRead = () => {
    if (token) {
      markAsRead();
    }
  };

  if (isLoading) {
    return (
      <main className="container" style={{ textAlign: 'center', padding: '40px' }}>
        <div className="spinner"></div>
        <p>Loading notifications...</p>
      </main>
    );
  }

  return (
    <main className="container" style={{ maxWidth: '800px', margin: '40px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Notifications {unreadCount > 0 && `(${unreadCount})`}</h1>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead} className="btn btn-secondary">
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="card"
              style={{
                marginBottom: '15px',
                opacity: notification.read ? 0.6 : 1,
                cursor: 'pointer'
              }}
              onClick={() => {
                if (!notification.read) {
                  markAsRead(notification.id);
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0' }}>
                    {notification.title}
                    {!notification.read && (
                      <span style={{ color: '#2563eb', marginLeft: '10px', fontSize: '12px' }}>●</span>
                    )}
                  </h3>
                  <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                    {notification.message}
                  </p>
                  {notification.relatedUser && (
                    <p style={{ margin: '10px 0', fontSize: '14px', color: '#999' }}>
                      From: {notification.relatedUser.name}
                    </p>
                  )}
                  <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#999' }}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#666' }}>No notifications</p>
        </div>
      )}

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button
          onClick={() => router.push('/dashboard')}
          className="btn btn-secondary"
        >
          Back to Dashboard
        </button>
      </div>
    </main>
  );
}

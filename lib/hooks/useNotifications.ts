import { useCallback, useEffect, useState } from 'react';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedUser?: {
    id: string;
    name: string;
    email: string;
  };
}

interface NotificationResponse {
  success: boolean;
  data: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function useNotifications(token: string | null, enabled: boolean = true) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(
    async (page: number = 1) => {
      if (!token || !enabled) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/notification/list?page=${page}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const data: NotificationResponse = await response.json();
        setNotifications(data.data);
        setUnreadCount(data.unreadCount);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading notifications');
      } finally {
        setIsLoading(false);
      }
    },
    [token, enabled]
  );

  const markAsRead = useCallback(
    async (notificationId?: string) => {
      if (!token) return;

      try {
        const response = await fetch('/api/notification/mark-read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            notification_id: notificationId,
            mark_all: !notificationId
          })
        });

        if (!response.ok) {
          throw new Error('Failed to mark notification as read');
        }

        // Update local state
        if (notificationId) {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notificationId ? { ...n, read: true } : n
            )
          );
        } else {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }
        setUnreadCount(0);
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    },
    [token]
  );

  useEffect(() => {
    if (enabled && token) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => fetchNotifications(), 30000);
      return () => clearInterval(interval);
    }
  }, [fetchNotifications, token, enabled]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead
  };
}

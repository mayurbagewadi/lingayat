import React from 'react';
import { useNotifications } from '../lib/hooks/useNotifications';
import styles from './NotificationPanel.module.css';

interface NotificationPanelProps {
  token: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({
  token,
  isOpen,
  onClose
}: NotificationPanelProps) {
  const { notifications, unreadCount, isLoading, markAsRead } = useNotifications(
    token,
    isOpen
  );

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAsRead();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Notifications</h2>
          {unreadCount > 0 && (
            <button className={styles.markAllBtn} onClick={handleMarkAllAsRead}>
              Mark all as read
            </button>
          )}
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          {isLoading ? (
            <div className={styles.loadingState}>
              <div className="spinner"></div>
              <p>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No notifications yet</p>
            </div>
          ) : (
            <ul className={styles.notificationList}>
              {notifications.map((notif) => (
                <li
                  key={notif.id}
                  className={`${styles.notification} ${
                    !notif.read ? styles.unread : ''
                  }`}
                  onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                >
                  <div className={styles.notifContent}>
                    <h4>{notif.title}</h4>
                    <p>{notif.message}</p>
                    {notif.relatedUser && (
                      <p className={styles.relatedUser}>
                        From: {notif.relatedUser.name}
                      </p>
                    )}
                    <span className={styles.timestamp}>
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {!notif.read && <div className={styles.unreadIndicator} />}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

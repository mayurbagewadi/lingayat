import React, { useState, useEffect } from 'react';
import styles from './GoogleDriveSettings.module.css';

interface GoogleDriveStatus {
  connected: boolean;
  lastVerified: string;
  storageUsed: number;
  storageQuota: number;
  folders: {
    photos: string;
    pdfs: string;
  };
}

interface GoogleDriveSettingsProps {
  token: string;
}

export default function GoogleDriveSettings({ token }: GoogleDriveSettingsProps) {
  const [status, setStatus] = useState<GoogleDriveStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, [token]);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/google-drive/validate', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data.data);
      } else {
        setStatus(null);
      }
    } catch (err) {
      console.error('Error fetching Google Drive status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);

    try {
      const response = await fetch('/api/google-drive/connect', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get OAuth URL');
      }

      const data = await response.json();
      window.location.href = data.oauth_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Google Drive? Users will not be able to upload files.')) {
      return;
    }

    setDisconnecting(true);
    setError(null);

    try {
      const response = await fetch('/api/google-drive/disconnect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      setStatus(null);
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Disconnection failed');
    } finally {
      setDisconnecting(false);
    }
  };

  const handleRefresh = async () => {
    await fetchStatus();
  };

  const storagePercent = status
    ? Math.round((status.storageUsed / status.storageQuota) * 100)
    : 0;

  return (
    <div className={styles.container}>
      {error && <div className="alert alert-error">{error}</div>}

      {isLoading ? (
        <div className={styles.loadingState}>
          <div className="spinner"></div>
          <p>Checking Google Drive status...</p>
        </div>
      ) : status?.connected ? (
        <>
          <div className={styles.statusCard}>
            <div className={styles.statusHeader}>
              <div>
                <h2>✓ Connected</h2>
                <p>Google Drive integration is active</p>
              </div>
              <div className={styles.lastVerified}>
                Last verified: {new Date(status.lastVerified).toLocaleString()}
              </div>
            </div>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3>Storage Usage</h3>
              <div className={styles.storageBar}>
                <div
                  className={styles.storageUsed}
                  style={{ width: `${storagePercent}%` }}
                />
              </div>
              <p>
                {(status.storageUsed / 1024 / 1024 / 1024).toFixed(2)} GB of{' '}
                {(status.storageQuota / 1024 / 1024 / 1024).toFixed(2)} GB
              </p>
            </div>

            <div className={styles.infoCard}>
              <h3>Folders</h3>
              <div className={styles.folderList}>
                <div className={styles.folder}>
                  <span>📷 Photos:</span>
                  <code>{status.folders.photos}</code>
                </div>
                <div className={styles.folder}>
                  <span>📄 PDFs:</span>
                  <code>{status.folders.pdfs}</code>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              className="btn btn-secondary"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              Refresh Status
            </button>
            <button
              className="btn btn-danger"
              onClick={handleDisconnect}
              disabled={disconnecting}
            >
              {disconnecting ? 'Disconnecting...' : 'Disconnect'}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className={styles.disconnectedCard}>
            <h2>❌ Not Connected</h2>
            <p>Google Drive integration is not configured. Users cannot upload photos or PDFs.</p>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleConnect}
            disabled={connecting}
            style={{ width: '100%' }}
          >
            {connecting ? 'Connecting...' : 'Connect Google Drive'}
          </button>

          <div className={styles.helpText}>
            <h3>Setup Instructions</h3>
            <ol>
              <li>Click "Connect Google Drive" button above</li>
              <li>Authorize the application to access your Google Drive</li>
              <li>The system will automatically create photo and PDF folders</li>
              <li>Users can then upload photos and PDFs</li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import styles from './AdminPDFReview.module.css';

interface PendingPDF {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  file_id: string;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_at: string;
  approved_at?: string;
  approved_by?: string;
}

interface AdminPDFReviewProps {
  token: string;
}

export default function AdminPDFReview({ token }: AdminPDFReviewProps) {
  const [pdfs, setPdfs] = useState<PendingPDF[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPendingPDFs();
  }, [token]);

  const fetchPendingPDFs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/pdf/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending PDFs');
      }

      const data = await response.json();
      setPdfs(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading PDFs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setApproving(userId);

    try {
      const response = await fetch('/api/admin/pdf-approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          notes: notes[userId] || ''
        })
      });

      if (!response.ok) {
        throw new Error('Failed to approve PDF');
      }

      // Remove from pending list
      setPdfs(pdfs.filter(pdf => pdf.user_id !== userId));
      setNotes({ ...notes, [userId]: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval failed');
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (userId: string) => {
    // TODO: Implement rejection endpoint
    console.log('Reject PDF for user:', userId);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="spinner"></div>
        <p>Loading pending PDFs...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (pdfs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>📋 No pending PDFs for review</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>Pending PDF Approvals ({pdfs.length})</h2>

      <div className={styles.pdfList}>
        {pdfs.map((pdf) => (
          <div key={pdf.id} className={styles.pdfCard}>
            <div className={styles.cardHeader}>
              <div className={styles.userInfo}>
                <h3>{pdf.user_name}</h3>
                <p>{pdf.user_email}</p>
              </div>
              <span className={styles.uploadDate}>
                {new Date(pdf.uploaded_at).toLocaleDateString()}
              </span>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.formGroup}>
                <label>Review Notes</label>
                <textarea
                  value={notes[pdf.user_id] || ''}
                  onChange={(e) =>
                    setNotes({
                      ...notes,
                      [pdf.user_id]: e.target.value
                    })
                  }
                  placeholder="Optional review notes"
                  rows={3}
                />
              </div>
            </div>

            <div className={styles.cardActions}>
              <button
                className="btn btn-primary"
                onClick={() => handleApprove(pdf.user_id)}
                disabled={approving === pdf.user_id}
              >
                {approving === pdf.user_id ? (
                  <>
                    <span className="spinner"></span>
                    Approving...
                  </>
                ) : (
                  'Approve'
                )}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => handleReject(pdf.user_id)}
                disabled={approving === pdf.user_id}
              >
                Reject
              </button>
              <a
                href={`https://drive.google.com/file/d/${pdf.file_id}/view`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Preview PDF
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

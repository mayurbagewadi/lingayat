import React, { useState, useEffect, useCallback } from 'react';
import styles from './AdminPaymentManagement.module.css';

interface Payment {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  amount: number;
  currency: string;
  status: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  created_at: string;
  completed_at?: string;
}

interface AdminPaymentManagementProps {
  token: string;
}

export default function AdminPaymentManagement({ token }: AdminPaymentManagementProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15'
      });

      if (filterStatus) params.append('status', filterStatus);

      const response = await fetch(`/api/admin/payments?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      const data = await response.json();
      setPayments(data.data);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading payments');
    } finally {
      setIsLoading(false);
    }
  }, [token, page, filterStatus]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: '#10b981',
      pending: '#f59e0b',
      failed: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getTotalRevenue = () => {
    return payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <p>Total Payments</p>
          <span>{payments.length}</span>
        </div>
        <div className={styles.statCard}>
          <p>Completed</p>
          <span>{payments.filter((p) => p.status === 'completed').length}</span>
        </div>
        <div className={styles.statCard}>
          <p>Pending</p>
          <span>{payments.filter((p) => p.status === 'pending').length}</span>
        </div>
        <div className={styles.statCard}>
          <p>Revenue</p>
          <span>₹{getTotalRevenue()}</span>
        </div>
      </div>

      <div className={styles.filterSection}>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPage(1);
          }}
          className={styles.filterSelect}
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {isLoading ? (
        <div className={styles.loadingState}>
          <div className="spinner"></div>
          <p>Loading payments...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No payments found</p>
        </div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User Email</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Order ID</th>
                  <th>Payment ID</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                    <td>{payment.user_email}</td>
                    <td>₹{payment.amount}</td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{ backgroundColor: getStatusColor(payment.status) }}
                      >
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className={styles.monoFont}>{payment.razorpay_order_id.slice(0, 15)}...</td>
                    <td className={styles.monoFont}>
                      {payment.razorpay_payment_id
                        ? payment.razorpay_payment_id.slice(0, 15) + '...'
                        : '—'}
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

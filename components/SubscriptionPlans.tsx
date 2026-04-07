import React, { useState, useEffect } from 'react';
import styles from './SubscriptionPlans.module.css';

interface Plan {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  features: string[];
  description: string;
}

interface SubscriptionPlansProps {
  onSelectPlan: (planId: string) => void;
  isLoading?: boolean;
}

export default function SubscriptionPlans({
  onSelectPlan,
  isLoading = false
}: SubscriptionPlansProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscription/plans');

      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }

      const data = await response.json();
      setPlans(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading plans');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="spinner"></div>
        <p>Loading subscription plans...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (plans.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No subscription plans available</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Choose Your Plan</h2>
        <p>Select a subscription to access all features</p>
      </div>

      <div className={styles.plansGrid}>
        {plans.map((plan) => (
          <div key={plan.id} className={styles.planCard}>
            <div className={styles.planHeader}>
              <h3>{plan.name}</h3>
              <p className={styles.description}>{plan.description}</p>
            </div>

            <div className={styles.pricing}>
              <span className={styles.price}>₹{plan.price}</span>
              <span className={styles.duration}>
                for {plan.duration_days} days
              </span>
            </div>

            <div className={styles.features}>
              <h4>Features:</h4>
              <ul>
                {plan.features?.map((feature, index) => (
                  <li key={index}>
                    <span className={styles.checkmark}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => onSelectPlan(plan.id)}
              disabled={isLoading}
              style={{ width: '100%' }}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                'Choose Plan'
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

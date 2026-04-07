'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SubscriptionPlans from '@/components/SubscriptionPlans';

export default function PlansPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    setToken(savedToken);
  }, []);

  const handleSelectPlan = (planId: string) => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    router.push(`/subscription/checkout?plan=${planId}`);
  };

  return (
    <main className="container">
      <div style={{ textAlign: 'center', margin: '40px 0' }}>
        <h1>Subscription Plans</h1>
        <p style={{ color: '#666', fontSize: '18px' }}>
          Choose a plan that fits your needs
        </p>
      </div>

      <SubscriptionPlans
        onSelectPlan={handleSelectPlan}
        isLoading={isLoading}
      />

      <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '40px' }}>
        <button
          onClick={() => router.push('/')}
          className="btn btn-secondary"
        >
          Back to Home
        </button>
      </div>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PaymentHandler from '@/components/PaymentHandler';

interface Plan {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  features: string[];
}

interface OrderData {
  orderId: string;
  amount: number;
  currency: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan');
  const [token, setToken] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (!savedToken) {
      router.push('/auth/login');
      return;
    }
    setToken(savedToken);
    initializeCheckout(savedToken);
  }, [router, planId]);

  const initializeCheckout = async (authToken: string) => {
    if (!planId) {
      setError('No plan selected');
      setIsLoading(false);
      return;
    }

    try {
      // Fetch plan details
      const planResponse = await fetch(`/api/subscription/plans`);
      if (!planResponse.ok) throw new Error('Failed to fetch plans');

      const planData = await planResponse.json();
      const selectedPlan = planData.data?.find((p: any) => p.id === planId);
      if (!selectedPlan) throw new Error('Plan not found');

      setPlan(selectedPlan);

      // Fetch user details
      const userResponse = await fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (!userResponse.ok) throw new Error('Failed to fetch user data');

      const userData = await userResponse.json();
      setUser(userData.data);

      // Create order
      const orderResponse = await fetch('/api/subscription/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ plan_id: planId }),
      });

      if (!orderResponse.ok) throw new Error('Failed to create order');

      const orderInfo = await orderResponse.json();
      setOrderData(orderInfo.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    router.push(`/subscription/success?payment=${paymentId}`);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  if (isLoading) {
    return (
      <main className="container" style={{ textAlign: 'center', padding: '40px' }}>
        <div className="spinner"></div>
        <p>Loading checkout...</p>
      </main>
    );
  }

  return (
    <main className="container" style={{ maxWidth: '600px', margin: '40px auto' }}>
      {error && <div className="alert alert-error">{error}</div>}

      {plan && user && orderData ? (
        <div className="grid grid-2" style={{ gap: '30px' }}>
          <div className="card">
            <h2>Order Summary</h2>
            <div style={{ marginBottom: '20px' }}>
              <p><strong>Plan:</strong> {plan.name}</p>
              <p><strong>Duration:</strong> {plan.duration_days} days</p>
              <p><strong>Price:</strong> ₹{plan.price}</p>
              <p><strong>Order ID:</strong> {orderData.orderId}</p>
            </div>
            <div style={{
              padding: '15px',
              backgroundColor: '#f0f9ff',
              borderRadius: '6px',
              borderLeft: '4px solid #3b82f6'
            }}>
              <p><strong>Total Amount:</strong> ₹{orderData.amount}</p>
            </div>
          </div>

          <PaymentHandler
            orderId={orderData.orderId}
            amount={orderData.amount}
            currency={orderData.currency}
            userEmail={user.email}
            userName={user.full_name}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>Unable to load checkout information</p>
          <button
            onClick={() => router.push('/subscription/plans')}
            className="btn btn-primary"
            style={{ marginTop: '20px' }}
          >
            Back to Plans
          </button>
        </div>
      )}
    </main>
  );
}

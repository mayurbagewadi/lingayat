'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get('payment');

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="container" style={{ maxWidth: '500px', margin: '80px auto' }}>
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>✓</div>
        <h1 style={{ color: '#10b981', marginBottom: '20px' }}>Payment Successful!</h1>
        <p style={{ marginBottom: '10px' }}>Thank you for your subscription.</p>
        {paymentId && (
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
            Payment ID: {paymentId}
          </p>
        )}
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Redirecting to your dashboard in 5 seconds...
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="btn btn-primary"
        >
          Go to Dashboard
        </button>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="container" style={{ textAlign: 'center', padding: '40px' }}><div className="spinner"></div></div>}>
      <SuccessContent />
    </Suspense>
  );
}

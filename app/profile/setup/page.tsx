'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileSetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (!savedToken) {
      router.push('/auth/signup');
      return;
    }
    setToken(savedToken);
  }, [router]);

  const handleNext = () => {
    if (currentStep === 2) {
      router.push('/profile/edit');
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    router.push('/subscription/plans');
  };

  return (
    <main className="container" style={{ maxWidth: '600px', margin: '80px auto' }}>
      <div className="card">
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
          Welcome to Lingayat Mali Matrimonial
        </h1>

        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#999' }}>Step {currentStep} of 2</p>
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: '#e5e7eb',
            borderRadius: '2px',
            overflow: 'hidden',
            marginTop: '10px'
          }}>
            <div style={{
              width: `${(currentStep / 2) * 100}%`,
              height: '100%',
              backgroundColor: '#2563eb',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>

        {currentStep === 1 ? (
          <div>
            <h2 style={{ marginBottom: '20px' }}>Let's Get Started</h2>
            <div style={{
              backgroundColor: '#f0f9ff',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h3 style={{ marginTop: 0 }}>What we need from you:</h3>
              <ul style={{ marginBottom: 0 }}>
                <li>A clear, recent photo</li>
                <li>Your personal information</li>
                <li>Your interests and preferences</li>
                <li>Optional: Verification documents</li>
              </ul>
            </div>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Creating a complete profile increases your chances of finding the right match.
              All information is kept private and secure.
            </p>
          </div>
        ) : (
          <div>
            <h2 style={{ marginBottom: '20px' }}>Choose Your Subscription</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              To access full features and browse profiles, you'll need an active subscription.
            </p>
            <div style={{
              backgroundColor: '#fef3c7',
              padding: '15px',
              borderRadius: '6px',
              borderLeft: '4px solid #f59e0b'
            }}>
              <p style={{ margin: 0, color: '#78350f' }}>
                <strong>Tip:</strong> Start with our basic plan to explore the community!
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
          <button
            onClick={handleSkip}
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            Skip for now
          </button>
          <button
            onClick={handleNext}
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            {currentStep === 2 ? 'Choose Plan' : 'Continue'}
          </button>
        </div>
      </div>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import SubscriptionPlans from '@/components/SubscriptionPlans';
import ProfileCard from '@/components/ProfileCard';
import { useNotifications } from '@/lib/hooks/useNotifications';

interface Profile {
  id: string;
  name: string;
  photoUrl: string;
  photoCount: number;
}

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { unreadCount } = useNotifications(token, !!token);

  useEffect(() => {
    // Check if user is logged in
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    setToken(savedToken);
  }, []);

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);
    if (token) {
      // Redirect to checkout or payment page
      window.location.href = `/subscription/checkout?plan=${planId}`;
    } else {
      window.location.href = '/auth/login';
    }
  };

  const handleViewProfile = (userId: string) => {
    window.location.href = `/profile/${userId}`;
  };

  const handleExpress = (userId: string) => {
    if (!token) {
      window.location.href = '/auth/login';
      return;
    }
    // Handle express interest
    window.location.href = `/profile/${userId}/interest`;
  };

  return (
    <main className="container">
      <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '40px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '10px' }}>
          Lingayat Mali Matrimonial
        </h1>
        <p style={{ fontSize: '18px', color: '#666' }}>
          Find your perfect match in our community
        </p>
        {unreadCount > 0 && (
          <p style={{ color: '#2563eb', marginTop: '10px' }}>
            You have {unreadCount} new notifications
          </p>
        )}
      </div>

      {!token ? (
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2>Subscribe to Get Started</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Choose a plan that suits your needs
          </p>
          <SubscriptionPlans
            onSelectPlan={handleSelectPlan}
            isLoading={isLoading}
          />
          <div style={{ marginTop: '30px' }}>
            <p>Already have an account? <a href="/auth/login" style={{ color: '#2563eb' }}>Sign In</a></p>
          </div>
        </div>
      ) : (
        <div>
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ marginBottom: '20px' }}>Browse Profiles</h2>
            {profiles.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {profiles.map(profile => (
                  <ProfileCard
                    key={profile.id}
                    id={profile.id}
                    name={profile.name}
                    photoUrl={profile.photoUrl}
                    photoCount={profile.photoCount}
                    onViewProfile={handleViewProfile}
                    onExpress={handleExpress}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <p>Loading profiles...</p>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

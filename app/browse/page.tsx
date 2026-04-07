'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProfileCard from '@/components/ProfileCard';

interface Profile {
  id: string;
  name: string;
  photoUrl: string;
  photoCount: number;
}

export default function BrowseProfilesPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (!savedToken) {
      router.push('/auth/login');
      return;
    }
    setToken(savedToken);
    fetchProfiles(savedToken, 1);
  }, [router]);

  const fetchProfiles = async (authToken: string, pageNum: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/profiles/browse?page=${pageNum}&limit=12`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }

      const data = await response.json();
      setProfiles(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading profiles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProfile = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  const handleExpress = async (userId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/profiles/${userId}/interest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to express interest');
      }

      // Show success message or update UI
      alert('Interest expressed successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error expressing interest');
    }
  };

  return (
    <main className="container">
      <div style={{ margin: '30px 0' }}>
        <h1>Browse Profiles</h1>
        <p style={{ color: '#666' }}>Discover matrimonial matches in our community</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner"></div>
          <p>Loading profiles...</p>
        </div>
      ) : profiles.length > 0 ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            {profiles.map(profile => (
              <ProfileCard
                key={profile.id}
                id={profile.id}
                name={profile.name}
                photoUrl={profile.photoUrl}
                photoCount={profile.photoCount}
                onViewProfile={handleViewProfile}
                onExpress={handleExpress}
              />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setPage(page - 1);
                if (token) fetchProfiles(token, page - 1);
              }}
              disabled={page === 1}
              style={{ marginRight: '10px' }}
            >
              Previous
            </button>
            <span style={{ margin: '0 10px' }}>Page {page}</span>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setPage(page + 1);
                if (token) fetchProfiles(token, page + 1);
              }}
              disabled={profiles.length < 12}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>No profiles available</p>
        </div>
      )}
    </main>
  );
}

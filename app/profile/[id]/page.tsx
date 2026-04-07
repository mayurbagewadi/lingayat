'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

interface ProfileDetail {
  id: string;
  full_name: string;
  email: string;
  age?: number;
  height?: string;
  occupation?: string;
  location?: string;
  bio?: string;
  photos: Array<{ id: string; url: string }>;
}

export default function ProfileDetailPage() {
  const router = useRouter();
  const params = useParams();
  const profileId = params.id as string;
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (!savedToken) {
      router.push('/auth/login');
      return;
    }
    setToken(savedToken);
    fetchProfile(savedToken);
  }, [router, profileId]);

  const fetchProfile = async (authToken: string) => {
    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });

      if (!response.ok) {
        throw new Error('Profile not found');
      }

      const data = await response.json();
      setProfile(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpressInterest = async () => {
    if (!token) return;

    try {
      const response = await fetch(`/api/profiles/${profileId}/interest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to express interest');
      }

      alert('Interest expressed successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error expressing interest');
    }
  };

  if (isLoading) {
    return (
      <main className="container" style={{ textAlign: 'center', padding: '40px' }}>
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container" style={{ textAlign: 'center', padding: '40px' }}>
        <div className="alert alert-error">{error}</div>
        <button
          onClick={() => router.push('/browse')}
          className="btn btn-primary"
          style={{ marginTop: '20px' }}
        >
          Back to Browse
        </button>
      </main>
    );
  }

  return (
    <main className="container" style={{ maxWidth: '800px', margin: '40px auto' }}>
      {profile && (
        <div className="grid grid-2" style={{ gap: '30px' }}>
          <div>
            {profile.photos && profile.photos.length > 0 ? (
              <div style={{ marginBottom: '20px' }}>
                {profile.photos.map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.url}
                    alt="Profile photo"
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder.jpg';
                    }}
                    style={{
                      width: '100%',
                      borderRadius: '8px',
                      marginBottom: '10px',
                      maxHeight: '400px',
                      objectFit: 'cover'
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p>No photos available</p>
              </div>
            )}
          </div>

          <div>
            <h1 style={{ marginBottom: '20px' }}>{profile.full_name}</h1>

            <div className="card">
              {profile.age && <p><strong>Age:</strong> {profile.age}</p>}
              {profile.height && <p><strong>Height:</strong> {profile.height}</p>}
              {profile.occupation && <p><strong>Occupation:</strong> {profile.occupation}</p>}
              {profile.location && <p><strong>Location:</strong> {profile.location}</p>}

              {profile.bio && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                  <h3>About</h3>
                  <p style={{ color: '#666', lineHeight: '1.6' }}>{profile.bio}</p>
                </div>
              )}

              <div style={{ marginTop: '30px' }}>
                <button
                  onClick={handleExpressInterest}
                  className="btn btn-primary"
                  style={{ width: '100%', marginBottom: '10px' }}
                >
                  Express Interest
                </button>
                <button
                  onClick={() => router.push('/browse')}
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                >
                  Back to Browse
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

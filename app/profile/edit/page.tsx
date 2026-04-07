'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PhotoUpload from '@/components/PhotoUpload';
import PDFUpload from '@/components/PDFUpload';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  age?: number;
  height?: string;
  occupation?: string;
  location?: string;
  bio?: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UserProfile>({
    id: '',
    full_name: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (!savedToken) {
      router.push('/auth/login');
      return;
    }
    setToken(savedToken);
    fetchProfile(savedToken);
  }, [router]);

  const fetchProfile = async (authToken: string) => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data.data);
      setFormData(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setError('');
      setSuccess('');

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating profile');
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

  return (
    <main className="container" style={{ maxWidth: '800px', margin: '40px auto' }}>
      <h1 style={{ marginBottom: '30px' }}>Edit Profile</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '30px' }}>
          <h2 style={{ marginBottom: '20px' }}>Personal Information</h2>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={formData.email}
              disabled
              style={{ backgroundColor: '#f5f5f5' }}
            />
          </div>

          <div className="form-group">
            <label>Age</label>
            <input
              type="number"
              name="age"
              value={formData.age || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Height</label>
            <input
              type="text"
              name="height"
              placeholder="e.g., 5'8\""
              value={formData.height || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Occupation</label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>About Me</label>
            <textarea
              name="bio"
              value={formData.bio || ''}
              onChange={handleChange}
              rows={5}
              placeholder="Tell us about yourself..."
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </form>

      {token && (
        <>
          <div className="card" style={{ marginBottom: '30px' }}>
            <h2 style={{ marginBottom: '20px' }}>Upload Photos</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {[1, 2, 3, 4].map((photoNum) => (
                <PhotoUpload
                  key={photoNum}
                  photoNumber={photoNum}
                  token={token}
                  onSuccess={() => {
                    setSuccess('Photo uploaded successfully!');
                    setTimeout(() => setSuccess(''), 3000);
                  }}
                  onError={(err) => setError(err)}
                />
              ))}
            </div>
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '20px' }}>Upload Documents</h2>
            <PDFUpload
              token={token}
              onSuccess={() => {
                setSuccess('Document uploaded successfully!');
                setTimeout(() => setSuccess(''), 3000);
              }}
              onError={(err) => setError(err)}
            />
          </div>
        </>
      )}

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button
          onClick={() => router.push('/dashboard')}
          className="btn btn-secondary"
        >
          Back to Dashboard
        </button>
      </div>
    </main>
  );
}

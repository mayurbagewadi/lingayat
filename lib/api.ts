const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiOptions extends RequestInit {
  token?: string;
}

export async function apiCall<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: any = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error?.message || `API Error: ${response.status}`);
  }

  return response.json();
}

export async function uploadPhoto(
  file: File,
  photoNumber: number,
  token: string
): Promise<{ fileId: string; url: string; uploadedAt: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('photo_number', photoNumber.toString());

  const response = await fetch(`${API_URL}/api/photo/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error?.message || 'Photo upload failed');
  }

  const data = await response.json();
  return data.data;
}

export async function getPhotoUrl(
  userId: string,
  photoNumber: number,
  token: string
): Promise<{ url: string }> {
  return apiCall(`/api/photo/${userId}/${photoNumber}`, {
    method: 'GET',
    token,
  });
}

export async function uploadPDF(
  file: File,
  token: string
): Promise<{ fileId: string; status: string; uploadedAt: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/api/pdf/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error?.message || 'PDF upload failed');
  }

  const data = await response.json();
  return data.data;
}

export async function getPDFUrl(
  userId: string,
  token: string
): Promise<{ url: string; status: string }> {
  return apiCall(`/api/pdf/${userId}`, {
    method: 'GET',
    token,
  });
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<{ access_token: string; expires_in: number }> {
  return apiCall('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

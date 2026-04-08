import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const photoNumber = formData.get('photo_number') as string;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
  }

  const filename = `photos/${Date.now()}-photo${photoNumber}.jpg`;

  const blob = await put(filename, file, {
    access: 'public',
    contentType: 'image/jpeg',
  });

  return NextResponse.json({
    data: {
      fileId: blob.url,
      url: blob.url,
      uploadedAt: new Date().toISOString(),
    },
  });
}

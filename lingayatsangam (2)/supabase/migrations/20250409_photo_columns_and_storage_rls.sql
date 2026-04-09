-- Add missing photo columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS photo_1_file_id text,
ADD COLUMN IF NOT EXISTS photo_2_file_id text,
ADD COLUMN IF NOT EXISTS photo_3_file_id text,
ADD COLUMN IF NOT EXISTS photo_4_file_id text,
ADD COLUMN IF NOT EXISTS photo_5_file_id text;

-- Storage RLS policies for photos bucket
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Anyone can view photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

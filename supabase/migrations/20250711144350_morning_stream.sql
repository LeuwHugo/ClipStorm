-- Storage policies for campaign-images bucket
-- Run these SQL commands in your Supabase SQL Editor

-- Policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload campaign images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'campaign-images' 
  AND auth.role() = 'authenticated'
);

-- Policy to allow public read access to campaign images
CREATE POLICY "Allow public read access to campaign images" ON storage.objects
FOR SELECT USING (bucket_id = 'campaign-images');

-- Policy to allow users to update their own uploads (optional)
CREATE POLICY "Allow users to update their own campaign images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'campaign-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
) WITH CHECK (
  bucket_id = 'campaign-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow users to delete their own uploads (optional)
CREATE POLICY "Allow users to delete their own campaign images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'campaign-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
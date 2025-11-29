-- Create storage bucket for menu item images
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-items', 'menu-items', true);

-- RLS policies for menu items bucket
CREATE POLICY "Anyone can view menu item images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-items');

CREATE POLICY "Authenticated users can upload menu item images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'menu-items' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Restaurant owners can update their menu item images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'menu-items' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Restaurant owners can delete their menu item images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'menu-items' AND
  auth.uid() IS NOT NULL
);
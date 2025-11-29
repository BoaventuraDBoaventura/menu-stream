-- Create storage bucket for restaurant logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-logos', 'restaurant-logos', true);

-- RLS policies for restaurant logos bucket
CREATE POLICY "Anyone can view restaurant logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-logos');

CREATE POLICY "Authenticated users can upload restaurant logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'restaurant-logos' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Restaurant owners can update their logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'restaurant-logos' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Restaurant owners can delete their logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'restaurant-logos' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Function to generate unique slug from restaurant name
CREATE OR REPLACE FUNCTION public.generate_restaurant_slug(restaurant_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert to lowercase and replace spaces with hyphens
  base_slug := lower(regexp_replace(restaurant_name, '[^a-zA-Z0-9]+', '-', 'g'));
  
  -- Remove leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Check if slug exists and append number if needed
  WHILE EXISTS (SELECT 1 FROM public.restaurants WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;
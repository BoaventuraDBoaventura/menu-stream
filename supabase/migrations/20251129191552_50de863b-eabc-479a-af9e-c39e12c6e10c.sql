-- Allow unauthenticated users to view active restaurants by slug for public menu access
CREATE POLICY "Public can view active restaurants by slug"
ON public.restaurants
FOR SELECT
TO anon
USING (is_active = true);